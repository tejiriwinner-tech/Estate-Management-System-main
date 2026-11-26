import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureServiceChargeTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS service_charges (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      resident_name VARCHAR(255) NOT NULL,
      unit_number VARCHAR(100) DEFAULT 'Villa A-402',
      service_type VARCHAR(255) NOT NULL,
      amount NUMERIC(12, 2) NOT NULL DEFAULT 35000,
      billing_cycle VARCHAR(50) DEFAULT 'Monthly',
      due_date DATE,
      status VARCHAR(30) DEFAULT 'Pending',
      invoice_no VARCHAR(80),
      notes TEXT,
      receipt_url TEXT,
      receipt_name VARCHAR(255),
      payment_reference VARCHAR(120),
      paid_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE service_charges ADD COLUMN IF NOT EXISTS receipt_url TEXT`;
  await sql`ALTER TABLE service_charges ADD COLUMN IF NOT EXISTS receipt_name VARCHAR(255)`;
  await sql`ALTER TABLE service_charges ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(120)`;
  await sql`ALTER TABLE service_charges ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP`;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "resident"; // "resident" | "store"
    const callerEmail = (req.headers.get("x-user-email") || "").toLowerCase().trim();

    await ensureServiceChargeTable();

    let rows: any[] = [];
    if (scope === "store") {
      rows = await sql`
        SELECT * FROM service_charges
        WHERE LOWER(unit_number) LIKE '%shop%' OR LOWER(unit_number) LIKE '%plaza%' OR LOWER(resident_name) LIKE '%mart%'
        ORDER BY created_at DESC
      `;
    } else {
      let targetUserId: number | null = null;
      if (callerEmail) {
        const u = await sql`SELECT id FROM users WHERE LOWER(email) = ${callerEmail} LIMIT 1`;
        if (u.length > 0) targetUserId = Number(u[0].id);
      }

      rows = targetUserId
        ? await sql`
            SELECT * FROM service_charges
            WHERE user_id = ${targetUserId}
            ORDER BY created_at DESC
          `
        : await sql`
            SELECT * FROM service_charges
            WHERE LOWER(unit_number) NOT LIKE '%shop%' AND LOWER(unit_number) NOT LIKE '%plaza%'
            ORDER BY created_at DESC
            LIMIT 15
          `;
    }

    return NextResponse.json({
      data: rows.map((r) => ({
        id: Number(r.id),
        resident_name: r.resident_name,
        unit_number: r.unit_number,
        service_type: r.service_type,
        amount: Number(r.amount),
        billing_cycle: r.billing_cycle || "Monthly",
        due_date: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : null,
        status: r.status || "Pending",
        invoice_no: r.invoice_no || `SC-2026-${r.id}`,
        notes: r.notes || "",
        receipt_url: r.receipt_url || null,
        receipt_name: r.receipt_name || null,
        payment_reference: r.payment_reference || null,
        paid_at: r.paid_at || null,
      })),
    });
  } catch (err: any) {
    console.warn("Resident service charges fallback:", err.message);
    return NextResponse.json({
      data: [
        {
          id: 1,
          resident_name: "Chinedu Resident",
          unit_number: "Villa A-402",
          service_type: "Monthly Estate Security & Maintenance Levy",
          amount: 35000,
          billing_cycle: "Monthly",
          due_date: "2026-11-30",
          status: "Pending",
          invoice_no: "SC-2026-1041",
          notes: "24/7 perimeter patrol, ANPR gate maintenance & street illumination",
          receipt_url: null,
          receipt_name: null,
          payment_reference: null,
          paid_at: null,
        },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, receipt_url = null, receipt_name = null, payment_reference = null } = body;
    if (!id) {
      return NextResponse.json({ message: "Service charge ID is required." }, { status: 400 });
    }
    await ensureServiceChargeTable();

    const ref =
      (typeof payment_reference === "string" && payment_reference.trim()) ||
      `RCP-SC-${Date.now().toString().slice(-6)}`;

    await sql`
      UPDATE service_charges
      SET
        status = 'Paid',
        receipt_url = COALESCE(${receipt_url || null}, receipt_url),
        receipt_name = COALESCE(${receipt_name || null}, receipt_name),
        payment_reference = ${ref},
        paid_at = COALESCE(paid_at, NOW()),
        updated_at = NOW()
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({
      data: {
        id: Number(id),
        status: "Paid",
        receipt_no: ref,
        receipt_url: receipt_url || null,
        receipt_name: receipt_name || null,
      },
      message: receipt_url
        ? "Payment confirmed and receipt uploaded successfully."
        : "Service charge cleared successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not process service charge payment.", error: err.message }, { status: 500 });
  }
}

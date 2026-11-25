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
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
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
      if (rows.length === 0) {
        await sql`
          INSERT INTO service_charges (user_id, resident_name, unit_number, service_type, amount, billing_cycle, due_date, status, invoice_no, notes)
          VALUES
            (null, 'Lincoln Central Mart', 'Commercial Plaza Shop A-01', 'Commercial Plaza Security, Waste & Power Levy', 45000, 'Monthly', CURRENT_DATE + INTERVAL '7 days', 'Pending', 'SC-SHOP-2041', 'Covers 24/7 commercial grid backup, loading bay security & sanitation'),
            (null, 'Lincoln Central Mart', 'Commercial Plaza Shop A-01', 'Commercial Plaza Security, Waste & Power Levy', 45000, 'Monthly', CURRENT_DATE - INTERVAL '23 days', 'Paid', 'SC-SHOP-1988', 'Cleared via merchant settlement')
        `;
        rows = await sql`
          SELECT * FROM service_charges
          WHERE LOWER(unit_number) LIKE '%shop%' OR LOWER(unit_number) LIKE '%plaza%' OR LOWER(resident_name) LIKE '%mart%'
          ORDER BY created_at DESC
        `;
      }
    } else {
      let targetUserId: number | null = null;
      if (callerEmail) {
        const u = await sql`SELECT id FROM users WHERE LOWER(email) = ${callerEmail} LIMIT 1`;
        if (u.length > 0) targetUserId = Number(u[0].id);
      }

      rows = targetUserId
        ? await sql`
            SELECT * FROM service_charges
            WHERE user_id = ${targetUserId} OR unit_number = 'Villa A-402'
            ORDER BY created_at DESC
          `
        : await sql`
            SELECT * FROM service_charges
            WHERE LOWER(unit_number) NOT LIKE '%shop%' AND LOWER(unit_number) NOT LIKE '%plaza%'
            ORDER BY created_at DESC
            LIMIT 15
          `;

      if (rows.length === 0) {
        await sql`
          INSERT INTO service_charges (user_id, resident_name, unit_number, service_type, amount, billing_cycle, due_date, status, invoice_no, notes)
          VALUES
            (2, 'Chinedu Resident', 'Villa A-402', 'Monthly Estate Security & Maintenance Levy', 35000, 'Monthly', CURRENT_DATE + INTERVAL '7 days', 'Pending', 'SC-2026-1041', '24/7 perimeter patrol, ANPR gate maintenance & street illumination'),
            (2, 'Chinedu Resident', 'Villa A-402', 'Waste & Environmental Sanitation', 15000, 'Monthly', CURRENT_DATE - INTERVAL '15 days', 'Paid', 'SC-2026-0988', 'Verified unit sanitation clearance')
        `;
        rows = await sql`
          SELECT * FROM service_charges
          WHERE LOWER(unit_number) NOT LIKE '%shop%' AND LOWER(unit_number) NOT LIKE '%plaza%'
          ORDER BY created_at DESC
        `;
      }
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
        },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id } = body;
    await ensureServiceChargeTable();

    await sql`
      UPDATE service_charges
      SET status = 'Paid', updated_at = NOW()
      WHERE id = ${Number(id)}
    `;

    return NextResponse.json({
      data: {
        id: Number(id),
        status: "Paid",
        receipt_no: `RCP-SC-${Date.now().toString().slice(-6)}`,
      },
      message: "Service charge cleared successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not process service charge payment.", error: err.message }, { status: 500 });
  }
}

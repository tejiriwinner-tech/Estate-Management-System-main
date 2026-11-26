import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
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
    const userId = searchParams.get("user_id");

    await ensureTable();

    const rows = userId
      ? await sql`
          SELECT * FROM service_charges
          WHERE user_id = ${Number(userId)}
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT * FROM service_charges
          ORDER BY created_at DESC
        `;

    return NextResponse.json({
      data: rows.map((r) => ({
        id: r.id,
        user_id: r.user_id,
        resident_name: r.resident_name,
        unit_number: r.unit_number,
        service_type: r.service_type,
        amount: Number(r.amount),
        billing_cycle: r.billing_cycle,
        due_date: r.due_date ? new Date(r.due_date).toISOString().split("T")[0] : null,
        status: r.status,
        invoice_no: r.invoice_no,
        notes: r.notes,
        receipt_url: r.receipt_url || null,
        receipt_name: r.receipt_name || null,
        payment_reference: r.payment_reference || null,
        paid_at: r.paid_at || null,
        created_at: r.created_at,
      })),
    });
  } catch (err: any) {
    console.warn("Service charges GET fallback:", err.message);
    return NextResponse.json({
      data: [
        {
          id: 1,
          user_id: 2,
          resident_name: "Chinedu Resident",
          unit_number: "Villa A-402",
          service_type: "Monthly Estate Security & Maintenance Levy",
          amount: 35000,
          billing_cycle: "Monthly",
          due_date: "2026-11-30",
          status: "Pending",
          invoice_no: "SC-2026-1041",
          notes: "Standard monthly estate security & common area upkeep",
        },
      ],
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      target = "single", // "single" | "all"
      user_id,
      resident_name = "Estate Member",
      unit_number = "-",
      service_type = "Monthly Security & Estate Maintenance",
      amount = 35000,
      billing_cycle = "Monthly",
      due_date = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      notes = "",
    } = body;

    await ensureTable();

    if (target === "all") {
      // Bill all active residents in users table
      const residents = await sql`
        SELECT id, name, unit_number FROM users WHERE role = 'resident'
      `;
      const created = [];
      for (const r of residents) {
        const inv = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const ins = await sql`
          INSERT INTO service_charges (user_id, resident_name, unit_number, service_type, amount, billing_cycle, due_date, status, invoice_no, notes)
          VALUES (${r.id}, ${r.name}, ${r.unit_number || "Assigned Unit"}, ${service_type}, ${Number(amount)}, ${billing_cycle}, ${due_date}, 'Pending', ${inv}, ${notes})
          RETURNING *
        `;
        if (ins[0]) created.push(ins[0]);
      }

      return NextResponse.json({
        data: created,
        message: `Service charge billed to ${created.length} estate member(s).`,
      });
    }

    const invoiceNo = `SC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const inserted = await sql`
      INSERT INTO service_charges (user_id, resident_name, unit_number, service_type, amount, billing_cycle, due_date, status, invoice_no, notes)
      VALUES (${user_id ? Number(user_id) : null}, ${resident_name}, ${unit_number}, ${service_type}, ${Number(amount)}, ${billing_cycle}, ${due_date}, 'Pending', ${invoiceNo}, ${notes})
      RETURNING *
    `;

    return NextResponse.json({
      data: inserted[0],
      message: "Service charge assigned successfully.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not create service charge.", error: err.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body;
    await ensureTable();

    const updated = await sql`
      UPDATE service_charges
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({
      data: updated[0],
      message: `Service charge marked as ${status}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update charge.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    await ensureTable();

    if (id) {
      await sql`DELETE FROM service_charges WHERE id = ${Number(id)}`;
    }
    return NextResponse.json({ ok: true, message: "Service charge removed." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not remove charge.", error: err.message }, { status: 500 });
  }
}

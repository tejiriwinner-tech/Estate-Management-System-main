import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureGuestPassesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS guest_passes (
      id SERIAL PRIMARY KEY,
      guest_name VARCHAR(255) NOT NULL,
      invited_by VARCHAR(255),
      purpose VARCHAR(120) DEFAULT 'Social Visit',
      code VARCHAR(40) NOT NULL,
      pin VARCHAR(20),
      valid_from TIMESTAMP DEFAULT NOW(),
      valid_until TIMESTAMP,
      status VARCHAR(30) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS invited_by VARCHAR(255)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS purpose VARCHAR(120) DEFAULT 'Social Visit'`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS pin VARCHAR(20)`;
}

export async function GET(req: NextRequest) {
  try {
    await ensureGuestPassesTable();
    const { searchParams } = new URL(req.url);
    const invitedBy = (searchParams.get("invited_by") || "").trim();
    const status = (searchParams.get("status") || "").trim();

    let rows: any[] = [];
    if (invitedBy) {
      rows = await sql`
        SELECT * FROM guest_passes
        WHERE LOWER(COALESCE(invited_by, '')) LIKE ${`%${invitedBy.toLowerCase()}%`}
        ORDER BY id DESC
        LIMIT 50
      `;
    } else if (status) {
      rows = await sql`
        SELECT * FROM guest_passes
        WHERE status = ${status}
        ORDER BY id DESC
        LIMIT 50
      `;
    } else {
      rows = await sql`SELECT * FROM guest_passes ORDER BY id DESC LIMIT 50`;
    }

    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ data: [], error: err.message }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureGuestPassesTable();
    const body = await req.json();
    const { name, invited_by, purpose, code: requestedCode, pin, expires_in_minutes } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ message: "Visitor name is required." }, { status: 422 });
    }

    const code = String(requestedCode || `PAHE-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const validUntil = new Date(
      Date.now() + (expires_in_minutes ? Number(expires_in_minutes) * 60000 : 86400000)
    ).toISOString();

    const res = await sql`
      INSERT INTO guest_passes (guest_name, invited_by, purpose, code, pin, valid_from, valid_until, status, created_at, updated_at)
      VALUES (${String(name).trim()}, ${invited_by || "Estate Resident"}, ${purpose || "Social Visit"}, ${code}, ${pin || null}, NOW(), ${validUntil}, 'active', NOW(), NOW())
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Guest pass created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create guest pass.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureGuestPassesTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "Pass id is required." }, { status: 400 });
    }
    await sql`UPDATE guest_passes SET status = 'revoked', updated_at = NOW() WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Visitor pass revoked." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not revoke pass.", error: err.message }, { status: 500 });
  }
}

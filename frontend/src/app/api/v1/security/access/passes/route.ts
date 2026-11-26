import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { insertAccessLog } from "@/lib/security/accessLogsDb";

export const dynamic = "force-dynamic";

let tableEnsured = false;

async function ensureGuestPassesTable() {
  if (tableEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS guest_passes (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      guest_name VARCHAR(255),
      invited_by VARCHAR(255),
      kind VARCHAR(40) DEFAULT 'visitor',
      purpose VARCHAR(120) DEFAULT 'Social Visit',
      code VARCHAR(40),
      pin VARCHAR(20),
      valid_from TIMESTAMP DEFAULT NOW(),
      valid_until TIMESTAMP,
      expires_at TIMESTAMP,
      status VARCHAR(30) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS name VARCHAR(255)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS invited_by VARCHAR(255)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS kind VARCHAR(40) DEFAULT 'visitor'`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS purpose VARCHAR(120) DEFAULT 'Social Visit'`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS code VARCHAR(40)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS pin VARCHAR(20)`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS valid_from TIMESTAMP DEFAULT NOW()`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS valid_until TIMESTAMP`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'active'`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW()`;
  await sql`ALTER TABLE guest_passes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`;

  const reqCols = await sql`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'guest_passes'
      AND is_nullable = 'NO'
      AND column_default IS NULL
      AND column_name <> 'id'
  `;
  for (const c of reqCols) {
    await sql.unsafe(`ALTER TABLE guest_passes ALTER COLUMN "${c.column_name}" DROP NOT NULL`).catch(() => {});
  }
  tableEnsured = true;
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

    const normalized = rows.map((p: any) => ({
      ...p,
      guest_name: p.guest_name || p.name || "Visitor",
      name: p.name || p.guest_name || "Visitor",
      valid_until: p.valid_until || p.expires_at || null,
      code: p.code || `PASS-${p.id}`,
    }));

    return NextResponse.json({ data: normalized });
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

    const visitorName = String(name).trim();
    const code = String(requestedCode || `PAHE-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
    const validUntil = new Date(
      Date.now() + (expires_in_minutes ? Number(expires_in_minutes) * 60000 : 86400000)
    ).toISOString();

    const res = await sql`
      INSERT INTO guest_passes (
        name, guest_name, invited_by, kind, purpose, code, pin,
        valid_from, valid_until, expires_at, status, created_at, updated_at
      )
      VALUES (
        ${visitorName}, ${visitorName}, ${invited_by || "Estate Resident"}, 'visitor',
        ${purpose || "Social Visit"}, ${code}, ${pin || null},
        NOW(), ${validUntil}, ${validUntil}, 'active', NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Guest pass created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create guest pass.", error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureGuestPassesTable();
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const action = String(body.action || "").trim();

    if (!id || !["check_out", "confirm_exit"].includes(action)) {
      return NextResponse.json({ message: "Valid pass id and action are required." }, { status: 400 });
    }

    const existing = await sql`SELECT * FROM guest_passes WHERE id = ${id} LIMIT 1`;
    if (existing.length === 0) {
      return NextResponse.json({ message: "Visitor pass not found." }, { status: 404 });
    }

    const p = existing[0];
    const guestName = p.guest_name || p.name || "Visitor";
    const host = p.invited_by || "Resident";
    const code = p.code || `PASS-${p.id}`;
    const nextStatus = action === "check_out" ? "checked_out" : "confirmed_out";

    const updated = await sql`
      UPDATE guest_passes
      SET status = ${nextStatus}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    await insertAccessLog({
      name: guestName,
      role: "Visitor",
      gate: "Gate 1",
      direction: "out",
      status: "granted",
      verificationType: action === "check_out" ? "Security Exit Verify" : "Resident Exit Confirm",
      reason:
        action === "check_out"
          ? `Visitor Check-Out ${code} • Host: ${host}`
          : `Resident Confirmed Exit ${code} • Host: ${host}`,
    }).catch(() => {});

    return NextResponse.json({
      data: updated[0],
      message:
        action === "check_out"
          ? `${guestName} checked out at Gate 1.`
          : `Exit confirmed for ${guestName}.`,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update visitor pass.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureGuestPassesTable();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "Pass id required." }, { status: 400 });

    await sql`UPDATE guest_passes SET status = 'revoked', updated_at = NOW() WHERE id = ${Number(id)}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not revoke pass.", error: err.message }, { status: 500 });
  }
}

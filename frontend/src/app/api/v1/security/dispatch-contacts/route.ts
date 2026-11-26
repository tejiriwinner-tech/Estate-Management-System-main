import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS security_dispatch_contacts (
      id SERIAL PRIMARY KEY,
      role VARCHAR(150) NOT NULL,
      desk VARCHAR(150) NOT NULL DEFAULT '',
      contact VARCHAR(60) NOT NULL,
      sort_order INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureTable();
    const rows = await sql`
      SELECT id, role, desk, contact, sort_order, updated_at
      FROM security_dispatch_contacts
      ORDER BY sort_order ASC, id ASC
    `;
    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not load dispatch contacts.", error: err?.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const role = String(body.role || "").trim();
    const desk = String(body.desk || "").trim();
    const contact = String(body.contact || "").trim();

    if (!role || !contact) {
      return NextResponse.json(
        { message: "Role/Title and Phone Number are required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      INSERT INTO security_dispatch_contacts (role, desk, contact, created_at, updated_at)
      VALUES (${role}, ${desk}, ${contact}, NOW(), NOW())
      RETURNING id, role, desk, contact, sort_order, updated_at
    `;
    return NextResponse.json({ data: rows[0] }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not create dispatch contact.", error: err?.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureTable();
    const body = await req.json().catch(() => ({}));
    const id = Number(body.id);
    const role = String(body.role || "").trim();
    const desk = String(body.desk || "").trim();
    const contact = String(body.contact || "").trim();

    if (!id || !role || !contact) {
      return NextResponse.json(
        { message: "Contact ID, Role/Title, and Phone Number are required." },
        { status: 400 }
      );
    }

    const rows = await sql`
      UPDATE security_dispatch_contacts
      SET role = ${role}, desk = ${desk}, contact = ${contact}, updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, role, desk, contact, sort_order, updated_at
    `;
    if (rows.length === 0) {
      return NextResponse.json({ message: "Contact not found." }, { status: 404 });
    }
    return NextResponse.json({ data: rows[0] });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not update dispatch contact.", error: err?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureTable();
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let id = queryId ? Number(queryId) : 0;
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = Number(body.id);
    }
    if (!id) {
      return NextResponse.json({ message: "Contact ID is required." }, { status: 400 });
    }

    await sql`DELETE FROM security_dispatch_contacts WHERE id = ${id}`;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not delete dispatch contact.", error: err?.message },
      { status: 500 }
    );
  }
}

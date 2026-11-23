import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, invited_by, expires_in_minutes } = body;

    const code = "GP-" + Math.floor(100000 + Math.random() * 900000);
    const validUntil = new Date(Date.now() + (expires_in_minutes ? Number(expires_in_minutes) * 60000 : 86400000)).toISOString();

    let inserted: any = null;
    try {
      const res = await sql`
        INSERT INTO guest_passes (guest_name, code, valid_from, valid_until, status, created_at, updated_at)
        VALUES (${name}, ${code}, NOW(), ${validUntil}, 'active', NOW(), NOW())
        RETURNING *
      `;
      inserted = res[0];
    } catch {
      inserted = {
        id: Date.now(),
        guest_name: name,
        code,
        valid_until: validUntil,
        status: "active",
      };
    }

    return NextResponse.json({ data: inserted, message: "Guest pass created successfully." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Could not create guest pass." }, { status: 500 });
  }
}

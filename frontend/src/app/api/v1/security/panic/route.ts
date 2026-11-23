import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const location = body.location || "Sector A - North Gate";
    const note = body.note || "OFFICER ASSISTANCE PANIC BUTTON PRESSED";
    const userId = body.user_id || 3;

    const panic = await sql`
      INSERT INTO panic_alerts (
        user_id, location, note, status, created_at, updated_at
      )
      VALUES (
        ${userId}, ${location}, ${note}, 'active', NOW(), NOW()
      )
      RETURNING *
    `;

    await sql`
      INSERT INTO estate_alerts (
        sender_id, category, message, location, status, created_at, updated_at
      )
      VALUES (
        ${userId}, 'life_threat', ${note}, ${location}, 'open', NOW(), NOW()
      )
    `;

    return NextResponse.json({
      success: true,
      data: panic[0],
      message: "Unit dispatched to " + location,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not record security panic.", error: err.message }, { status: 500 });
  }
}

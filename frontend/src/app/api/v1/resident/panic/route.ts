import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const location = body.location || "Villa A-402, Post Army House Estate";
    const note = body.note || "RESIDENT PANIC EMERGENCY TRIGGERED";
    const userId = body.user_id || 2;

    const panic = await sql`
      INSERT INTO panic_alerts (
        user_id, location, note, status, created_at, updated_at
      )
      VALUES (
        ${userId}, ${location}, ${note}, 'active', NOW(), NOW()
      )
      RETURNING *
    `;

    // Also broadcast to estate_alerts table
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
      message: "Emergency response team dispatched to your location.",
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not record panic alert.", error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let activities: any[] = [];
    try {
      activities = await sql`
        SELECT id, staff_name, action_text, target_entity, timestamp_display, dot_color, created_at
        FROM staff_activities
        ORDER BY id DESC
        LIMIT 10
      `;
    } catch (e: any) {
      console.error("Staff activities error:", e.message);
    }

    return NextResponse.json({ data: activities });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff activities.", error: err.message }, { status: 500 });
  }
}

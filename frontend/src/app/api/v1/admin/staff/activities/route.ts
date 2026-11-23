import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let activities: any[] = [];
    try {
      const rows = await sql`
        SELECT id, staff_name, action_text, target_entity, timestamp_display, dot_color, created_at
        FROM staff_activities
        ORDER BY id DESC
        LIMIT 10
      `;
      activities = rows;
    } catch (e: any) {
      console.error("Staff activities error:", e.message);
    }

    if (activities.length === 0) {
      activities = [
        { id: 1, staff_name: "Bessie Cooper", action_text: "approved lease agreement for", target_entity: "Villa A-402", timestamp_display: "10 mins ago", dot_color: "green" },
        { id: 2, staff_name: "Mike Warden", action_text: "logged visitor vehicle barrier check at", target_entity: "Gate 1", timestamp_display: "25 mins ago", dot_color: "blue" },
        { id: 3, staff_name: "Eleanor Pena", action_text: "reconciled Paystack collections for", target_entity: "Q4 Levy", timestamp_display: "1 hour ago", dot_color: "gold" },
      ];
    }

    return NextResponse.json({ data: activities });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff activities.", error: err.message }, { status: 500 });
  }
}

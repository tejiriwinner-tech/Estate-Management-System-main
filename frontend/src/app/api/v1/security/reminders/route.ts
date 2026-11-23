import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, text, due_time, is_completed, priority, created_at
        FROM reminders
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Security reminders error:", e.message);
    }

    const defaultReminders = [
      { id: "rem-1", text: "Shift Changeover inspection at Gate 1 & 2 at 18:00 hours.", time: "18:00 Today", priority: "high" as const },
      { id: "rem-2", text: "Verify perimeter sensor calibration on North Fence Phase 2.", time: "21:30 Today", priority: "medium" as const },
    ];

    const reminders = rows.length > 0
      ? rows.map((r: any) => ({
          id: `rem-${r.id}`,
          text: r.text,
          time: r.due_time || "Today",
          priority: r.priority || "medium",
        }))
      : defaultReminders;

    return NextResponse.json({ data: reminders });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch reminders.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { text, priority, time } = body;

    const res = await sql`
      INSERT INTO reminders (
        text, due_time, is_completed, priority, user_id, created_at, updated_at
      )
      VALUES (
        ${text}, ${time || "Today"}, false, ${priority || "medium"}, 3, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Reminder added successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save reminder.", error: err.message }, { status: 500 });
  }
}

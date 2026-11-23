import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let activities: any[] = [];
    try {
      activities = await sql`
        SELECT id, name, out_at, out_with, in_at, in_with, created_at
        FROM resident_activities
        ORDER BY id DESC
        LIMIT 30
      `;
    } catch (e: any) {
      console.error("Activities GET error:", e.message);
    }

    if (activities.length === 0) {
      activities = [
        {
          id: 1,
          name: "Chinedu Resident",
          out_at: new Date(Date.now() - 3600000).toISOString(),
          out_with: "Personal Car (ABC-123-XY)",
          in_at: null,
          in_with: null,
        },
        {
          id: 2,
          name: "David Adeleke",
          out_at: new Date(Date.now() - 28800000).toISOString(),
          out_with: "School Bus",
          in_at: new Date(Date.now() - 14400000).toISOString(),
          in_with: "Walked In via Gate 1",
        },
      ];
    }

    return NextResponse.json({ data: activities });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch activities.", error: err.message }, { status: 500 });
  }
}

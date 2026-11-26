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

    return NextResponse.json({ data: activities });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch activities.", error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, direction, companions, occurred_at, gate } = body;

    try {
      if (direction === "out") {
        await sql`
          INSERT INTO resident_activities (user_id, name, out_at, out_with, created_at, updated_at)
          VALUES (2, ${name || "Resident"}, ${occurred_at || new Date().toISOString()}, ${companions || "Solo"}, NOW(), NOW())
        `;
      } else {
        await sql`
          INSERT INTO resident_activities (user_id, name, in_at, in_with, created_at, updated_at)
          VALUES (2, ${name || "Resident"}, ${occurred_at || new Date().toISOString()}, ${companions || "Solo"}, NOW(), NOW())
        `;
      }
    } catch (e: any) {
      console.warn("Access log insert DB err:", e.message);
    }

    return NextResponse.json({ message: "Activity logged successfully.", data: body });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not log access activity.", error: err.message }, { status: 500 });
  }
}

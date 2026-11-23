import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, out_with, user_id } = body;

    const res = await sql`
      INSERT INTO resident_activities (
        user_id, name, out_at, out_with, created_at, updated_at
      )
      VALUES (
        ${user_id || 2}, ${name || "Resident"}, NOW(), ${out_with || "Vehicle"}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Movement check-out recorded." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not record movement.", error: err.message }, { status: 500 });
  }
}

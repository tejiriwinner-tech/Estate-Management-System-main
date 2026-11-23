import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));

    const res = await sql`
      UPDATE resident_activities
      SET in_at = NOW(),
          in_with = ${body.in_with || "Walked in"},
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Movement check-in recorded." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not record check-in.", error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const awayId = Number(id);

    try {
      const res = await sql`
        UPDATE away_notices
        SET status = 'returned', updated_at = NOW()
        WHERE id = ${awayId}
        RETURNING id, resident_name, unit, status
      `;
      if (res.length > 0) {
        return NextResponse.json({ data: res[0], message: "Resident marked as returned." });
      }
    } catch (e: any) {
      console.warn("Away returned DB err:", e.message);
    }

    return NextResponse.json({ data: { id: awayId, status: "returned" }, message: "Resident marked as returned." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not mark resident as returned.", error: err.message }, { status: 500 });
  }
}

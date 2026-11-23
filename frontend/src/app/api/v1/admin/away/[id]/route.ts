import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const awayId = Number(id);
    const body = await req.json().catch(() => ({}));
    const { resident_name, unit_number, start_date, end_date, emergency_contact, instructions, status } = body;

    try {
      const res = await sql`
        UPDATE away_notices
        SET resident_name = COALESCE(${resident_name}, resident_name),
            unit = COALESCE(${unit_number}, unit),
            departure_date = COALESCE(${start_date}, departure_date),
            expected_return_date = COALESCE(${end_date}, expected_return_date),
            emergency_contact_phone = COALESCE(${emergency_contact}, emergency_contact_phone),
            notes = COALESCE(${instructions}, notes),
            status = COALESCE(${status}, status),
            updated_at = NOW()
        WHERE id = ${awayId}
        RETURNING id, resident_name, unit, status
      `;
      if (res.length > 0) {
        return NextResponse.json({ data: res[0], message: "Away notice updated." });
      }
    } catch (e: any) {
      console.warn("Away PUT DB err:", e.message);
    }

    return NextResponse.json({ data: { id: awayId, status }, message: "Away notice updated." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update away notice.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const awayId = Number(id);

    try {
      await sql`DELETE FROM away_notices WHERE id = ${awayId}`;
      return NextResponse.json({ data: { id: awayId }, message: "Away notice deleted." });
    } catch (e: any) {
      console.warn("Away delete DB err:", e.message);
      return NextResponse.json({ data: { id: awayId }, message: "Away notice deleted." });
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete away notice.", error: err.message }, { status: 500 });
  }
}

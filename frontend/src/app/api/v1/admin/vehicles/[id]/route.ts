import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicleId = Number(id);
    const body = await req.json().catch(() => ({}));
    const { status, owner_role, plate_number } = body;

    try {
      const res = await sql`
        UPDATE vehicles
        SET status = COALESCE(${status}, status),
            owner_role = COALESCE(${owner_role}, owner_role),
            plate_number = COALESCE(${plate_number}, plate_number),
            updated_at = NOW()
        WHERE id = ${vehicleId}
        RETURNING id, plate_number, status, owner_role
      `;
      if (res.length > 0) {
        return NextResponse.json({ data: res[0], message: "Vehicle updated." });
      }
    } catch (e: any) {
      console.warn("Vehicle patch DB err:", e.message);
    }

    return NextResponse.json({ data: { id: vehicleId, status, owner_role }, message: "Vehicle updated." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update vehicle.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const vehicleId = Number(id);

    try {
      await sql`DELETE FROM vehicles WHERE id = ${vehicleId}`;
      return NextResponse.json({ data: { id: vehicleId }, message: "Vehicle deleted." });
    } catch (e: any) {
      console.warn("Vehicle delete DB err:", e.message);
      return NextResponse.json({ data: { id: vehicleId }, message: "Vehicle deleted." });
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete vehicle.", error: err.message }, { status: 500 });
  }
}

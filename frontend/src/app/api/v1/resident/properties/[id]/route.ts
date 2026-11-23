import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM resident_properties WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Property deleted." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete property.", error: err.message }, { status: 500 });
  }
}

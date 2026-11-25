import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM listings WHERE id = ${Number(id)}`;
    return NextResponse.json({ ok: true, message: "Listing deleted." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete listing.", error: err.message }, { status: 500 });
  }
}

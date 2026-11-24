import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM meeting_reports WHERE id = ${Number(id)}`.catch(() => {});
    return NextResponse.json({ data: { ok: true }, ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete notice.", error: err.message }, { status: 500 });
  }
}

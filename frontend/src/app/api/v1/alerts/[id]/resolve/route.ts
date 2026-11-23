import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`UPDATE estate_alerts SET status = 'resolved', updated_at = NOW() WHERE id = ${Number(id)}`;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not resolve alert.", error: err.message }, { status: 500 });
  }
}

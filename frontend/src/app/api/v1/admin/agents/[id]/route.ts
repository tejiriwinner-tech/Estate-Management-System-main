import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const status = String(body.status || "Active").toLowerCase();

    await sql`
      UPDATE users
      SET status = ${status}, updated_at = NOW()
      WHERE id = ${Number(id.replace(/\D/g, "")) || 0}
    `.catch(() => {});

    return NextResponse.json({
      data: { id, status: body.status || "Active" },
      ok: true,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update agent status.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${Number(id.replace(/\D/g, "")) || 0}`.catch(() => {});
    return NextResponse.json({ data: { id, ok: true }, ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not remove agent.", error: err.message }, { status: 500 });
  }
}

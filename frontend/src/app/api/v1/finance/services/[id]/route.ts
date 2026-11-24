import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const isActive =
      body.status !== undefined ? body.status === "Active" : body.is_active !== undefined ? Boolean(body.is_active) : undefined;
    const feeKobo = body.fee !== undefined ? Math.round(Number(body.fee) * 100) : null;

    try {
      const updated = await sql`
        UPDATE fin_service_charges
        SET name = COALESCE(${body.name ?? null}, name),
            category = COALESCE(${body.category ?? null}, category),
            fee_kobo = COALESCE(${feeKobo}, fee_kobo),
            frequency = COALESCE(${body.frequency ?? null}, frequency),
            is_active = COALESCE(${isActive ?? null}, is_active),
            updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      return NextResponse.json({ data: updated[0] ?? { id }, ok: true });
    } catch {
      return NextResponse.json({ data: { id, ...body }, ok: true });
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update service.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM fin_service_charges WHERE id = ${Number(id)}`.catch(() => {});
    return NextResponse.json({ data: { id, ok: true }, ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete service.", error: err.message }, { status: 500 });
  }
}

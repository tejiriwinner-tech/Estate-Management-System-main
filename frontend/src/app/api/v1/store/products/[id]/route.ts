import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const numericId = Number(String(id).replace(/\D/g, ""));
    const priceKobo = body.price !== undefined ? Math.round(Number(body.price) * 100) : null;

    if (numericId > 0) {
      await sql`
        UPDATE store_products
        SET name = COALESCE(${body.name ?? null}, name),
            category = COALESCE(${body.category ?? null}, category),
            price_kobo = COALESCE(${priceKobo}, price_kobo),
            stock = COALESCE(${body.stock !== undefined ? Number(body.stock) : null}, stock),
            description = COALESCE(${body.description ?? null}, description),
            image = COALESCE(${body.image ?? null}, image),
            updated_at = NOW()
        WHERE id = ${numericId}
      `.catch(() => {});
    }

    return NextResponse.json({ data: { id, ...body }, ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update product.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const numericId = Number(String(id).replace(/\D/g, ""));
    if (numericId > 0) {
      await sql`DELETE FROM store_products WHERE id = ${numericId}`.catch(() => {});
    }
    return NextResponse.json({ data: { id, ok: true }, ok: true });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete product.", error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const availability = body.availability || "available";

    let commission: number | null = null;
    try {
      const updated = await sql`
        UPDATE listings
        SET availability = ${availability}, updated_at = NOW()
        WHERE id = ${Number(id)}
        RETURNING price, listing_type
      `;
      if (updated.length > 0 && availability === "rented") {
        commission = Math.round(Number(updated[0].price || 3500000) * 0.1);
      }
    } catch {
      if (availability === "rented") commission = 350000;
    }

    return NextResponse.json({
      data: { id, availability, commission },
      commission,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update listing availability.", error: err.message }, { status: 500 });
  }
}

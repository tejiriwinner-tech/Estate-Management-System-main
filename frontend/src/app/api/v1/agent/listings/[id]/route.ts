import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const priceKobo = Math.round(Number(body.price || body.rentPerYear || 0) * 100);

    const updated = await sql`
      UPDATE listings
      SET
        title = COALESCE(${body.title ?? null}, title),
        listing_type = COALESCE(${body.listing_type ?? null}, listing_type),
        property_type = COALESCE(${body.property_type ?? null}, property_type),
        zone = COALESCE(${body.zone ?? null}, zone),
        address = COALESCE(${body.address ?? null}, address),
        beds = COALESCE(${body.beds ? Number(body.beds) : null}, beds),
        baths = COALESCE(${body.baths ? Number(body.baths) : null}, baths),
        price_kobo = ${priceKobo > 0 ? priceKobo : null},
        updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      data: updated[0] || { id, ...body },
      message: "Listing updated successfully.",
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update listing.", error: err.message }, { status: 500 });
  }
}

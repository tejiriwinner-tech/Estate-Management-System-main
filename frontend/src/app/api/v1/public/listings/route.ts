import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const listingType = searchParams.get("listing_type");
    const beds = searchParams.get("beds");
    const maxPrice = searchParams.get("max_price");
    const q = searchParams.get("q");

    try {
      const rows = await sql`
        SELECT l.*, u.name as agent_name, u.email as agent_email, u.phone as agent_phone
        FROM listings l
        LEFT JOIN users u ON l.agent_id = u.id
        WHERE l.approval_status = 'approved'
        ORDER BY l.created_at DESC
        LIMIT 50
      `;

      if (rows && rows.length > 0) {
        let items = rows.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          listing_type: r.listing_type,
          property_type: r.property_type,
          zone: r.zone,
          address: r.address,
          beds: r.beds ? Number(r.beds) : null,
          baths: r.baths ? Number(r.baths) : null,
          price: r.price_kobo ? Number(r.price_kobo) / 100 : Number(r.price || 0),
          price_period: r.price_period,
          availability: r.availability || "available",
          approval_status: r.approval_status,
          rejection_reason: r.rejection_reason,
          photos: typeof r.photos === "string" ? JSON.parse(r.photos) : (r.photos || []),
          agent: r.agent_name ? { id: r.agent_id, name: r.agent_name, email: r.agent_email, phone: r.agent_phone } : undefined,
          created_at: r.created_at,
        }));

        if (listingType) items = items.filter((i: any) => i.listing_type === listingType);
        if (beds) items = items.filter((i: any) => (i.beds || 0) >= Number(beds));
        if (maxPrice) items = items.filter((i: any) => i.price <= Number(maxPrice));
        if (q) {
          const query = q.toLowerCase();
          items = items.filter((i: any) =>
            i.title?.toLowerCase().includes(query) ||
            i.address?.toLowerCase().includes(query) ||
            i.zone?.toLowerCase().includes(query)
          );
        }

        return NextResponse.json({
          data: items,
          meta: { page: 1, last_page: 1, total: items.length },
        });
      }
    } catch (dbErr) {
      console.warn("Database listings query failed:", dbErr);
    }

    return NextResponse.json({
      data: [],
      meta: { page: 1, last_page: 1, total: 0 },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const FALLBACK_LISTINGS = [
  {
    id: 1,
    title: "Luxury 4-Bedroom Terrace Duplex",
    description: "Beautifully finished modern terrace duplex located in the serene Phase 1 zone of Post Army House Estate. Features 24/7 power, treated water, and dedicated security.",
    listing_type: "rent",
    property_type: "Duplex",
    zone: "Phase 1",
    address: "Plot 14, Palm Crescent",
    beds: 4,
    baths: 4,
    price: 4500000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Executive 3-Bedroom Furnished Apartment",
    description: "Spacious modern flat with premium fittings, all rooms en-suite, fitted kitchen with heat extractor, and ample parking space.",
    listing_type: "rent",
    property_type: "Apartment",
    zone: "Phase 1",
    address: "Block B4, Royal Avenue",
    beds: 3,
    baths: 3,
    price: 3200000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Contemporary 5-Bedroom Detached Villa",
    description: "Ultra-luxury smart home with private pool, solar inverter system, cinema room, and two-room boys quarters.",
    listing_type: "sale",
    property_type: "Villa",
    zone: "Phase 2",
    address: "12 Kingfisher Drive",
    beds: 5,
    baths: 6,
    price: 185000000,
    price_period: null,
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
  {
    id: 4,
    title: "Charming 2-Bedroom Serviced Flat",
    description: "Ideal for young professionals. Fully serviced with round-the-clock power, facility management, and high-speed fiber internet.",
    listing_type: "rent",
    property_type: "Apartment",
    zone: "Phase 2",
    address: "Flat 2A, Emerald Court",
    beds: 2,
    baths: 2,
    price: 2200000,
    price_period: "per_year",
    availability: "available",
    approval_status: "approved",
    rejection_reason: null,
    photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80"],
    agent: { id: 1, name: "Marcus Reed", email: "agent@lincolnestate.ng", phone: "+234 804 567 8901" },
    created_at: new Date().toISOString(),
  },
];

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
      console.warn("Database listings query fallback to sample listings:", dbErr);
    }

    // Fallback to sample listings
    let filtered = [...FALLBACK_LISTINGS];
    if (listingType) filtered = filtered.filter((i) => i.listing_type === listingType);
    if (beds) filtered = filtered.filter((i) => (i.beds || 0) >= Number(beds));
    if (maxPrice) filtered = filtered.filter((i) => i.price <= Number(maxPrice));
    if (q) {
      const query = q.toLowerCase();
      filtered = filtered.filter(
        (i) => i.title.toLowerCase().includes(query) || i.address.toLowerCase().includes(query) || i.zone.toLowerCase().includes(query)
      );
    }

    return NextResponse.json({
      data: filtered,
      meta: { page: 1, last_page: 1, total: filtered.length },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

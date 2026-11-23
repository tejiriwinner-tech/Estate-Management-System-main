import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "pending";

    let rows: any[] = [];
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;

    try {
      rows = await sql`
        SELECT l.*, u.name as agent_name, u.email as agent_email, u.phone as agent_phone
        FROM listings l
        LEFT JOIN users u ON u.id = l.agent_id
        WHERE l.approval_status = ${status}
        ORDER BY l.created_at DESC
      `;

      const counts = await sql`
        SELECT approval_status, COUNT(*)::int as count
        FROM listings
        GROUP BY approval_status
      `;

      counts.forEach((c: any) => {
        if (c.approval_status === "pending") pendingCount = c.count;
        if (c.approval_status === "approved") approvedCount = c.count;
        if (c.approval_status === "rejected") rejectedCount = c.count;
      });
    } catch (e: any) {
      console.error("Listings queue error:", e.message);
    }

    const formatted = rows.map((r: any) => ({
      id: Number(r.id),
      title: r.title,
      description: r.description,
      listing_type: r.listing_type || "rent",
      property_type: r.property_type || "Apartment",
      zone: r.zone || "Phase 1",
      address: r.address || "Lincoln Estate",
      beds: Number(r.beds || 3),
      baths: Number(r.baths || 2),
      price: Math.round(Number(r.price_kobo ? Number(r.price_kobo) / 100 : r.price || 3500000)),
      price_period: r.price_period || "per_year",
      availability: r.availability || "available",
      approval_status: r.approval_status || "pending",
      rejection_reason: r.rejection_reason,
      photos: Array.isArray(r.photos) ? r.photos : ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"],
      agent: {
        id: Number(r.agent_id || 4),
        name: r.agent_name || "Marcus Reed",
        email: r.agent_email || "agent@lincolnestate.ng",
        phone: r.agent_phone || "+234 804 567 8901",
      },
      created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
    }));

    return NextResponse.json({
      data: formatted,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch approval queue.", error: err.message }, { status: 500 });
  }
}

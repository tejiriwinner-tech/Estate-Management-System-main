import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { Listing, ClientRequest, PortalViewing, EarningsPoint } from "@/types/agentPortal";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let listings: Listing[] = [];
    try {
      const rows = await sql`SELECT * FROM listings ORDER BY created_at DESC LIMIT 20`;
      if (rows && rows.length > 0) {
        listings = rows.map((r: any) => ({
          id: String(r.id),
          title: r.title,
          type: (r.property_type || "Apartment") as any,
          zone: r.zone || "Phase 1",
          address: r.address || "Post Army House Estate",
          beds: Number(r.beds || 3),
          baths: Number(r.baths || 2),
          rentPerYear: Number(r.price_kobo ? Number(r.price_kobo) / 100 : r.price || 3500000),
          status: (r.availability === "available" ? "Available" : r.availability === "under_offer" ? "Under Offer" : "Rented") as any,
          listedOn: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "2026-11-01",
          views: Number(r.views || 45),
          inquiries: Number(r.inquiries || 6),
          approval: (r.approval_status || "approved") as any,
          listingType: (r.listing_type || "rent") as any,
        }));
      }
    } catch (e) {
      // Fallback below
    }

    let requests: ClientRequest[] = [];
    try {
      const reqRows = await sql`SELECT * FROM client_requests ORDER BY id DESC LIMIT 20`;
      requests = reqRows.map((r: any) => ({
        id: String(r.id),
        clientName: r.client_name || "Prospective Tenant",
        phone: r.phone || "—",
        email: r.email || "",
        propertyType: r.property_type || "Apartment",
        minBeds: Number(r.min_beds || 2),
        zone: r.zone || "Army Estate Phase 1",
        maxBudget: Number(r.max_budget || 0),
        moveInBy: r.move_in_by || "",
        note: r.note || "",
        status: r.status || "New",
        receivedOn: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "",
      }));
    } catch {
      requests = [];
    }

    let viewings: PortalViewing[] = [];
    try {
      const vwRows = await sql`SELECT * FROM viewings ORDER BY id DESC LIMIT 20`;
      viewings = vwRows.map((v: any) => ({
        id: String(v.id),
        listingId: String(v.listing_id || ""),
        requestId: String(v.client_request_id || ""),
        clientName: v.client_name || "Client",
        date: v.date || "",
        time: v.time || "",
        status: v.status || "Scheduled",
      }));
    } catch {
      viewings = [];
    }

    const earnings: EarningsPoint[] = [];

    const data = {
      agent: { name: "Estate Agent", zone: "Army Estate Phase 1 – 5" },
      listings,
      requests,
      viewings,
      earnings,
      paidListingIds: [],
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

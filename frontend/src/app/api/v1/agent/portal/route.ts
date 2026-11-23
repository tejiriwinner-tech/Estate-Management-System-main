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
          address: r.address || "Lincoln Estate",
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

    if (listings.length === 0) {
      listings = [
        {
          id: "lst-1",
          title: "Executive 3-Bedroom Flat",
          type: "Apartment",
          zone: "Phase 1",
          address: "Block B4, Royal Avenue",
          beds: 3,
          baths: 3,
          rentPerYear: 3200000,
          status: "Available",
          listedOn: "2026-11-10",
          views: 64,
          inquiries: 8,
          approval: "approved",
          listingType: "rent",
        },
        {
          id: "lst-2",
          title: "Luxury 4-Bedroom Terrace Duplex",
          type: "Duplex",
          zone: "Phase 1",
          address: "Plot 14, Palm Crescent",
          beds: 4,
          baths: 4,
          rentPerYear: 4500000,
          status: "Under Offer",
          listedOn: "2026-11-04",
          views: 112,
          inquiries: 14,
          approval: "approved",
          listingType: "rent",
        },
      ];
    }

    const requests: ClientRequest[] = [
      {
        id: "req-1",
        clientName: "Engr. Tunde Adeleke",
        phone: "+234 803 111 2233",
        email: "tunde@example.com",
        propertyType: "Duplex",
        minBeds: 4,
        zone: "Phase 1",
        maxBudget: 5000000,
        moveInBy: "2026-12-15",
        note: "Relocating from Ikeja with family. Needs 24/7 power.",
        status: "Viewing Booked",
        receivedOn: "2026-11-20",
      },
      {
        id: "req-2",
        clientName: "Dr. Aisha Bello",
        phone: "+234 809 444 5566",
        email: "aisha.bello@example.com",
        propertyType: "Apartment",
        minBeds: 2,
        zone: "Any",
        maxBudget: 2500000,
        moveInBy: "2026-12-01",
        note: "Prefers top floor with balcony.",
        status: "New",
        receivedOn: "2026-11-22",
      },
    ];

    const viewings: PortalViewing[] = [
      {
        id: "vw-1",
        listingId: "lst-2",
        requestId: "req-1",
        clientName: "Engr. Tunde Adeleke",
        date: "2026-11-25",
        time: "14:00",
        status: "Scheduled",
      },
    ];

    const earnings: EarningsPoint[] = [
      { month: "Jul", commission: 320000 },
      { month: "Aug", commission: 450000 },
      { month: "Sep", commission: 280000 },
      { month: "Oct", commission: 510000 },
      { month: "Nov", commission: 420000 },
    ];

    const data = {
      agent: { name: "Marcus Real Estate Agent", zone: "Phase 1 & Phase 2" },
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

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

async function ensureListingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS listings (
      id SERIAL PRIMARY KEY,
      agent_id INTEGER,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      listing_type VARCHAR(30) DEFAULT 'rent',
      property_type VARCHAR(60) DEFAULT 'Apartment',
      zone VARCHAR(100) DEFAULT 'Phase 1',
      address VARCHAR(255) DEFAULT 'Post Army Housing Estate',
      beds INT DEFAULT 3,
      baths INT DEFAULT 2,
      price_kobo BIGINT DEFAULT 0,
      price_period VARCHAR(30) DEFAULT 'per_year',
      availability VARCHAR(30) DEFAULT 'available',
      approval_status VARCHAR(30) DEFAULT 'pending',
      rejection_reason TEXT,
      photos JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function GET() {
  try {
    await ensureListingsTable();
    const rows = await sql`SELECT * FROM listings ORDER BY created_at DESC`;
    return NextResponse.json({ data: rows });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureListingsTable();
    const body = await req.json();
    const priceKobo = Math.round(Number(body.price || body.rentPerYear || 0) * 100);
    const photosArr: string[] = Array.isArray(body.photos)
      ? body.photos
      : Array.isArray(body.images)
      ? body.images
      : body.image
      ? [String(body.image)]
      : [];

    let agentId: number | null = null;
    try {
      const agentEmail = body.agent_email ? String(body.agent_email) : "";
      const u = agentEmail
        ? await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${agentEmail}) LIMIT 1`
        : await sql`SELECT id FROM users WHERE LOWER(role) = 'agent' ORDER BY id ASC LIMIT 1`;
      if (u[0]?.id) agentId = Number(u[0].id);
    } catch {
      // leave null if users query fails
    }

    const res = await sql`
      INSERT INTO listings (
        agent_id, title, description, listing_type, property_type,
        zone, address, beds, baths, price_kobo, price_period,
        availability, approval_status, photos, created_at, updated_at
      ) VALUES (
        ${agentId}, ${body.title || "Estate Property"}, ${body.description || null},
        ${body.listing_type || "rent"}, ${body.property_type || body.type || "Apartment"},
        ${body.zone || "Phase 1"}, ${body.address || "Post Army Housing Estate"},
        ${Number(body.beds || 3)}, ${Number(body.baths || 2)},
        ${priceKobo}, ${body.price_period ?? "per_year"},
        'available', 'pending', ${JSON.stringify(photosArr)}::jsonb, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        success: true,
        message: "Listing submitted for administrative approval.",
        data: res[0],
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { message: "Could not submit listing for approval.", error: err.message },
      { status: 500 }
    );
  }
}

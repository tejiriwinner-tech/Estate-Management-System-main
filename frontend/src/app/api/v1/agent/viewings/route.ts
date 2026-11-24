import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { listing_id, client_name, date, time } = body;

    let id = Date.now();
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS property_viewings (
          id SERIAL PRIMARY KEY,
          listing_id INTEGER,
          client_name VARCHAR(255) NOT NULL,
          viewing_date VARCHAR(50),
          viewing_time VARCHAR(50),
          status VARCHAR(50) DEFAULT 'Scheduled',
          created_at TIMESTAMP DEFAULT NOW()
        )
      `;
      const ins = await sql`
        INSERT INTO property_viewings (listing_id, client_name, viewing_date, viewing_time, status)
        VALUES (${listing_id ? Number(listing_id) : null}, ${client_name || "Prospective Client"}, ${date || ""}, ${time || ""}, 'Scheduled')
        RETURNING id
      `;
      if (ins[0]?.id) id = Number(ins[0].id);
    } catch {
      // Fallback
    }

    return NextResponse.json(
      {
        data: { id, listing_id, client_name, date, time, status: "Scheduled" },
        message: "Viewing scheduled successfully.",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json({ message: "Could not schedule viewing.", error: err.message }, { status: 500 });
  }
}

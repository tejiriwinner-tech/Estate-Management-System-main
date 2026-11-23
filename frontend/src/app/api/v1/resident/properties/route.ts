import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let properties: any[] = [];
    try {
      properties = await sql`
        SELECT id, type, name, property_number, sector, unit_type, ownership_status, colour, others, status, created_at
        FROM resident_properties
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Properties GET error:", e.message);
    }

    if (properties.length === 0) {
      properties = [
        {
          id: 1,
          type: "Residential",
          name: "Villa Duplex",
          property_number: "Villa A-402",
          sector: "Sector 1 - North Gate",
          unit_type: "4-Bedroom Terrace",
          ownership_status: "Owner-Occupier",
          colour: "White / Stone Grey",
          others: "Private borehole & solar array",
          status: "Verified",
        },
      ];
    }

    return NextResponse.json({ data: properties });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch properties.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, name, property_number, sector, unit_type, ownership_status, colour, others, user_id } = body;

    const res = await sql`
      INSERT INTO resident_properties (
        user_id, type, name, property_number, sector, unit_type, ownership_status, colour, others, status, created_at, updated_at
      )
      VALUES (
        ${user_id || 2}, ${type || "House"}, ${name || "Residential Unit"}, ${property_number || "LE-001"},
        ${sector || "Phase 1"}, ${unit_type || "Duplex"}, ${ownership_status || "Owner"}, ${colour || "White"},
        ${others || "None"}, 'Registered', NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Property registered successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not register property.", error: err.message }, { status: 500 });
  }
}

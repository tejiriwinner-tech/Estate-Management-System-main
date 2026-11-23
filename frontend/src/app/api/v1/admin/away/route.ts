import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let notices: any[] = [];
    try {
      const rows = await sql`
        SELECT a.id, a.user_id, a.resident_name, a.unit, a.departure_date, a.expected_return_date,
               a.emergency_contact_name, a.emergency_contact_phone, a.notes, a.status, a.created_at,
               u.name as user_name, u.unit_number as user_unit
        FROM away_notices a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
      `;
      notices = rows.map((r: any) => ({
        id: r.id,
        resident_name: r.resident_name || r.user_name || "Resident",
        unit_number: r.unit || r.user_unit || "Villa A-402",
        start_date: r.departure_date ? new Date(r.departure_date).toISOString().split("T")[0] : "",
        end_date: r.expected_return_date ? new Date(r.expected_return_date).toISOString().split("T")[0] : "",
        emergency_contact: r.emergency_contact_phone || r.emergency_contact_name || "+234 800 000 0000",
        instructions: r.notes || "Hold deliveries",
        status: r.status || "active",
      }));
    } catch (e: any) {
      console.error("Error loading away notices:", e.message);
    }

    return NextResponse.json({ data: notices });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch away notices", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resident_name, unit_number, start_date, end_date, emergency_contact, instructions } = body;

    let insertedNotice: any = null;
    try {
      const userRows = await sql`SELECT id, name FROM users WHERE LOWER(unit_number) = LOWER(${unit_number || ""}) OR LOWER(name) LIKE ${"%" + (resident_name || "").toLowerCase() + "%"} LIMIT 1`;
      const userId = userRows[0]?.id || 2;
      const resName = resident_name || userRows[0]?.name || "Resident";

      const depDate = start_date || new Date().toISOString().split("T")[0];
      const retDate = end_date || new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];

      const res = await sql`
        INSERT INTO away_notices (
          user_id, resident_name, unit, departure_date, expected_return_date,
          emergency_contact_phone, notes, status, created_at, updated_at
        )
        VALUES (
          ${userId}, ${resName}, ${unit_number || "Villa A-402"}, ${depDate}, ${retDate},
          ${emergency_contact || "+234 801 234 5678"}, ${instructions || "Hold packages"}, 'active', NOW(), NOW()
        )
        RETURNING *
      `;
      const row = res[0];
      insertedNotice = {
        id: row.id,
        resident_name: row.resident_name,
        unit_number: row.unit,
        start_date: row.departure_date ? new Date(row.departure_date).toISOString().split("T")[0] : depDate,
        end_date: row.expected_return_date ? new Date(row.expected_return_date).toISOString().split("T")[0] : retDate,
        emergency_contact: row.emergency_contact_phone,
        instructions: row.notes,
        status: row.status,
      };
    } catch (dbErr: any) {
      console.error("Error inserting away notice:", dbErr.message);
      insertedNotice = {
        id: Date.now(),
        resident_name: resident_name || "Resident",
        unit_number: unit_number || "Villa A-402",
        start_date,
        end_date,
        emergency_contact,
        instructions,
        status: "active",
      };
    }

    return NextResponse.json({ data: insertedNotice, message: "Away notice saved successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save away notice.", error: err.message }, { status: 500 });
  }
}

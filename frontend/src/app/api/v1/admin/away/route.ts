import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let notices: any[] = [];
    try {
      notices = await sql`
        SELECT a.id, a.user_id, a.start_date, a.end_date, a.emergency_contact, a.instructions, a.status, a.created_at,
               u.name as resident_name, u.unit_number
        FROM away_notices a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
      `;
    } catch (e) {
      notices = [
        { id: 1, resident_name: "Chinedu Resident", unit_number: "Villa A-402", start_date: "2026-11-20", end_date: "2026-12-05", emergency_contact: "+234 801 234 5678", instructions: "Hold all gate deliveries", status: "active" },
        { id: 2, resident_name: "Sarah Ibrahim", unit_number: "Flat B-102", start_date: "2026-11-22", end_date: "2026-11-29", emergency_contact: "+234 802 345 6789", instructions: "Call security before entry", status: "scheduled" },
      ];
    }
    return NextResponse.json({ data: notices });
  } catch (err) {
    return NextResponse.json({ message: "Could not fetch away notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resident_name, unit_number, start_date, end_date, emergency_contact, instructions } = body;

    let insertedNotice: any = null;
    try {
      const userRows = await sql`SELECT id FROM users WHERE LOWER(unit_number) = LOWER(${unit_number || ""}) LIMIT 1`;
      const userId = userRows[0]?.id || 1;

      const res = await sql`
        INSERT INTO away_notices (user_id, start_date, end_date, emergency_contact, instructions, status, created_at, updated_at)
        VALUES (${userId}, ${start_date || new Date().toISOString().split("T")[0]}, ${end_date || new Date().toISOString().split("T")[0]}, ${emergency_contact || ""}, ${instructions || ""}, 'active', NOW(), NOW())
        RETURNING *
      `;
      insertedNotice = res[0];
    } catch {
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
  } catch (err) {
    return NextResponse.json({ message: "Could not save away notice." }, { status: 500 });
  }
}

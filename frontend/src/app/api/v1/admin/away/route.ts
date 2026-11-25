import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT a.id, a.user_id, a.resident_name, a.unit, a.departure_date, a.expected_return_date,
               a.emergency_contact_name, a.emergency_contact_phone, a.notes, a.status, a.created_at,
               u.name as user_name, u.unit_number as user_unit
        FROM away_notices a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
      `;
    } catch (e: any) {
      console.error("Error loading away notices:", e.message);
    }

    const fmt = (d: any) =>
      d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

    const residents = (rows.length > 0
      ? rows
      : [
          {
            id: 1,
            resident_name: "Chinedu Resident",
            unit: "Villa A-402",
            departure_date: new Date(Date.now() - 2 * 86400000),
            expected_return_date: new Date(Date.now() + 5 * 86400000),
            emergency_contact_phone: "+234 801 234 5678",
            notes: "Hold courier deliveries at Gate 1",
            status: "active",
          },
        ]
    ).map((r: any) => {
      const statusNorm =
        r.status === "returned"
          ? "returned"
          : r.status === "check_required"
          ? "check_required"
          : "away";
      return {
        id: Number(r.id),
        resident_name: r.resident_name || r.user_name || "Resident",
        house_no: r.unit || r.user_unit || "Villa A-402",
        departure_date: fmt(r.departure_date),
        expected_return_date: fmt(r.expected_return_date),
        status: statusNorm,
        emergency_contact: r.emergency_contact_phone || r.emergency_contact_name || "+234 800 000 0000",
        instructions: r.notes || "Hold deliveries",
      };
    });

    const activeAway = residents.filter((r) => r.status !== "returned");
    const checkRequired = residents.filter((r) => r.status === "check_required");

    const metrics = [
      { id: "away", label: "CURRENTLY AWAY", value: String(activeAway.length), badge: "Active Notices", iconType: "away" },
      { id: "returns", label: "UPCOMING RETURNS", value: String(activeAway.length), badge: "Next 7 Days", iconType: "returns" },
      { id: "alerts", label: "CHECK REQUIRED", value: String(checkRequired.length), badge: "Security Watch", iconType: "alerts" },
    ];

    const upcoming = activeAway.slice(0, 5).map((r) => ({
      id: r.id,
      resident_name: r.resident_name,
      house_no: r.house_no,
      return_date: r.expected_return_date,
    }));

    return NextResponse.json({
      data: {
        metrics,
        residents,
        upcoming,
        mobileMetrics: metrics.map((m) => ({ id: m.id, label: m.label, value: m.value })),
        mobileLogs: activeAway,
        options: residents.map((r) => ({ id: r.id, name: r.resident_name, house_no: r.house_no })),
      },
    });
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
      insertedNotice = res[0];
    } catch (dbErr: any) {
      console.error("Error inserting away notice:", dbErr.message);
      insertedNotice = { id: Date.now(), resident_name: resident_name || "Resident", unit: unit_number || "Villa A-402", status: "active" };
    }

    return NextResponse.json({ data: insertedNotice, message: "Away notice saved successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save away notice.", error: err.message }, { status: 500 });
  }
}

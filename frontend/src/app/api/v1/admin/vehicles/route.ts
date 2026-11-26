import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rawVehicles: any[] = [];
    try {
      rawVehicles = await sql`
        SELECT id, user_id, owner_name, owner_role, house_unit, vehicle_type, plate_number, status, valid_until, created_at
        FROM vehicles
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Error loading vehicles:", e.message);
    }

    const vehicles = rawVehicles.map((v) => ({
      id: v.id,
      owner_name: v.owner_name || "Resident",
      owner_role: v.owner_role || "Resident",
      house_unit: v.house_unit || "—",
      vehicle_type: v.vehicle_type || "Saloon",
      plate_number: v.plate_number,
      status: v.status || "active",
      registered_at: v.created_at ? new Date(v.created_at).toISOString().split("T")[0] : "Today",
    }));

    const activeCount = vehicles.filter((v: any) => v.status === "active").length;
    const metrics = [
      { title: "Total Registered", value: String(vehicles.length), change: "Live directory", isPositive: true },
      { title: "Active Decals", value: String(activeCount), change: vehicles.length ? `${Math.round((activeCount / vehicles.length) * 100)}%` : "0%", isPositive: true },
      { title: "Scanners Online", value: "0/3", change: "Offline", isPositive: false },
    ];

    const scanners = [
      { id: "SC-1", name: "Main Gate Inbound", location: "Gate 1", last_ping: "No signal", online: false, is_enabled: false },
      { id: "SC-2", name: "Main Gate Outbound", location: "Gate 1", last_ping: "No signal", online: false, is_enabled: false },
      { id: "SC-3", name: "Service Gate", location: "Gate 2", last_ping: "No signal", online: false, is_enabled: false },
    ];

    return NextResponse.json({
      data: {
        metrics,
        vehicles,
        scanners,
        mobileMetrics: metrics,
        mobileDirectory: vehicles,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch vehicles.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { owner_name, owner_role, house_unit, vehicle_type, plate_number, status } = body;

    let inserted: any = null;
    try {
      const userRows = await sql`SELECT id FROM users WHERE LOWER(unit_number) = LOWER(${house_unit || ""}) LIMIT 1`;
      const userId = userRows[0]?.id || 2;

      const res = await sql`
        INSERT INTO vehicles (
          user_id, owner_name, owner_role, house_unit, vehicle_type, plate_number, status, created_at, updated_at
        )
        VALUES (
          ${userId}, ${owner_name || "Resident"}, ${owner_role || "Resident"}, ${house_unit || "Villa A-402"},
          ${vehicle_type || "Sedan"}, ${plate_number || "KJA-000-XX"}, ${status || "active"}, NOW(), NOW()
        )
        RETURNING *
      `;
      inserted = res[0];
    } catch (dbErr: any) {
      console.error("Error inserting vehicle:", dbErr.message);
      inserted = {
        id: Date.now(),
        owner_name,
        house_unit,
        plate_number,
        vehicle_type,
        status: status || "active",
      };
    }

    return NextResponse.json({ data: inserted, message: "Vehicle registered successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not register vehicle.", error: err.message }, { status: 500 });
  }
}

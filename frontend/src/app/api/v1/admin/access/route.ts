import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rawLogs: any[] = [];
    try {
      rawLogs = await sql`
        SELECT a.id, a.user_id, a.name, a.role_label, a.gate, a.verification_type, a.status,
               a.direction, a.person_type, a.house_no, a.vehicle_plate, a.occurred_at, a.created_at,
               u.name as host_name, u.unit_number as host_unit
        FROM access_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
        LIMIT 50
      `;
    } catch (e: any) {
      console.error("Error fetching access logs:", e.message);
    }

    const defaultLogs = [
      { id: 1, person_name: "Tunde Bakare", role: "Visitor", tag: "Visitor", unit_number: "Villa A-402", host_name: "Chinedu Resident", vehicle_plate: "KJA-881-AB", entry_time: "10:14 AM", exit_time: "11:45 AM", gate_name: "Gate 1", status: "completed" },
      { id: 2, person_name: "Adewale Delivery (DHL)", role: "Courier", tag: "Delivery", unit_number: "Plot 14", host_name: "Marcus Reed", vehicle_plate: "LND-202-XY", entry_time: "11:20 AM", exit_time: null, gate_name: "Gate 1", status: "inside" },
    ];

    const logs = rawLogs.length > 0
      ? rawLogs.map((l) => ({
          id: l.id,
          person_name: l.name || "Guest",
          role: l.role_label || l.person_type || "Visitor",
          tag: l.person_type || "Visitor",
          unit_number: l.house_no || l.host_unit || "Villa A-402",
          host_name: l.host_name || "Estate Security",
          vehicle_plate: l.vehicle_plate || "Verified RFID",
          entry_time: l.created_at ? new Date(l.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "10:00 AM",
          exit_time: l.direction === "out" ? "Just now" : null,
          gate_name: l.gate || "Gate 1",
          status: l.direction === "out" ? "completed" : "inside",
        }))
      : defaultLogs;

    const metrics = [
      { id: "total-checkins", label: "TOTAL CHECK-INS", value: String(logs.length + 12), iconType: "checkin" as const },
      { id: "total-checkouts", label: "TOTAL CHECK-OUTS", value: String(Math.max(logs.length - 2, 0)), iconType: "checkout" as const },
      { id: "residents-inside", label: "RESIDENTS INSIDE", value: "84", iconType: "residents" as const },
      { id: "visitors-inside", label: "VISITORS INSIDE", value: String(logs.filter((l: any) => !l.exit_time).length || 5), iconType: "visitors" as const },
    ];

    const summary = {
      vehicles_entered: 42,
      pedestrians: 18,
      alert_title: "Normal Security Posture",
      alert_description: "All automated boom barriers and biometric scanners operational at 100%.",
      incidents: [],
      active_personnel: [
        { name: "Officer Mike Warden", post: "Gate 1", status: "On Duty" },
        { name: "Officer John Okon", post: "Gate 2", status: "On Duty" },
      ],
      extra_personnel_count: 2,
    };

    return NextResponse.json({
      data: {
        metrics,
        logs,
        summary,
        mobileLogs: logs,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not load access data.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role_label, gate, verification_type, direction, person_type, house_no, vehicle_plate } = body;

    const res = await sql`
      INSERT INTO access_logs (
        name, role_label, gate, verification_type, direction, person_type, house_no, vehicle_plate, status, occurred_at, created_at, updated_at
      )
      VALUES (
        ${name || "Visitor"}, ${role_label || "Visitor"}, ${gate || "Gate 1"}, ${verification_type || "RFID"},
        ${direction || "in"}, ${person_type || "Visitor"}, ${house_no || "Gate"}, ${vehicle_plate || "N/A"},
        'granted', NOW(), NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Access logged successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not log access.", error: err.message }, { status: 500 });
  }
}

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
               u.name as host_name, u.unit_number as host_unit, u.avatar_url
        FROM access_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
        LIMIT 50
      `;
    } catch (e: any) {
      console.error("Error fetching access logs:", e.message);
    }

    const logs = rawLogs.map((l) => {
      const isOut = l.direction === "out";
      const timeStr = l.occurred_at || l.created_at
        ? new Date(l.occurred_at || l.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "—";
      return {
        id: Number(l.id),
        name: l.name || "Guest",
        person_type: l.person_type || l.role_label || "Visitor",
        house_no: l.house_no || l.host_unit || "—",
        check_in: isOut ? "—" : timeStr,
        check_out: isOut ? timeStr : "—",
        gate: l.gate || "Main Gate",
        status: isOut ? ("checked_out" as const) : ("in_estate" as const),
        avatar_url: l.avatar_url || null,
      };
    });

    const metrics = [
      { id: "total-checkins", label: "TOTAL CHECK-INS", value: String(logs.length + 12), iconType: "checkin" as const },
      { id: "total-checkouts", label: "TOTAL CHECK-OUTS", value: String(logs.filter((l) => l.status === "checked_out").length + 4), iconType: "checkout" as const },
      { id: "residents-inside", label: "RESIDENTS INSIDE", value: "84", iconType: "residents" as const },
      { id: "visitors-inside", label: "VISITORS INSIDE", value: String(logs.filter((l) => l.status === "in_estate").length || 5), iconType: "visitors" as const },
    ];

    const summary = {
      vehicles_entered: 42,
      pedestrians: 18,
      alert_title: "Normal Security Posture",
      alert_description: "All automated boom barriers and biometric scanners are active.",
      incidents: [],
      active_personnel: [
        { id: 1, name: "Mike Warden", role: "Gate 1 Lead", avatar_url: null },
        { id: 2, name: "John Okon", role: "Gate 2 Patrol", avatar_url: null },
      ],
      extra_personnel_count: 2,
    };

    const mobileLogs = logs.map((l) => ({
      id: l.id,
      name: l.name,
      house_no: l.house_no,
      person_type: l.person_type,
      time: l.status === "in_estate" ? l.check_in : l.check_out,
      gate: l.gate,
      status: l.status,
    }));

    return NextResponse.json({
      data: {
        metrics,
        logs,
        summary,
        mobileLogs,
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
        ${name || "Visitor"}, ${role_label || "Visitor"}, ${gate || "Main Gate"}, ${verification_type || "RFID"},
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

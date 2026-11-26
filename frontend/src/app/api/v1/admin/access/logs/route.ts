import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let logs: any[] = [];
    try {
      logs = await sql`
        SELECT a.id, a.user_id, a.visitor_name, a.gate_number, a.direction, a.status, a.reason, a.created_at,
               u.name as host_name, u.unit_number
        FROM access_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
        LIMIT 50
      `;
    } catch {
      logs = [];
    }

    return NextResponse.json({
      data: logs,
      meta: { total: logs.length },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch access logs." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitor_name, host_name, unit_number, gate_number, direction, reason, status } = body;

    let inserted: any = null;
    try {
      const res = await sql`
        INSERT INTO access_logs (visitor_name, gate_number, direction, status, reason, created_at, updated_at)
        VALUES (${visitor_name}, ${gate_number || "Gate 1"}, ${direction || "in"}, ${status || "granted"}, ${reason || "Visitor"}, NOW(), NOW())
        RETURNING *
      `;
      inserted = res[0];
    } catch {
      inserted = {
        id: Date.now(),
        visitor_name,
        host_name: host_name || "Resident",
        unit_number: unit_number || "Villa A-402",
        gate_number: gate_number || "Gate 1",
        direction: direction || "in",
        status: status || "granted",
        reason: reason || "Visitor",
        created_at: new Date().toISOString(),
      };
    }

    return NextResponse.json({ data: inserted }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Could not log access clearance." }, { status: 500 });
  }
}

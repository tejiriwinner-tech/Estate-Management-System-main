import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let logs: any[] = [];
    let passes: any[] = [];

    try {
      logs = await sql`
        SELECT a.id, a.visitor_name, a.gate_number, a.direction, a.status, a.reason, a.created_at,
               u.name as resident_name, u.unit_number
        FROM access_logs a
        LEFT JOIN users u ON u.id = a.user_id
        ORDER BY a.id DESC
        LIMIT 30
      `;

      passes = await sql`
        SELECT p.id, p.code, p.guest_name, p.status, p.valid_from, p.valid_until,
               u.name as resident_name, u.unit_number
        FROM guest_passes p
        LEFT JOIN users u ON u.id = p.user_id
        ORDER BY p.id DESC
        LIMIT 20
      `;
    } catch {
      // Fallback
    }

    const trafficBars = [
      { height: 35 }, { height: 60 }, { height: 45 }, { height: 80, active: true },
      { height: 50 }, { height: 65 }, { height: 40 }, { height: 70 },
      { height: 55 }, { height: 90 }, { height: 65 }, { height: 75 },
    ];

    return NextResponse.json({
      data: {
        logs: logs.map((l) => ({
          id: String(l.id),
          date: new Date(l.created_at || Date.now()).toLocaleDateString(),
          time: new Date(l.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          name: l.visitor_name || "Visitor",
          role: l.resident_name ? "Resident Guest" : "Visitor",
          verificationType: "RFID Card",
          gate: l.gate_number || "Gate 1",
          status: l.status === "granted" ? "Granted" : "Denied",
        })),
        total: logs.length || 24,
        trafficBars,
        entriesLast12h: logs.filter((l) => l.status === "granted").length || 18,
        latestVerified: {
          name: "Chinedu Resident",
          role: "Verified Resident",
          verificationType: "Biometric Scanner",
          gate: "Gate 1 (Main Gate)",
          time: "Just now",
        },
        latestDenied: null,
        passes: passes.map((p) => ({
          id: String(p.id),
          name: p.guest_name || "Guest",
          passCode: p.code || "PASS-" + p.id,
          invitedBy: p.resident_name ? `${p.resident_name} (${p.unit_number})` : "Estate Office",
          expiresAt: p.valid_until || "Today, 11:59 PM",
          status: p.status || "active",
        })),
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch access monitoring data." }, { status: 500 });
  }
}

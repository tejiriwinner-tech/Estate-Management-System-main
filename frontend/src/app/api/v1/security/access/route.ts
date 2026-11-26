import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureAccessLogsTable } from "@/lib/security/accessLogsDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let logs: any[] = [];
    let passes: any[] = [];

    try {
      await ensureAccessLogsTable();
      logs = await sql`
        SELECT * FROM access_logs
        ORDER BY id DESC
        LIMIT 30
      `;

      passes = await sql`
        SELECT * FROM guest_passes
        ORDER BY id DESC
        LIMIT 20
      `;
    } catch (e: any) {
      console.error("Error fetching security access:", e.message);
    }

    const mappedLogs = logs.map((l) => {
      const st = String(l.status || "").toLowerCase();
      return {
        id: String(l.id),
        date: new Date(l.created_at || Date.now()).toLocaleDateString(),
        time: new Date(l.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        name: l.visitor_name || l.person_name || l.name || "Visitor",
        role: l.role || "Visitor",
        verificationType: l.verification_type || "QR Code",
        gateNo: l.gate_number || l.gate || "Gate 1",
        gate: l.gate_number || l.gate || "Gate 1",
        status: st === "denied" ? "Denied" : "Success",
        timestamp: new Date(l.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
    });

    const latestGranted = mappedLogs.find((l) => l.status === "Success") || null;
    const latestDeniedRow = logs.find((l) => String(l.status || "").toLowerCase() === "denied") || null;

    return NextResponse.json({
      data: {
        logs: mappedLogs,
        total: mappedLogs.length,
        trafficBars: mappedLogs.length > 0 ? [{ height: 65, active: true }] : [],
        entriesLast12h: mappedLogs.filter((l) => l.status === "Success").length,
        latestVerified: latestGranted
          ? {
              name: latestGranted.name,
              role: latestGranted.role,
              verificationType: latestGranted.verificationType,
              gate: latestGranted.gate,
              time: latestGranted.time,
            }
          : null,
        latestDenied: latestDeniedRow
          ? {
              name: latestDeniedRow.visitor_name || latestDeniedRow.person_name || latestDeniedRow.name || "Unknown",
              time: new Date(latestDeniedRow.created_at || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              reason: latestDeniedRow.reason || latestDeniedRow.notes || "Access Denied",
              gate: latestDeniedRow.gate_number || latestDeniedRow.gate || "Gate 1",
            }
          : null,
        passes: passes.map((p) => ({
          id: `GP-${p.id}`,
          code: p.code || `PASS-${p.id}`,
          guestName: p.guest_name || p.name || "Visitor",
          hostName: p.invited_by || "Resident",
          unit: "Post Army Housing Estate",
          status: p.status || "active",
          validFrom: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "Today",
          validUntil: p.valid_until || p.expires_at ? new Date(p.valid_until || p.expires_at).toISOString().split("T")[0] : "Today",
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch access data.", error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureAccessLogsTable } from "@/lib/security/accessLogsDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "today";

    await ensureAccessLogsTable();

    let logRows: any[] = [];
    try {
      if (range === "yesterday") {
        logRows = await sql`
          SELECT * FROM access_logs
          WHERE created_at >= CURRENT_DATE - INTERVAL '1 day'
            AND created_at < CURRENT_DATE
          ORDER BY id DESC
          LIMIT 100
        `;
      } else if (range === "week") {
        logRows = await sql`
          SELECT * FROM access_logs
          WHERE created_at >= NOW() - INTERVAL '7 days'
          ORDER BY id DESC
          LIMIT 100
        `;
      } else {
        logRows = await sql`
          SELECT * FROM access_logs
          WHERE created_at >= CURRENT_DATE
          ORDER BY id DESC
          LIMIT 100
        `;
      }
    } catch {
      logRows = [];
    }

    let visitorsInside = 0;
    try {
      const vp = await sql`SELECT COUNT(*)::int as count FROM guest_passes WHERE status = 'used'`;
      visitorsInside = Number(vp[0]?.count || 0);
    } catch {
      // ignore
    }

    let residentsCount = 0;
    try {
      const rr = await sql`SELECT COUNT(*)::int as count FROM users WHERE LOWER(role) = 'resident'`;
      residentsCount = Number(rr[0]?.count || 0);
    } catch {
      // ignore
    }

    let personnel: { id: string; name: string; initials: string; role: string }[] = [];
    try {
      const sec = await sql`SELECT id, name, job_title FROM users WHERE LOWER(role) = 'security' ORDER BY id ASC LIMIT 6`;
      personnel = sec.map((s: any) => {
        const name = s.name || "Security Officer";
        const initials = name
          .split(" ")
          .map((p: string) => p[0])
          .filter(Boolean)
          .slice(0, 2)
          .join("")
          .toUpperCase();
        return {
          id: String(s.id),
          name,
          initials: initials || "SO",
          role: s.job_title || "Security Officer",
        };
      });
    } catch {
      // ignore
    }

    let incidents: any[] = [];
    try {
      const al = await sql`
        SELECT id, message, location, created_at
        FROM estate_alerts
        WHERE status IN ('open', 'active')
        ORDER BY id DESC
        LIMIT 5
      `;
      incidents = al.map((a: any) => ({
        id: String(a.id),
        title: a.message || "Security Alert",
        location: a.location || "Estate",
        time: a.created_at ? new Date(a.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "Recent",
      }));
    } catch {
      // ignore
    }

    const totalCheckins = logRows.filter((l) => String(l.direction || "in").toLowerCase() === "in").length;
    const totalCheckouts = logRows.filter((l) => String(l.direction || "").toLowerCase() === "out").length;

    const logs = logRows.map((l) => {
      const dir = String(l.direction || "in").toLowerCase();
      const st = String(l.status || "granted").toLowerCase();
      const timeStr = l.created_at
        ? new Date(l.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })
        : "—";
      const dateStr = l.created_at ? new Date(l.created_at).toLocaleDateString("en-NG") : "Today";
      const rawGate = String(l.gate_number || l.gate || "Main Gate");
      const gate = rawGate.includes("2")
        ? "Service Gate"
        : rawGate.toLowerCase().includes("pedestrian")
        ? "Pedestrian Gate"
        : "Main Gate";
      return {
        id: String(l.id),
        name: l.visitor_name || l.person_name || l.name || "Visitor",
        person_type: String(l.role || "").toLowerCase().includes("resident") ? "Resident" : "Visitor",
        house_no: l.reason || l.notes || "Post Army Housing Estate",
        check_in: dir === "in" ? timeStr : "—",
        check_out: dir === "out" ? timeStr : "—",
        gate,
        date: dateStr,
        status: st === "denied" ? "Denied" : dir === "out" ? "Checked Out" : "Checked In",
      };
    });

    const mobileLogs = logs.map((l) => ({
      id: l.id,
      name: l.name,
      unit: l.house_no,
      type: l.person_type,
      time: l.check_in !== "—" ? l.check_in : l.check_out,
      status: l.status,
    }));

    return NextResponse.json({
      data: {
        metrics: [
          { id: "total-checkins", label: "TOTAL CHECK-INS", value: String(totalCheckins), iconType: "checkin" },
          { id: "total-checkouts", label: "TOTAL CHECK-OUTS", value: String(totalCheckouts), iconType: "checkout" },
          { id: "residents-inside", label: "RESIDENTS INSIDE", value: String(residentsCount), iconType: "residents" },
          { id: "visitors-inside", label: "VISITORS INSIDE", value: String(visitorsInside), iconType: "visitors" },
        ],
        logs,
        mobileLogs,
        summary: {
          vehicles_entered: totalCheckins,
          pedestrians: 0,
          alert_title: incidents.length > 0 ? `${incidents.length} Active Alert(s)` : "No active incidents",
          alert_description: incidents[0]?.title || "All estate gates operating normally.",
          incidents,
          active_personnel: personnel,
          extra_personnel_count: Math.max(0, personnel.length - 4),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch admin access overview.", error: err?.message }, { status: 500 });
  }
}

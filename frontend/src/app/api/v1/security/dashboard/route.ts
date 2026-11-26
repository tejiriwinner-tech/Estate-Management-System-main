import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { ensureAccessLogsTable } from "@/lib/security/accessLogsDb";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let intelligenceCount = 0;
    let openThreats = 0;
    let activitiesCount = 0;
    let activeAwayCount = 0;
    let activeEmergencies: any[] = [];
    let recentAccessLogs: any[] = [];
    let activePasses: any[] = [];

    try {
      const intelRes = await sql`
        SELECT COUNT(*)::int as count FROM estate_alerts WHERE category = 'intelligence'
      `;
      intelligenceCount = Number(intelRes[0]?.count || 0);
    } catch {
      // ignore if table absent
    }

    try {
      const alertRows = await sql`
        SELECT id, category, message, location, status, created_at
        FROM estate_alerts
        WHERE category = 'life_threat' AND status IN ('open', 'active')
        ORDER BY id DESC
        LIMIT 20
      `;
      activeEmergencies = alertRows.map((a: any) => ({
        id: Number(a.id),
        source: "estate_alerts",
        message: a.message || "EMERGENCY SOS ALERT",
        location: a.location || "Post Army Housing Estate",
        status: a.status,
        created_at: a.created_at,
      }));
      openThreats = activeEmergencies.length;
    } catch {
      // ignore
    }

    try {
      const panicRows = await sql`
        SELECT id, location, note, status, created_at
        FROM panic_alerts
        WHERE status = 'active'
        ORDER BY id DESC
        LIMIT 20
      `;
      for (const p of panicRows) {
        if (!activeEmergencies.some((e) => e.location === p.location && e.message === p.note)) {
          activeEmergencies.push({
            id: Number(p.id),
            source: "panic_alerts",
            message: p.note || "RESIDENT PANIC EMERGENCY TRIGGERED",
            location: p.location || "Post Army Housing Estate",
            status: p.status,
            created_at: p.created_at,
          });
        }
      }
      openThreats = activeEmergencies.length;
    } catch {
      // ignore
    }

    try {
      await ensureAccessLogsTable();
      const actRes = await sql`SELECT COUNT(*)::int as count FROM access_logs`;
      activitiesCount = Number(actRes[0]?.count || 0);

      const logRows = await sql`
        SELECT * FROM access_logs
        ORDER BY id DESC
        LIMIT 15
      `;
      recentAccessLogs = logRows.map((l: any) => {
        const st = String(l.status || "").toLowerCase();
        const dir = String(l.direction || "in").toLowerCase();
        return {
          id: Number(l.id),
          person: l.visitor_name || l.person_name || l.name || "Visitor",
          gate: l.gate_number || l.gate || "Gate 1",
          direction: dir,
          status: st === "denied" ? "Access Denied" : dir === "out" ? "Exit Recorded" : "Entry Cleared",
          reason: l.reason || l.notes || "Gate Check",
          time: l.created_at ? new Date(l.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }) : "Recent",
        };
      });
    } catch {
      // ignore
    }

    try {
      const passRows = await sql`
        SELECT * FROM guest_passes
        WHERE status IN ('active', 'used')
        ORDER BY id DESC
        LIMIT 20
      `;
      activePasses = passRows.map((p: any) => ({
        id: Number(p.id),
        guest_name: p.guest_name || p.name || "Visitor",
        invited_by: p.invited_by || "Resident",
        purpose: p.purpose || "Visit",
        code: p.code || `PASS-${p.id}`,
        status: p.status || "active",
        valid_until: p.valid_until || p.expires_at,
      }));
    } catch {
      // ignore
    }

    try {
      const awayRes = await sql`SELECT COUNT(*)::int as count FROM away_notices WHERE status = 'active'`;
      activeAwayCount = Number(awayRes[0]?.count || 0);
    } catch {
      // ignore
    }

    return NextResponse.json({
      data: {
        stats: {
          intelligence: intelligenceCount,
          threats: openThreats,
          activities: activitiesCount,
          activePasses: activePasses.length,
          activeAway: activeAwayCount,
        },
        openThreats,
        activeEmergencies,
        recentAccessLogs,
        activePasses,
        reminders: [],
        update: {
          author: "Security Operations Center",
          role: "Post Army Housing Estate Command",
          timestamp: new Date().toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" }),
          body:
            openThreats > 0
              ? `ALERT: ${openThreats} active emergency SOS alert(s) require immediate patrol response.`
              : "All gates and perimeter checkpoints are operating normally. Verify visitor passes and resident QR codes below.",
          imageUrl: null,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { id, source = "estate_alerts" } = body;
    if (!id) {
      return NextResponse.json({ message: "Alert id is required." }, { status: 400 });
    }
    if (source === "panic_alerts") {
      await sql`UPDATE panic_alerts SET status = 'resolved', updated_at = NOW() WHERE id = ${Number(id)}`.catch(() => {});
    } else {
      await sql`UPDATE estate_alerts SET status = 'resolved', updated_at = NOW() WHERE id = ${Number(id)}`.catch(() => {});
    }
    return NextResponse.json({ ok: true, message: "Emergency alert marked as resolved." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not resolve alert.", error: err.message }, { status: 500 });
  }
}

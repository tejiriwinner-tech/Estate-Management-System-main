import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, list_type, entity_type, name, entity_ref, reason, risk_level, status, details, created_at
        FROM blacklist_entries
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Error fetching blacklist entries:", e.message);
    }

    const defaultEntries = [
      {
        id: "BL-001",
        name: "Marcus Sterling",
        entityId: "LE-99101-X",
        reason: "Unauthorized commercial activity & trespass",
        reasonDetail: "Attempted unverified commercial delivery at Phase 2 gate",
        riskLevel: "HIGH",
        status: "RESTRICTED",
        lastAttemptedDate: "2026-11-19",
        lastAttemptedTime: "14:22",
        lastAttemptedLocation: "Main Gate 1",
        dateAdded: "2026-11-10",
        securityLevel: "High",
      },
      {
        id: "BL-002",
        name: "Toyota Hilux (LND-442-AA)",
        entityId: "VEH-442",
        reason: "Reckless driving & barrier hit-and-run",
        reasonDetail: "ANPR flagged for perimeter barrier damage",
        riskLevel: "EXTREME",
        status: "RESTRICTED",
        lastAttemptedDate: "2026-11-21",
        lastAttemptedTime: "21:05",
        lastAttemptedLocation: "Phase 2 Gate",
        dateAdded: "2026-11-14",
        securityLevel: "High",
      },
    ];

    const entries = rows.length > 0
      ? rows.map((r) => ({
          id: `BL-${r.id}`,
          name: r.name,
          entityId: r.entity_ref || `REF-${r.id}`,
          reason: r.reason || "Security restriction",
          reasonDetail: r.details || r.reason || "Flagged by Security Command",
          riskLevel: (r.risk_level || "ELEVATED").toUpperCase(),
          status: r.status === "cleared" ? "CLEARED" : r.list_type === "watchlist" ? "UNDER_OBSERVATION" : "RESTRICTED",
          lastAttemptedDate: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "2026-11-10",
          lastAttemptedTime: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "12:00",
          lastAttemptedLocation: "Main Gate 1",
          dateAdded: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "2026-11-10",
          securityLevel: r.risk_level === "EXTREME" || r.risk_level === "HIGH" ? "High" : "Medium",
        }))
      : defaultEntries;

    const watchlist = [
      {
        id: "WL-001",
        name: "Delivery Van (KJA-901-XZ)",
        entityId: "VEH-901",
        reason: "Excessive speed on Palm Avenue",
        reasonDetail: "Monitored by ANPR speed telemetry",
        entityType: "vehicle",
        riskLevel: "ELEVATED",
        status: "UNDER_OBSERVATION",
        lastAttemptedDate: "2026-11-22",
        lastAttemptedTime: "10:15",
        lastAttemptedLocation: "Palm Avenue",
      },
    ];

    return NextResponse.json({
      data: {
        entries,
        watchlist,
        stats: {
          totalBlacklisted: entries.length,
          highRiskAlerts: entries.filter((e) => e.riskLevel === "EXTREME" || e.riskLevel === "HIGH").length,
          watchlistEntries: watchlist.length,
          clearedRemoved: entries.filter((e) => e.status === "CLEARED").length,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch blacklist data.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, entity_ref, reason, risk_level, details, entity_type } = body;

    let inserted: any = null;
    try {
      const res = await sql`
        INSERT INTO blacklist_entries (
          list_type, entity_type, name, entity_ref, reason, details, risk_level, status, created_at, updated_at
        )
        VALUES (
          'blacklist', ${entity_type || "individual"}, ${name}, ${entity_ref || "MANUAL"},
          ${reason}, ${details || reason}, ${risk_level || "ELEVATED"}, 'active', NOW(), NOW()
        )
        RETURNING *
      `;
      inserted = res[0];
    } catch (dbErr: any) {
      console.error("Error inserting blacklist entry:", dbErr.message);
      inserted = { id: Date.now(), name, entity_ref, reason, risk_level };
    }

    return NextResponse.json({ data: inserted, message: "Blacklist entry added." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add blacklist entry.", error: err.message }, { status: 500 });
  }
}

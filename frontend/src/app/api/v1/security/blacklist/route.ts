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

    const entries = rows.map((r) => ({
      id: `BL-${r.id}`,
      name: r.name,
      entityId: r.entity_ref || `REF-${r.id}`,
      reason: r.reason || "Security restriction",
      reasonDetail: r.details || r.reason || "Flagged by Security Command",
      riskLevel: (r.risk_level || "ELEVATED").toUpperCase(),
      status: r.status === "cleared" ? "CLEARED" : r.list_type === "watchlist" ? "UNDER_OBSERVATION" : "RESTRICTED",
      lastAttemptedDate: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "—",
      lastAttemptedTime: r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—",
      lastAttemptedLocation: "Main Gate",
      dateAdded: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "—",
      securityLevel: r.risk_level === "EXTREME" || r.risk_level === "HIGH" ? "High" : "Medium",
    }));

    const watchlist = entries.filter((e) => e.status === "UNDER_OBSERVATION");

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

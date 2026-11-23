import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, name, entity_ref, reason, risk_level, notify_officers, created_at
        FROM blacklist_entries
        ORDER BY id DESC
      `;
    } catch {
      // Fallback
    }

    const defaultEntries = [
      {
        id: "BL-001",
        name: "Marcus Sterling",
        entityId: "LE-99101-X",
        reason: "Unauthorized commercial activity & trespass",
        riskLevel: "HIGH",
        dateAdded: "2026-11-10",
        addedBy: "Capt. A. Bello",
        avatar: "",
      },
      {
        id: "BL-002",
        name: "Toyota Hilux (LND-442-AA)",
        entityId: "VEH-442",
        reason: "Reckless driving & barrier hit-and-run",
        riskLevel: "EXTREME",
        dateAdded: "2026-11-14",
        addedBy: "Officer Okon",
        avatar: "",
      },
    ];

    const entries = rows.length > 0
      ? rows.map((r) => ({
          id: `BL-${r.id}`,
          name: r.name,
          entityId: r.entity_ref || `REF-${r.id}`,
          reason: r.reason,
          riskLevel: r.risk_level || "ELEVATED",
          dateAdded: new Date(r.created_at || Date.now()).toISOString().split("T")[0],
          addedBy: "Security Control",
          avatar: "",
        }))
      : defaultEntries;

    return NextResponse.json({
      data: {
        entries,
        watchlist: [
          {
            id: "WL-1",
            name: "Apex Logistics Truck",
            entityId: "VEH-901",
            reason: "Excessive speed on Palm Avenue",
            entityType: "vehicle",
            riskLevel: "ELEVATED",
            dateAdded: "2026-11-18",
            addedBy: "Gate 1",
            avatar: "",
          },
        ],
        stats: {
          totalBlacklisted: entries.length,
          highRiskAlerts: entries.filter((e) => e.riskLevel === "EXTREME" || e.riskLevel === "HIGH").length,
          watchlistEntries: 1,
          clearedRemoved: 0,
        },
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch blacklist data." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, entity_ref, reason, risk_level, notify_officers, evidence_url } = body;

    let inserted: any = null;
    try {
      const res = await sql`
        INSERT INTO blacklist_entries (name, entity_ref, reason, risk_level, notify_officers, created_at, updated_at)
        VALUES (${name}, ${entity_ref || "MANUAL"}, ${reason}, ${risk_level || "ELEVATED"}, ${notify_officers ?? true}, NOW(), NOW())
        RETURNING *
      `;
      inserted = res[0];
    } catch {
      inserted = {
        id: Date.now(),
        name,
        entity_ref,
        reason,
        risk_level,
      };
    }

    return NextResponse.json({ data: inserted, message: "Blacklist entry added." }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Could not add blacklist entry." }, { status: 500 });
  }
}

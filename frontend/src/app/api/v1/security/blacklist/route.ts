import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT id, name, entity_ref, reason, risk_level, entity_type, status, details, created_at
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
          dateAdded: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : "2026-11-10",
          addedBy: "Security Control",
          avatar: "",
        }))
      : defaultEntries;

    return NextResponse.json({
      data: {
        entries,
        quickPresets: [
          {
            name: "Delivery Van (KJA-901-XZ)",
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
          'blacklist', ${entity_type || 'individual'}, ${name}, ${entity_ref || "MANUAL"},
          ${reason}, ${details || reason}, ${risk_level || "ELEVATED"}, 'active', NOW(), NOW()
        )
        RETURNING *
      `;
      inserted = res[0];
    } catch (dbErr: any) {
      console.error("Error inserting blacklist entry:", dbErr.message);
      inserted = {
        id: Date.now(),
        name,
        entity_ref,
        reason,
        risk_level,
      };
    }

    return NextResponse.json({ data: inserted, message: "Blacklist entry added." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add blacklist entry.", error: err.message }, { status: 500 });
  }
}

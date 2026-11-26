import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "all";

    let rows: any[] = [];

    try {
      if (category === "life_threat") {
        const threatRows = await sql`
          SELECT a.id, a.type, a.title, a.body, a.unit, a.created_at,
                 u.name as user_name
          FROM alerts a
          LEFT JOIN users u ON u.id = a.user_id
          WHERE a.type ILIKE '%threat%' OR a.type ILIKE '%panic%' OR a.priority = 'critical'
          ORDER BY a.id DESC
        `;
        rows = threatRows.map((r: any) => ({
          id: String(r.id),
          name: r.user_name || "Resident",
          houseNumber: r.unit || "Villa A-402",
          date: new Date(r.created_at).toLocaleDateString("en-NG"),
          report: r.body || r.title || "Emergency panic alert triggered.",
        }));
      } else {
        const intelRows = await sql`
          SELECT a.id, a.type, a.title, a.body, a.unit, a.created_at,
                 u.name as user_name
          FROM alerts a
          LEFT JOIN users u ON u.id = a.user_id
          ORDER BY a.id DESC
          LIMIT 20
        `;
        rows = intelRows.map((r: any) => ({
          id: String(r.id),
          name: r.user_name || "Perimeter Sensor",
          houseNumber: r.unit || "Phase 2 Array",
          date: new Date(r.created_at).toLocaleDateString("en-NG"),
          report: r.body || r.title || "Routine telemetry sweep.",
        }));
      }
    } catch (e: any) {
      console.warn("Security reports DB err:", e.message);
    }

    return NextResponse.json({ rows, total: rows.length });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch reports.", error: err.message }, { status: 500 });
  }
}

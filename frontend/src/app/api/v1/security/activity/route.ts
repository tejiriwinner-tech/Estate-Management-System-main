import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    let total = 0;

    try {
      const actRows = await sql`
        SELECT a.id, a.name, a.out_at, a.out_with, a.in_at, a.in_with, a.created_at
        FROM resident_activities a
        ORDER BY a.id DESC
        LIMIT 50
      `;
      rows = actRows.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        out: r.out_at ? new Date(r.out_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) : "-",
        outWith: r.out_with || "-",
        in: r.in_at ? new Date(r.in_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) : "-",
        inWith: r.in_with || "-",
      }));
      total = rows.length;
    } catch (e: any) {
      console.warn("Security activity DB err:", e.message);
    }

    return NextResponse.json({ rows, total });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch activity report.", error: err.message }, { status: 500 });
  }
}

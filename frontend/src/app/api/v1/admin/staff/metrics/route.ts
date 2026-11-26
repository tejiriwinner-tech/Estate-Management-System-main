import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let totalStaff = 0;
    let activeStaff = 0;
    let suspended = 0;
    let newJoining = 0;

    try {
      const rows = await sql`
        SELECT status, COUNT(*)::int as count
        FROM users
        WHERE role IN ('store_owner', 'agent', 'chairman')
           OR LOWER(COALESCE(job_title, '')) LIKE '%chairman%'
        GROUP BY status
      `;
      rows.forEach((r: any) => {
        const c = Number(r.count || 0);
        totalStaff += c;
        if (r.status === "active" || !r.status) activeStaff += c;
        else if (r.status === "suspended") suspended += c;
      });
      newJoining = totalStaff;
    } catch (e: any) {
      console.error("Staff metrics error:", e.message);
    }

    const pct = totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0;

    return NextResponse.json({
      data: {
        total_staff: totalStaff,
        total_trend: totalStaff > 0 ? `${totalStaff} registered` : "No staff yet",
        active: activeStaff,
        active_pct: `${pct}%`,
        suspended,
        suspended_diff: "0%",
        new_joining: newJoining,
        new_joining_badge: `${newJoining} active`,
        department_overview: {
          departments: [],
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff metrics.", error: err.message }, { status: 500 });
  }
}

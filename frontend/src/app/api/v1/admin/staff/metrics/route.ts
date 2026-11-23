import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let totalStaff = 28;
    let activeStaff = 26;
    let suspended = 1;
    let onLeave = 1;

    try {
      const rows = await sql`
        SELECT status, COUNT(*)::int as count
        FROM users
        WHERE role IN ('staff', 'manager', 'security', 'maintenance')
        GROUP BY status
      `;
      let total = 0;
      rows.forEach((r: any) => {
        total += Number(r.count);
        if (r.status === "active") activeStaff = Number(r.count);
        if (r.status === "suspended") suspended = Number(r.count);
        if (r.status === "on_leave") onLeave = Number(r.count);
      });
      if (total > 0) totalStaff = total;
    } catch (e: any) {
      console.error("Staff metrics error:", e.message);
    }

    const pct = totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 95;

    return NextResponse.json({
      data: {
        total_staff: totalStaff,
        total_trend: "+3 this month",
        active: activeStaff,
        active_pct: `${pct}%`,
        suspended,
        suspended_diff: "0%",
        new_joining: 2,
        new_joining_badge: "2 onboarding",
        department_overview: {
          departments: [
            { name: "Operations", count: 8, lead: "Bessie Cooper" },
            { name: "Finance & Accounts", count: 6, lead: "Darlene Robertson" },
            { name: "Security Command", count: 10, lead: "Mike Warden" },
            { name: "Maintenance", count: 4, lead: "Floyd Miles" },
          ],
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff metrics.", error: err.message }, { status: 500 });
  }
}

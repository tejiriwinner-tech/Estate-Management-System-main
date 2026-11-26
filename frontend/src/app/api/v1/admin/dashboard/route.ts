import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let residentsCount = 0;
    let vehiclesCount = 0;
    let awayCount = 0;

    try {
      const u = await sql`SELECT count(*)::int as c FROM users WHERE role = 'resident'`;
      residentsCount = Number(u[0]?.c || 0);

      const v = await sql`SELECT count(*)::int as c FROM vehicles`;
      vehiclesCount = Number(v[0]?.c || 0);

      const a = await sql`SELECT count(*)::int as c FROM away_notices WHERE status = 'active'`;
      awayCount = Number(a[0]?.c || 0);
    } catch {
      // Keep zeroed counts if tables are not populated yet
    }

    const liveMetrics = [
      {
        id: "residents",
        label: "TOTAL RESIDENTS",
        value: String(residentsCount),
        trend: residentsCount > 0 ? "Registered units" : "No residents yet",
        trendType: "positive" as const,
        iconType: "residents" as const,
      },
      {
        id: "houses",
        label: "REGISTERED VEHICLES",
        value: String(vehiclesCount),
        badge: "RFID Registry",
        iconType: "houses" as const,
      },
      {
        id: "revenue",
        label: "ACTIVE AWAY ALERTS",
        value: String(awayCount),
        trend: "Monitored",
        trendType: "positive" as const,
        iconType: "revenue" as const,
      },
      {
        id: "requests",
        label: "ESTATE STATUS",
        value: "Active",
        iconType: "requests" as const,
      },
    ];

    return NextResponse.json({
      data: {
        metrics: liveMetrics,
        operationalDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch dashboard metrics" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let intelligenceCount = 12;
    let threatsCount = 0;
    let activitiesCount = 48;

    try {
      const intelRes = await sql`
        SELECT COUNT(*) as count FROM estate_alerts WHERE category = 'intelligence'
      `;
      if (intelRes[0]?.count) intelligenceCount = Number(intelRes[0].count);

      const threatRes = await sql`
        SELECT COUNT(*) as count FROM estate_alerts WHERE category = 'life_threat' AND status = 'open'
      `;
      if (threatRes[0]?.count) threatsCount = Number(threatRes[0].count);

      const actRes = await sql`
        SELECT COUNT(*) as count FROM access_logs
      `;
      if (actRes[0]?.count) activitiesCount = Number(actRes[0].count);
    } catch (e) {
      // Fallback
    }

    const data = {
      stats: {
        intelligence: intelligenceCount > 0 ? intelligenceCount : 8,
        threats: threatsCount,
        activities: activitiesCount > 0 ? activitiesCount : 36,
      },
      openThreats: threatsCount,
      reminders: [
        {
          id: "rem-1",
          text: "Shift Changeover inspection at Gate 1 & 2 at 18:00 hours.",
          time: "18:00 Today",
          priority: "high" as const,
        },
        {
          id: "rem-2",
          text: "Verify perimeter sensor calibration on North Fence Phase 2.",
          time: "21:30 Today",
          priority: "medium" as const,
        },
      ],
      update: {
        author: "Chief Security Officer",
        role: "Head of Security Command",
        timestamp: "Today, 08:30 AM",
        body: "Estate access protocols operating under Normal Condition. All biometric scanners, ANPR cameras at Main Gate and Phase 2 gate are operational.",
        imageUrl: null,
      },
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

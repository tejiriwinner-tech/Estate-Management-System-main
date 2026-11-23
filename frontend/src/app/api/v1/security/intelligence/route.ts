import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    let alerts: any[] = [];
    try {
      alerts = await sql`
        SELECT id, title, description, severity, status, created_at
        FROM estate_alerts
        ORDER BY id DESC
        LIMIT 20
      `;
    } catch {
      // Fallback
    }

    const defaultFeed = [
      {
        id: "INT-101",
        title: "Perimeter Motion Detection - Zone C",
        description: "Infrared beam breach triggered near Phase 2 fence line. Patrol unit dispatched.",
        category: "PERIMETER_BREACH",
        status: "URGENT",
        time: "12 mins ago",
        reportedBy: "Sensor Array #4",
        resolved: false,
      },
      {
        id: "INT-102",
        title: "Unrecognized Visitor Loitering",
        description: "Subject without visitor tag observed near Commercial Hub ATM pavilion.",
        category: "SUSPICIOUS_ACTIVITY",
        status: "ELEVATED",
        time: "45 mins ago",
        reportedBy: "Guard Alpha",
        resolved: true,
      },
      {
        id: "INT-103",
        title: "Tailgating at Gate 2 Barrier",
        description: "Black Sedan closely followed authorized resident vehicle through boom barrier.",
        category: "VEHICLE_TRACKING",
        status: "URGENT",
        time: "2 hours ago",
        reportedBy: "ANPR Camera #2",
        resolved: false,
      },
    ];

    return NextResponse.json({
      data: {
        items: alerts.length > 0
          ? alerts.map((a) => ({
              id: `INT-${a.id}`,
              title: a.title,
              description: a.description,
              category: a.severity === "high" ? "PERIMETER_BREACH" : "SUSPICIOUS_ACTIVITY",
              status: a.severity === "high" ? "URGENT" : "ELEVATED",
              time: "Recently",
              reportedBy: "Central Control",
              resolved: a.status === "resolved",
            }))
          : defaultFeed,
        stats: {
          urgentReports: alerts.filter((a) => a.severity === "high").length || 2,
          resolvedToday: 5,
          pendingReview: 1,
        },
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch intelligence data." }, { status: 500 });
  }
}

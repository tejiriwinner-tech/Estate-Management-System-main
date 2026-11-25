import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let alerts: any[] = [];
    try {
      alerts = await sql`
        SELECT a.id, a.sender_id, a.category, a.message, a.location, a.status, a.created_at,
               u.name as sender_name
        FROM estate_alerts a
        LEFT JOIN users u ON u.id = a.sender_id
        ORDER BY a.id DESC
        LIMIT 25
      `;
    } catch (e: any) {
      console.error("Error fetching intelligence alerts:", e.message);
    }

    const defaultFeed = [
      {
        id: "INT-101",
        title: "Perimeter Motion Detection - Zone C",
        snippet: "Infrared beam breach triggered near Phase 2 fence line. Patrol unit dispatched.",
        category: "PERIMETER_BREACH",
        status: "URGENT",
        timeAgo: "12 mins ago",
        location: "Phase 2 Perimeter",
        reportedBy: "Sensor Array #4",
        resolved: false,
      },
      {
        id: "INT-102",
        title: "Unrecognized Visitor Loitering",
        snippet: "Subject without visitor tag observed near Commercial Hub ATM pavilion.",
        category: "SUSPICIOUS_ACTIVITY",
        status: "INVESTIGATING",
        timeAgo: "45 mins ago",
        location: "Commercial Hub",
        reportedBy: "Guard Alpha",
        resolved: false,
      },
    ];

    const items = alerts.length > 0
      ? alerts.map((a) => ({
          id: `INT-${a.id}`,
          title: a.category === "life_threat" ? `Emergency: ${a.location || "Estate"}` : `Intel: ${a.location || "Lincoln Estate"}`,
          snippet: a.message || "Field telemetry report logged.",
          category: a.category === "life_threat" ? "PERIMETER_BREACH" : "SUSPICIOUS_ACTIVITY",
          status: a.status === "resolved" ? "RESOLVED" : a.category === "life_threat" ? "URGENT" : "ACTION_REQUIRED",
          timeAgo: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
          location: a.location || "Lincoln Estate",
          reportedBy: a.sender_name || "Security Officer",
          resolved: a.status === "resolved",
        }))
      : defaultFeed;

    const urgentReports = items.filter((i) => i.status === "URGENT").length;
    const resolvedToday = items.filter((i) => i.status === "RESOLVED").length;
    const pendingReview = items.filter((i) => i.status !== "RESOLVED").length;

    return NextResponse.json({
      data: {
        items,
        stats: {
          urgentReports,
          resolvedToday,
          pendingReview,
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch intelligence data.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, category, location, sender_id } = body;

    const res = await sql`
      INSERT INTO estate_alerts (
        sender_id, category, message, location, status, created_at, updated_at
      )
      VALUES (
        ${sender_id || 3}, ${category || "intelligence"}, ${message || "Suspicious movement reported"},
        ${location || "Main Gate"}, 'open', NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Intelligence alert registered." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save alert.", error: err.message }, { status: 500 });
  }
}

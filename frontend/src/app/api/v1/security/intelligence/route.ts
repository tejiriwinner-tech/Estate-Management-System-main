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
    ];

    const items = alerts.length > 0
      ? alerts.map((a) => ({
          id: `INT-${a.id}`,
          title: a.category === "life_threat" ? `Emergency: ${a.location || "Estate"}` : `Intel: ${a.location || "Lincoln Estate"}`,
          description: a.message,
          category: a.category === "life_threat" ? "PERIMETER_BREACH" : "SUSPICIOUS_ACTIVITY",
          status: a.category === "life_threat" ? "URGENT" : (a.status === "open" ? "ELEVATED" : "RESOLVED"),
          time: a.created_at ? new Date(a.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently",
          reportedBy: a.sender_name || "Security Officer",
          resolved: a.status === "resolved",
        }))
      : defaultFeed;

    return NextResponse.json({
      data: {
        items,
        activeSensors: 16,
        anprAccuracy: "99.4%",
        openIncidents: items.filter((i) => !i.resolved).length,
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

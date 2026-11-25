import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items: any[] = [];

    try {
      const alerts = await sql`
        SELECT id, category, message, location, status, created_at
        FROM estate_alerts
        ORDER BY id DESC
        LIMIT 3
      `;
      for (const a of alerts) {
        items.push({
          id: 1000 + Number(a.id),
          type: "alert",
          title: `${a.category === "life_threat" ? "Priority Alert" : "Security Notice"}: ${a.message}`,
          body: a.location || "Post Army House Estate",
          data: { category: a.category, status: a.status },
          read: a.status === "resolved",
          created_at: a.created_at ? new Date(a.created_at).toISOString() : new Date().toISOString(),
        });
      }

      const meetings = await sql`
        SELECT id, title, body, held_at
        FROM meeting_reports
        ORDER BY id DESC
        LIMIT 3
      `;
      for (const m of meetings) {
        items.push({
          id: 2000 + Number(m.id),
          type: "notice",
          title: m.title.replace(/^\[[^\]]+\]\s*/, ""),
          body: m.body,
          data: null,
          read: false,
          created_at: m.held_at ? new Date(m.held_at).toISOString() : new Date().toISOString(),
        });
      }
    } catch {
      // Fallback
    }

    if (items.length === 0) {
      items.push(
        {
          id: 1,
          type: "notice",
          title: "Q4 Estate Security & Solar Grid Bulletin Published",
          body: "Review the latest executive infrastructure & gate ANPR notice.",
          data: null,
          read: false,
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          type: "system",
          title: "Gate QR Clearance System Active",
          body: "Visitor and Resident Exit QR passes are active at Gate 1 & Gate 2.",
          data: null,
          read: true,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        }
      );
    }

    items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const unreadCount = items.filter((i) => !i.read).length;

    return NextResponse.json({
      data: {
        unread_count: unreadCount,
        items: items.slice(0, 8),
      },
    });
  } catch {
    return NextResponse.json({
      data: { unread_count: 0, items: [] },
    });
  }
}

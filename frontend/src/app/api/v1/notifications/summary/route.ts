import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let unreadAlerts = 0;
    try {
      const a = await sql`SELECT COUNT(*)::int AS cnt FROM estate_alerts WHERE status = 'open'`;
      unreadAlerts = a[0]?.cnt ?? 0;
    } catch {
      unreadAlerts = 0;
    }

    return NextResponse.json({
      data: {
        unread_messages: 0,
        unread_alerts: unreadAlerts,
        unread_total: unreadAlerts,
      },
    });
  } catch {
    return NextResponse.json({
      data: { unread_messages: 0, unread_alerts: 0, unread_total: 0 },
    });
  }
}

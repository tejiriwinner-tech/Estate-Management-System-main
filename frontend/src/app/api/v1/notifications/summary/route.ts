import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    data: {
      unread_messages: 0,
      unread_alerts: 0,
      unread_total: 0,
    },
  });
}

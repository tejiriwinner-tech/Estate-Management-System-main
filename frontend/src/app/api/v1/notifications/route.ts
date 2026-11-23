import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    data: {
      unread_count: 0,
      items: [
        {
          id: 1,
          type: "system",
          title: "System Online",
          body: "Lincoln Estate Management cloud system is operational.",
          data: null,
          read: true,
          created_at: new Date().toISOString(),
        },
      ],
    },
  });
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roomId = Number(id);

    let messages: any[] = [];
    try {
      messages = await sql`
        SELECT m.id, m.chat_room_id, m.body, m.created_at, m.user_id,
               u.name as user_name, u.role as user_role, u.unit_number, u.avatar_url
        FROM chat_messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.chat_room_id = ${roomId}
        ORDER BY m.id ASC
        LIMIT 50
      `;
    } catch (e: any) {
      console.error("Messages query error:", e.message);
    }

    const formatted = messages.map((m: any) => ({
      id: Number(m.id),
      room_id: Number(m.chat_room_id),
      body: m.body,
      created_at: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
      mine: false,
      user: {
        id: Number(m.user_id || 1),
        name: m.user_name || "Estate Member",
        unit_number: m.unit_number || "HQ",
        avatar_url: m.avatar_url,
        role: m.user_role || "resident",
      },
    }));

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch messages.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const roomId = Number(id);

    const res = await sql`
      INSERT INTO chat_messages (chat_room_id, user_id, body, created_at, updated_at)
      VALUES (${roomId}, 1, ${body.body || "Hello"}, NOW(), NOW())
      RETURNING *
    `;

    const row = res[0];
    return NextResponse.json({
      data: {
        id: Number(row.id),
        room_id: roomId,
        body: row.body,
        created_at: new Date(row.created_at).toISOString(),
        mine: true,
        user: {
          id: 1,
          name: "Estate Administrator",
          unit_number: "HQ",
          avatar_url: null,
          role: "admin",
        },
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not send message.", error: err.message }, { status: 500 });
  }
}

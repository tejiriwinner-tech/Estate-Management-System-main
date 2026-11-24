import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function parseSenderPrefix(rawBody: string, fallbackName: string, fallbackRole: string, fallbackUnit: string | null) {
  // Optional embedded sender tag: [From:Name|Role|Email] message
  const match = rawBody.match(/^\[From:([^|\]]+)\|([^|\]]*)\|([^\]]*)\]\s*([\s\S]*)$/);
  if (match) {
    return {
      name: match[1] || fallbackName,
      role: match[2] || fallbackRole,
      email: match[3] || "",
      cleanBody: match[4],
      unit: fallbackUnit,
    };
  }
  return {
    name: fallbackName,
    role: fallbackRole,
    email: "",
    cleanBody: rawBody,
    unit: fallbackUnit,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const roomId = Number(id);
    const { searchParams } = new URL(req.url);
    const afterId = Number(searchParams.get("after_id") || "0");

    const callerEmail = (req.headers.get("x-user-email") || "").toLowerCase().trim();
    const callerName = (req.headers.get("x-user-name") || "").toLowerCase().trim();
    const callerRole = (req.headers.get("x-user-role") || "").toLowerCase().trim();

    let messages: any[] = [];
    try {
      messages = await sql`
        SELECT m.id, m.chat_room_id, m.body, m.created_at, m.user_id,
               u.name as user_name, u.email as user_email, u.role as user_role, u.unit_number, u.avatar_url
        FROM chat_messages m
        LEFT JOIN users u ON u.id = m.user_id
        WHERE m.chat_room_id = ${roomId}
          AND m.id > ${afterId}
        ORDER BY m.id ASC
        LIMIT 80
      `;
    } catch (e: any) {
      console.warn("Messages query fallback:", e.message);
    }

    const formatted = messages.map((m: any) => {
      const parsed = parseSenderPrefix(
        String(m.body || ""),
        m.user_name || "Estate Member",
        m.user_role || "resident",
        m.unit_number || null
      );
      const msgEmail = (parsed.email || m.user_email || "").toLowerCase().trim();
      const msgName = parsed.name.toLowerCase().trim();

      const isMine =
        (callerEmail !== "" && msgEmail !== "" && callerEmail === msgEmail) ||
        (callerName !== "" && msgName === callerName) ||
        (callerEmail === "" && callerName === "" && callerRole === "admin" && Number(m.user_id) === 1);

      return {
        id: Number(m.id),
        room_id: Number(m.chat_room_id),
        body: parsed.cleanBody,
        created_at: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
        mine: isMine,
        user: {
          id: Number(m.user_id || 1),
          name: parsed.name,
          unit_number: parsed.unit,
          avatar_url: m.avatar_url || null,
          role: parsed.role,
        },
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch messages.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const roomId = Number(id);
    const text = String(body.body || "").trim();

    if (!text) {
      return NextResponse.json({ message: "Message cannot be empty." }, { status: 422 });
    }

    const callerEmail = (req.headers.get("x-user-email") || "").toLowerCase().trim();
    const callerRoleHeader = req.headers.get("x-user-role") || "Resident";
    const defaultNameByRole: Record<string, string> = {
      Admin: "Estate Administrator",
      User: "Chinedu Resident",
      Security: "Security Command",
      Agent: "Estate Letting Agent",
      "Store Owner": "Lincoln Central Mart",
    };
    const callerName = req.headers.get("x-user-name") || defaultNameByRole[callerRoleHeader] || "Estate Member";

    let userId = 1;
    let resolvedName = callerName;
    let resolvedRole = callerRoleHeader.toLowerCase();
    let resolvedUnit: string | null = null;

    try {
      // Ensure target room exists so FK never fails
      const roomCheck = await sql`SELECT id FROM chat_rooms WHERE id = ${roomId} LIMIT 1`;
      if (roomCheck.length === 0) {
        await sql`
          INSERT INTO chat_rooms (id, type, name, created_at, updated_at)
          VALUES (${roomId}, 'estate', ${roomId === 2 ? "Security Command & Gate Desk" : "Estate General Community"}, NOW(), NOW())
          ON CONFLICT (id) DO NOTHING
        `;
      }

      if (callerEmail) {
        const found = await sql`SELECT id, name, role, unit_number FROM users WHERE LOWER(email) = ${callerEmail} LIMIT 1`;
        if (found.length > 0) {
          userId = Number(found[0].id);
          resolvedName = found[0].name || resolvedName;
          resolvedRole = found[0].role || resolvedRole;
          resolvedUnit = found[0].unit_number || null;
        } else {
          const fallbackUser = await sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`;
          if (fallbackUser.length > 0) userId = Number(fallbackUser[0].id);
        }
      } else {
        const fallbackUser = await sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`;
        if (fallbackUser.length > 0) userId = Number(fallbackUser[0].id);
      }

      const taggedBody = `[From:${resolvedName}|${resolvedRole}|${callerEmail}] ${text}`;

      const res = await sql`
        INSERT INTO chat_messages (chat_room_id, user_id, body, created_at, updated_at)
        VALUES (${roomId}, ${userId}, ${taggedBody}, NOW(), NOW())
        RETURNING id, created_at
      `;

      const row = res[0];
      return NextResponse.json(
        {
          data: {
            id: Number(row.id),
            room_id: roomId,
            body: text,
            created_at: new Date(row.created_at).toISOString(),
            mine: true,
            user: {
              id: userId,
              name: resolvedName,
              unit_number: resolvedUnit,
              avatar_url: null,
              role: resolvedRole,
            },
          },
        },
        { status: 201 }
      );
    } catch (dbErr: any) {
      console.warn("Chat POST DB fallback:", dbErr.message);
      return NextResponse.json(
        {
          data: {
            id: Date.now(),
            room_id: roomId,
            body: text,
            created_at: new Date().toISOString(),
            mine: true,
            user: {
              id: userId,
              name: resolvedName,
              unit_number: resolvedUnit,
              avatar_url: null,
              role: resolvedRole,
            },
          },
        },
        { status: 201 }
      );
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not send message.", error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const otherUserId = Number(body.user_id);

    const userRows = await sql`SELECT name FROM users WHERE id = ${otherUserId} LIMIT 1`;
    const otherName = userRows[0]?.name || "Member";

    const res = await sql`
      INSERT INTO chat_rooms (type, name, created_at, updated_at)
      VALUES ('direct', ${`Chat with ${otherName}`}, NOW(), NOW())
      RETURNING id
    `;

    return NextResponse.json({ data: { id: Number(res[0].id) } });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not open direct chat.", error: err.message }, { status: 500 });
  }
}

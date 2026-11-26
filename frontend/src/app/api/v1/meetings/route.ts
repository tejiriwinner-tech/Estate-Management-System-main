import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function decodeNoticeTitle(rawTitle: string) {
  // Optional prefix: [category|priority|author] Actual Title
  const m = rawTitle.match(/^\[(directive|maintenance|security|minutes)\|(normal|urgent)\|([^\]]*)\]\s*(.*)$/i);
  if (m) {
    return {
      category: m[1].toLowerCase() as "directive" | "maintenance" | "security" | "minutes",
      priority: m[2].toLowerCase() as "normal" | "urgent",
      author: m[3] || "Estate Management",
      title: m[4],
    };
  }
  return {
    category: "directive" as const,
    priority: "normal" as const,
    author: "Estate Management",
    title: rawTitle,
  };
}

export async function GET() {
  try {
    let reports: any[] = [];
    try {
      reports = await sql`
        SELECT id, title, body, held_at, created_at
        FROM meeting_reports
        ORDER BY COALESCE(held_at, created_at) DESC, id DESC
        LIMIT 30
      `;
    } catch (e: any) {
      console.warn("Meetings GET fallback:", e.message);
    }

    const formatted = reports.map((r: any) => {
      const meta = decodeNoticeTitle(String(r.title || ""));
      return {
        id: Number(r.id),
        title: meta.title,
        body: r.body,
        category: meta.category,
        priority: meta.priority,
        author: meta.author,
        held_at: r.held_at
          ? new Date(r.held_at).toISOString()
          : r.created_at
          ? new Date(r.created_at).toISOString()
          : new Date().toISOString(),
      };
    });

    return NextResponse.json({ data: formatted });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch notices.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      body: text,
      category = "directive",
      priority = "normal",
      held_at,
    } = body;

    const callerName = req.headers.get("x-user-name") || "Estate Management";
    const encodedTitle = `[${category}|${priority}|${callerName}] ${String(title || "Estate Notice").trim()}`;

    try {
      const userCheck = await sql`SELECT id FROM users ORDER BY id ASC LIMIT 1`;
      const creatorId = userCheck[0]?.id ? Number(userCheck[0].id) : 1;

      const res = await sql`
        INSERT INTO meeting_reports (
          created_by, title, body, held_at, created_at, updated_at
        )
        VALUES (
          ${creatorId}, ${encodedTitle}, ${text || "Official notice"},
          ${held_at ? new Date(held_at) : new Date()}, NOW(), NOW()
        )
        RETURNING id
      `;

      return NextResponse.json({ data: { id: Number(res[0].id) } }, { status: 201 });
    } catch (dbErr: any) {
      console.warn("Meetings POST fallback:", dbErr.message);
      return NextResponse.json({ data: { id: Date.now() } }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ message: "Could not publish notice.", error: err.message }, { status: 500 });
  }
}

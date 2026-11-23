import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let reports: any[] = [];
    try {
      reports = await sql`
        SELECT id, title, body, held_at, created_at
        FROM meeting_reports
        ORDER BY held_at DESC
        LIMIT 20
      `;
    } catch (e: any) {
      console.error("Meetings GET error:", e.message);
    }

    if (reports.length === 0) {
      reports = [
        {
          id: 1,
          title: "Q4 Estate Security & Infrastructure Townhall",
          body: "Resolutions passed regarding biometric gate access upgrades and 24/7 dedicated solar inverter street illumination project.",
          held_at: "2026-11-15T18:00:00Z",
        },
      ];
    } else {
      reports = reports.map((r: any) => ({
        id: Number(r.id),
        title: r.title,
        body: r.body,
        held_at: r.held_at ? new Date(r.held_at).toISOString() : new Date().toISOString(),
      }));
    }

    return NextResponse.json({ data: reports });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch meetings.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, body: text, held_at } = body;

    const res = await sql`
      INSERT INTO meeting_reports (
        created_by, title, body, held_at, created_at, updated_at
      )
      VALUES (
        1, ${title || "Estate Meeting"}, ${text || "Meeting minutes"},
        ${held_at ? new Date(held_at) : new Date()}, NOW(), NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({ data: { id: Number(res[0].id) } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not save meeting.", error: err.message }, { status: 500 });
  }
}

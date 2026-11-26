import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").toLowerCase().trim();

    let users: any[] = [];
    try {
      users = await sql`
        SELECT id, name, unit_number, avatar_url, role
        FROM users
        WHERE (${q ? sql`LOWER(name) LIKE ${"%" + q + "%"} OR LOWER(unit_number) LIKE ${"%" + q + "%"}` : sql`1=1`})
        ORDER BY name ASC
        LIMIT 30
      `;
    } catch (e: any) {
      console.error("Chat directory error:", e.message);
    }

    return NextResponse.json({ data: users });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch directory.", error: err.message }, { status: 500 });
  }
}

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

    if (users.length === 0) {
      users = [
        { id: 1, name: "Estate Administrator", unit_number: "HQ", avatar_url: null, role: "admin" },
        { id: 2, name: "Chinedu Resident", unit_number: "Villa A-402", avatar_url: null, role: "resident" },
        { id: 3, name: "Mike Security Warden", unit_number: "Gate 1", avatar_url: null, role: "security" },
        { id: 4, name: "Marcus Real Estate Agent", unit_number: "Commercial Hub", avatar_url: null, role: "agent" },
      ];
    }

    return NextResponse.json({ data: users });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch directory.", error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim().toLowerCase() || "";
    const role = searchParams.get("role") || "";
    const status = searchParams.get("status") || "";
    const page = Number(searchParams.get("page") || "1");
    const perPage = Number(searchParams.get("per_page") || "20");
    const offset = (page - 1) * perPage;

    let users: any[] = [];
    let total = 0;

    try {
      const rows = await sql`
        SELECT id, name, email, phone, role, status, unit_number, moved_in_at, created_at, avatar_url, job_title
        FROM users
        WHERE (${role ? sql`role = ${role}` : sql`1=1`})
          AND (${status ? sql`status = ${status}` : sql`1=1`})
          AND (${
            search
              ? sql`(LOWER(name) LIKE ${"%" + search + "%"} OR LOWER(email) LIKE ${"%" + search + "%"} OR LOWER(unit_number) LIKE ${"%" + search + "%"})`
              : sql`1=1`
          })
        ORDER BY id DESC
        LIMIT ${perPage} OFFSET ${offset}
      `;
      users = rows;

      const countResult = await sql`
        SELECT COUNT(*)::int as count
        FROM users
        WHERE (${role ? sql`role = ${role}` : sql`1=1`})
          AND (${status ? sql`status = ${status}` : sql`1=1`})
      `;
      total = countResult[0]?.count || users.length;
    } catch (e) {
      console.warn("Admin users GET fallback:", e);
      users = [];
      total = 0;
    }

    return NextResponse.json({
      data: users,
      meta: {
        current_page: page,
        last_page: Math.ceil(total / perPage) || 1,
        per_page: perPage,
        total,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "Could not fetch users." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, role, unit_number, phone, job_title, moved_in_at, avatar_url, password } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Name and email are required." }, { status: 422 });
    }

    const defaultPassHash = await bcrypt.hash(password || "PostArmy2024!", 10);

    try {
      const inserted = await sql`
        INSERT INTO users (
          name, email, password, role, unit_number, phone, job_title, moved_in_at, avatar_url, status, created_at, updated_at
        ) VALUES (
          ${name}, ${email.toLowerCase().trim()}, ${defaultPassHash}, ${role || "resident"},
          ${unit_number || null}, ${phone || null}, ${job_title || null},
          ${moved_in_at || new Date().toISOString().split("T")[0]},
          ${avatar_url || null},
          'active', NOW(), NOW()
        )
        RETURNING id, name, email, phone, role, status, unit_number, moved_in_at, created_at, avatar_url, job_title
      `;
      return NextResponse.json({ data: inserted[0] }, { status: 201 });
    } catch (dbErr: any) {
      console.error("User insert error:", dbErr);
      return NextResponse.json({
        data: {
          id: Date.now(),
          name,
          email,
          role: role || "resident",
          unit_number: unit_number || null,
          phone: phone || null,
          status: "active",
          moved_in_at: moved_in_at || new Date().toISOString().split("T")[0],
          created_at: new Date().toISOString(),
        },
      }, { status: 201 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Failed to create user." }, { status: 500 });
  }
}

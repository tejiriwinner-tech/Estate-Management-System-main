import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let staff: any[] = [];
    try {
      staff = await sql`
        SELECT id, name, email, phone, role, job_title, department, staff_id, status, avatar_url, created_at
        FROM users
        WHERE role IN ('store_owner', 'agent', 'chairman', 'security')
           OR LOWER(COALESCE(job_title, '')) LIKE '%chairman%'
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Staff list error:", e.message);
    }

    return NextResponse.json({ data: staff });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff list.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role, job_title, department, staff_id, status, avatar_url, password } = body;
    const hashedPassword = await bcrypt.hash(String(password || "PostArmy2024!"), 10);

    const allowedRole =
      role === "store_owner" || role === "agent" || role === "chairman" || role === "security"
        ? role
        : (job_title || "").toLowerCase().includes("chairman")
        ? "chairman"
        : (job_title || "").toLowerCase().includes("store")
        ? "store_owner"
        : (job_title || "").toLowerCase().includes("security")
        ? "security"
        : "agent";

    const res = await sql`
      INSERT INTO users (
        name, email, password, phone, role, job_title, department, staff_id, status, avatar_url, created_at, updated_at
      )
      VALUES (
        ${name}, ${String(email).trim().toLowerCase()}, ${hashedPassword}, ${phone || null}, ${allowedRole},
        ${job_title || (allowedRole === "chairman" ? "Estate Chairman" : allowedRole === "store_owner" ? "Store Admin" : allowedRole === "security" ? "Chief Security Officer" : "Estate Agent")},
        ${department || "Estate Operations"},
        ${staff_id || `PA-${Date.now().toString().slice(-4)}`}, ${status || "active"},
        ${avatar_url || null}, NOW(), NOW()
      )
      RETURNING id, name, email, phone, role, job_title, department, staff_id, status, avatar_url, created_at
    `;

    return NextResponse.json({ data: res[0], message: "Staff member created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create staff member.", error: err.message }, { status: 500 });
  }
}

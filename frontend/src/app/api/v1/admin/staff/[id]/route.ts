import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

function mapRoleFromTitle(role?: string | null, jobTitle?: string | null): string | null {
  if (role && ["chairman", "agent", "store_owner", "security", "admin", "manager"].includes(role)) {
    return role;
  }
  const t = (jobTitle || "").toLowerCase();
  if (t.includes("chairman")) return "chairman";
  if (t.includes("store")) return "store_owner";
  if (t.includes("security")) return "security";
  if (t.includes("agent")) return "agent";
  return null;
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, job_title, department, staff_id, status, avatar_url, password } = body;

    const mappedRole = mapRoleFromTitle(role, job_title);
    const passwordHash = password ? await bcrypt.hash(String(password), 10) : null;

    const res = await sql`
      UPDATE users
      SET name = COALESCE(${name ?? null}, name),
          email = COALESCE(${email ? String(email).trim().toLowerCase() : null}, email),
          phone = COALESCE(${phone ?? null}, phone),
          role = COALESCE(${mappedRole}, role),
          job_title = COALESCE(${job_title ?? null}, job_title),
          department = COALESCE(${department ?? null}, department),
          staff_id = COALESCE(${staff_id ?? null}, staff_id),
          status = COALESCE(${status ?? null}, status),
          avatar_url = COALESCE(${avatar_url ?? null}, avatar_url),
          password = COALESCE(${passwordHash}, password),
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING id, name, email, phone, role, job_title, department, staff_id, status, avatar_url, created_at
    `;

    if (res.length === 0) {
      return NextResponse.json({ message: "Staff member not found." }, { status: 404 });
    }

    return NextResponse.json({ data: res[0], message: "Staff member updated successfully." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update staff member.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Staff member deleted." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete staff member.", error: err.message }, { status: 500 });
  }
}

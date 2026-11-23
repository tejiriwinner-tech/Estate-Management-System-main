import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, email, phone, role, job_title, department, staff_id, status } = body;

    const res = await sql`
      UPDATE users
      SET name = COALESCE(${name}, name),
          email = COALESCE(${email}, email),
          phone = COALESCE(${phone}, phone),
          role = COALESCE(${role}, role),
          job_title = COALESCE(${job_title}, job_title),
          department = COALESCE(${department}, department),
          staff_id = COALESCE(${staff_id}, staff_id),
          status = COALESCE(${status}, status),
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING id, name, email, phone, role, job_title, department, staff_id, status
    `;

    return NextResponse.json({ data: res[0], message: "Staff member updated." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update staff member.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM users WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Staff member deleted." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete staff member.", error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, role_in_family, age, gender } = body;

    const res = await sql`
      UPDATE family_members
      SET name = COALESCE(${name}, name),
          role_in_family = COALESCE(${role_in_family}, role_in_family),
          age = COALESCE(${Number(age) || null}, age),
          gender = COALESCE(${gender}, gender),
          updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Family member updated." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not update family member.", error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await sql`DELETE FROM family_members WHERE id = ${Number(id)}`;
    return NextResponse.json({ message: "Family member deleted." });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not delete family member.", error: err.message }, { status: 500 });
  }
}

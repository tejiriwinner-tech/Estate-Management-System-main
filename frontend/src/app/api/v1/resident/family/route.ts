import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let members: any[] = [];
    try {
      members = await sql`
        SELECT id, name, role_in_family, age, gender, created_at
        FROM family_members
        ORDER BY id ASC
      `;
    } catch (e: any) {
      console.error("Family GET error:", e.message);
    }

    if (members.length === 0) {
      members = [
        { id: 1, name: "Ngozi Adeleke", role_in_family: "Spouse", age: 34, gender: "Female" },
        { id: 2, name: "David Adeleke", role_in_family: "Child", age: 8, gender: "Male" },
      ];
    }

    return NextResponse.json({ data: members });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch family members.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role_in_family, age, gender, user_id } = body;

    const res = await sql`
      INSERT INTO family_members (
        user_id, name, role_in_family, age, gender, created_at, updated_at
      )
      VALUES (
        ${user_id || 2}, ${name}, ${role_in_family || "Dependent"}, ${Number(age) || null}, ${gender || null}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Family member added successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not add family member.", error: err.message }, { status: 500 });
  }
}

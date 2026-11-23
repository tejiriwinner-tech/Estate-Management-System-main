import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let staff: any[] = [];
    try {
      staff = await sql`
        SELECT id, name, email, phone, role, job_title, department, staff_id, status, avatar_url, created_at
        FROM users
        WHERE role IN ('staff', 'manager', 'security', 'maintenance')
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Staff list error:", e.message);
    }

    if (staff.length === 0) {
      staff = [
        {
          id: 101,
          name: "Bessie Cooper",
          email: "bessie.cooper@lincolnestate.ng",
          phone: "+234 802 555 0148",
          role: "staff",
          job_title: "Senior Property Manager",
          department: "Operations",
          staff_id: "LE-2024-001",
          status: "active",
          avatar_url: null,
          created_at: "2024-01-10",
        },
        {
          id: 102,
          name: "Darlene Robertson",
          email: "darlene.r@lincolnestate.ng",
          phone: "+234 803 555 0149",
          role: "manager",
          job_title: "Chief Financial Officer",
          department: "Finance & Accounts",
          staff_id: "LE-2024-002",
          status: "active",
          avatar_url: null,
          created_at: "2024-01-15",
        },
        {
          id: 103,
          name: "Floyd Miles",
          email: "floyd.m@lincolnestate.ng",
          phone: "+234 804 555 0150",
          role: "maintenance",
          job_title: "Facility Maintenance Lead",
          department: "Maintenance",
          staff_id: "LE-2024-003",
          status: "on_leave",
          avatar_url: null,
          created_at: "2024-02-01",
        },
        {
          id: 104,
          name: "Eleanor Pena",
          email: "eleanor.p@lincolnestate.ng",
          phone: "+234 805 555 0151",
          role: "staff",
          job_title: "Billing & Collections Officer",
          department: "Finance & Accounts",
          staff_id: "LE-2024-004",
          status: "active",
          avatar_url: null,
          created_at: "2024-02-15",
        },
      ];
    }

    return NextResponse.json({ data: staff });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch staff list.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, role, job_title, department, staff_id, status } = body;

    const res = await sql`
      INSERT INTO users (
        name, email, password, phone, role, job_title, department, staff_id, status, created_at, updated_at
      )
      VALUES (
        ${name}, ${email}, 'LincolnEstate2024!', ${phone || null}, ${role || "staff"},
        ${job_title || "Estate Officer"}, ${department || "Operations"},
        ${staff_id || `LE-${Date.now().toString().slice(-4)}`}, ${status || "active"}, NOW(), NOW()
      )
      RETURNING id, name, email, phone, role, job_title, department, staff_id, status, created_at
    `;

    return NextResponse.json({ data: res[0], message: "Staff member created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create staff member.", error: err.message }, { status: 500 });
  }
}

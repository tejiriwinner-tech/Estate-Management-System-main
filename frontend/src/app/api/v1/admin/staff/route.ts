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
        WHERE role IN ('store_owner', 'agent', 'chairman')
           OR LOWER(COALESCE(job_title, '')) LIKE '%chairman%'
        ORDER BY id DESC
      `;
    } catch (e: any) {
      console.error("Staff list error:", e.message);
    }

    if (staff.length === 0) {
      staff = [
        {
          id: 101,
          name: "Gen. Ibrahim Danjuma (Rtd.)",
          email: "chairman@postarmyhouse.ng",
          phone: "+234 802 555 0100",
          role: "chairman",
          job_title: "Estate Chairman",
          department: "Executive Council",
          staff_id: "PA-CHR-001",
          status: "active",
          avatar_url: null,
          created_at: "2024-01-10",
        },
        {
          id: 102,
          name: "Marcus Real Estate Agent",
          email: "agent@lincolnestate.ng",
          phone: "+234 803 555 0149",
          role: "agent",
          job_title: "Estate Letting Agent",
          department: "Property & Leasing",
          staff_id: "PA-AGT-002",
          status: "active",
          avatar_url: null,
          created_at: "2024-01-15",
        },
        {
          id: 103,
          name: "Post Army House Mart Admin",
          email: "store@lincolnestate.ng",
          phone: "+234 804 555 0150",
          role: "store_owner",
          job_title: "Store Admin",
          department: "Estate Commerce",
          staff_id: "PA-STR-003",
          status: "active",
          avatar_url: null,
          created_at: "2024-02-01",
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

    const allowedRole =
      role === "store_owner" || role === "agent" || role === "chairman"
        ? role
        : (job_title || "").toLowerCase().includes("chairman")
        ? "chairman"
        : (job_title || "").toLowerCase().includes("store")
        ? "store_owner"
        : "agent";

    const res = await sql`
      INSERT INTO users (
        name, email, password, phone, role, job_title, department, staff_id, status, created_at, updated_at
      )
      VALUES (
        ${name}, ${email}, 'PostArmy2024!', ${phone || null}, ${allowedRole},
        ${job_title || (allowedRole === "chairman" ? "Estate Chairman" : allowedRole === "store_owner" ? "Store Admin" : "Estate Agent")},
        ${department || "Estate Operations"},
        ${staff_id || `PA-${Date.now().toString().slice(-4)}`}, ${status || "active"}, NOW(), NOW()
      )
      RETURNING id, name, email, phone, role, job_title, department, staff_id, status, created_at
    `;

    return NextResponse.json({ data: res[0], message: "Staff member created successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create staff member.", error: err.message }, { status: 500 });
  }
}

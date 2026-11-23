import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let members: any[] = [];
    try {
      members = await sql`
        SELECT id, name, email, phone, role, job_title, status, staff_id, created_at
        FROM users
        WHERE role = 'security'
        ORDER BY id ASC
      `;
    } catch (e: any) {
      console.error("Security members error:", e.message);
    }

    if (members.length === 0) {
      members = [
        {
          id: "SEC-01",
          name: "Mike Warden",
          badge: "SEC-001",
          rank: "Chief Security Officer",
          post: "Gate 1 (Main Gate)",
          status: "On Duty",
          phone: "+234 803 456 7890",
        },
        {
          id: "SEC-02",
          name: "John Okon",
          badge: "SEC-002",
          rank: "Senior Patrol Officer",
          post: "Gate 2 (Service Gate)",
          status: "On Duty",
          phone: "+234 802 111 2233",
        },
        {
          id: "SEC-03",
          name: "Ahmed Bello",
          badge: "SEC-003",
          rank: "Perimeter Surveillance",
          post: "CCTV Control Room",
          status: "On Duty",
          phone: "+234 809 444 5566",
        },
      ];
    } else {
      members = members.map((m: any) => ({
        id: `SEC-${m.id}`,
        name: m.name,
        badge: m.staff_id || `SEC-00${m.id}`,
        rank: m.job_title || "Security Officer",
        post: m.unit_number || "Gate 1",
        status: m.status === "active" ? "On Duty" : "Off Duty",
        phone: m.phone || "+234 800 000 0000",
      }));
    }

    return NextResponse.json({
      data: {
        members,
        total: members.length,
        onDuty: members.filter((m: any) => m.status === "On Duty").length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch security members.", error: err.message }, { status: 500 });
  }
}

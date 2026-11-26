import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let agentUsers: any[] = [];
    try {
      agentUsers = await sql`
        SELECT u.id, u.name, u.email, u.phone, u.unit_number, u.status, u.created_at,
               COUNT(l.id)::int as listings_count
        FROM users u
        LEFT JOIN listings l ON l.agent_id = u.id
        WHERE u.role = 'agent'
        GROUP BY u.id
        ORDER BY u.id ASC
      `;
    } catch (e: any) {
      console.error("Agents query error:", e.message);
    }

    const agents = agentUsers.map((u: any, idx: number) => {
      const initials = u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
      const colors = ["bg-emerald-600", "bg-amber-600", "bg-blue-600", "bg-rose-600", "bg-purple-600"];
      return {
        id: String(u.id),
        name: u.name,
        initials: initials || "AG",
        email: u.email,
        phone: u.phone || "—",
        zone: u.unit_number || "Post Army House Estate",
        status: (u.status === "active" ? "Active" : "Inactive") as any,
        joinedOn: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
        activeListings: Number(u.listings_count) || 0,
        openLeads: 0,
        dealsClosed: 0,
        commission: 0,
        targetProgress: 0,
        rating: 0,
        reviews: 0,
        avatarBg: colors[idx % colors.length],
      };
    });

    return NextResponse.json({
      data: {
        performance: [],
        pipeline: [
          { stage: "New Leads" as const, count: 0, color: "#3b82f6" },
          { stage: "Contacted" as const, count: 0, color: "#f59e0b" },
          { stage: "Viewing Scheduled" as const, count: 0, color: "#8b5cf6" },
          { stage: "Negotiation" as const, count: 0, color: "#ec4899" },
          { stage: "Closed Won" as const, count: 0, color: "#10b981" },
        ],
        agents,
        viewings: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch agent directory.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, zone } = body;

    const res = await sql`
      INSERT INTO users (
        name, email, password, phone, role, status, job_title, department, created_at, updated_at
      )
      VALUES (
        ${name}, ${email}, 'Post Army House Estate2024!', ${phone || null}, 'agent', 'active',
        'Certified Estate Agent', ${zone || 'Commercial Hub'}, NOW(), NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ data: res[0], message: "Agent registered successfully." }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not register agent.", error: err.message }, { status: 500 });
  }
}

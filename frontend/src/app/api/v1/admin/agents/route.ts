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

    const defaultAgents = [
      {
        id: "1",
        name: "Marcus Reed",
        initials: "MR",
        email: "agent@lincolnestate.ng",
        phone: "+234 804 567 8901",
        zone: "Phase 1 – Lekki",
        status: "Active" as const,
        joinedOn: "2024-01-15",
        activeListings: 4,
        openLeads: 18,
        dealsClosed: 14,
        commission: 6800000,
        targetProgress: 92,
        rating: 4.8,
        reviews: 32,
        avatarBg: "bg-emerald-600",
      },
      {
        id: "2",
        name: "Aisha Mohammed",
        initials: "AM",
        email: "aisha.m@lincolnestate.ng",
        phone: "+234 802 333 4455",
        zone: "Phase 2 – Ajah",
        status: "Active" as const,
        joinedOn: "2024-03-01",
        activeListings: 6,
        openLeads: 24,
        dealsClosed: 9,
        commission: 4200000,
        targetProgress: 85,
        rating: 4.6,
        reviews: 19,
        avatarBg: "bg-amber-600",
      },
      {
        id: "3",
        name: "Tunde Adekunle",
        initials: "TA",
        email: "tunde.a@lincolnestate.ng",
        phone: "+234 805 111 2233",
        zone: "Phase 1 – Lekki",
        status: "Active" as const,
        joinedOn: "2024-02-10",
        activeListings: 2,
        openLeads: 11,
        dealsClosed: 8,
        commission: 3600000,
        targetProgress: 78,
        rating: 4.5,
        reviews: 15,
        avatarBg: "bg-blue-600",
      },
    ];

    const agents = agentUsers.length > 0
      ? agentUsers.map((u: any, idx: number) => {
          const initials = u.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2);
          const colors = ["bg-emerald-600", "bg-amber-600", "bg-blue-600", "bg-rose-600", "bg-purple-600"];
          return {
            id: String(u.id),
            name: u.name,
            initials: initials || "AG",
            email: u.email,
            phone: u.phone || "+234 800 000 0000",
            zone: "Phase 1 – Lekki",
            status: (u.status === "active" ? "Active" : "Inactive") as any,
            joinedOn: u.created_at ? new Date(u.created_at).toISOString().split("T")[0] : "2024-01-15",
            activeListings: Number(u.listings_count) || 3,
            openLeads: 12 + idx * 4,
            dealsClosed: 8 + idx * 3,
            commission: (3500000 + idx * 1200000),
            targetProgress: 80 + idx * 5,
            rating: 4.7,
            reviews: 18 + idx * 6,
            avatarBg: colors[idx % colors.length],
          };
        })
      : defaultAgents;

    return NextResponse.json({
      data: {
        performance: [
          { month: "Jun", dealsClosed: 6, commission: 2800000 },
          { month: "Jul", dealsClosed: 9, commission: 4100000 },
          { month: "Aug", dealsClosed: 7, commission: 3200000 },
          { month: "Sep", dealsClosed: 11, commission: 5400000 },
          { month: "Oct", dealsClosed: 8, commission: 3900000 },
          { month: "Nov", dealsClosed: 14, commission: 6800000 },
        ],
        pipeline: [
          { stage: "New Leads" as const, count: 48, color: "#3b82f6" },
          { stage: "Contacted" as const, count: 32, color: "#f59e0b" },
          { stage: "Viewing Scheduled" as const, count: 18, color: "#8b5cf6" },
          { stage: "Negotiation" as const, count: 12, color: "#ec4899" },
          { stage: "Closed Won" as const, count: 28, color: "#10b981" },
        ],
        agents,
        viewings: [
          { id: "VW-1", property: "Luxury 4-Bedroom Terrace", client: "Dr. Ngozi Eze", agentId: "1", date: "2026-11-24", time: "11:00 AM", status: "Confirmed" as const },
          { id: "VW-2", property: "Executive 3-Bedroom Flat", client: "Alhaji Danjuma", agentId: "2", date: "2026-11-25", time: "02:30 PM", status: "Confirmed" as const },
          { id: "VW-3", property: "Commercial Space Block B", client: "MegaMart Ltd", agentId: "1", date: "2026-11-26", time: "04:00 PM", status: "Pending" as const },
        ],
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

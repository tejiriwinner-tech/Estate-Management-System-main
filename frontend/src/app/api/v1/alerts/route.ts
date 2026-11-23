import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let rows: any[] = [];
    try {
      rows = await sql`
        SELECT a.id, a.category, a.message, a.location, a.status, a.created_at,
               u.id as user_id, u.name as user_name, u.unit_number, u.avatar_url, u.role as user_role
        FROM estate_alerts a
        LEFT JOIN users u ON u.id = a.sender_id
        ORDER BY a.id DESC
        LIMIT 30
      `;
    } catch (e: any) {
      console.error("Alerts GET error:", e.message);
    }

    const defaultAlerts = [
      {
        id: 1,
        category: "life_threat" as const,
        message: "Medical Emergency Assistance Requested",
        location: "Villa A-402, Palm Crescent",
        status: "open",
        created_at: new Date().toISOString(),
        sender: { id: 2, name: "Chinedu Resident", unit_number: "Villa A-402", avatar_url: null, role: "resident" },
      },
    ];

    const alerts = rows.length > 0
      ? rows.map((r: any) => ({
          id: Number(r.id),
          category: r.category || "intelligence",
          message: r.message,
          location: r.location,
          status: r.status || "open",
          created_at: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          sender: {
            id: Number(r.user_id || 1),
            name: r.user_name || "Estate Security",
            unit_number: r.unit_number || "Gate 1",
            avatar_url: r.avatar_url,
            role: r.user_role || "security",
          },
        }))
      : defaultAlerts;

    return NextResponse.json({ data: alerts });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch alerts.", error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, message, location, sender_id } = body;

    const res = await sql`
      INSERT INTO estate_alerts (
        sender_id, category, message, location, status, created_at, updated_at
      )
      VALUES (
        ${sender_id || 3}, ${category || "intelligence"}, ${message || "Emergency Alert"},
        ${location || "Lincoln Estate"}, 'open', NOW(), NOW()
      )
      RETURNING id
    `;

    return NextResponse.json({ data: { id: Number(res[0].id) } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not create alert.", error: err.message }, { status: 500 });
  }
}

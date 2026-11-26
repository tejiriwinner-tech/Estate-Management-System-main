import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let alerts: any[] = [];
    let residents: any[] = [];
    let intel: any[] = [];

    try {
      const alertRows = await sql`
        SELECT a.id, a.category, a.message, a.location, a.status, a.created_at,
               u.name as resident_name
        FROM estate_alerts a
        LEFT JOIN users u ON u.id = a.sender_id
        WHERE a.status = 'open'
        ORDER BY a.id DESC
        LIMIT 5
      `;
      alerts = alertRows.map((r: any) => ({
        id: String(r.id),
        type: r.category === "life_threat" ? "LIFE_UNDER_THREAT" : "INTRUSION",
        resident: r.resident_name || "Estate Resident",
        location: r.location || "Army Estate Phase 1",
        detail: r.message || "Active security dispatch",
        time: r.created_at
          ? new Date(r.created_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })
          : "Just now",
      }));

      let pendingMap = new Map<number, number>();
      try {
        const scRows = await sql`
          SELECT user_id, SUM(amount)::numeric AS total_due
          FROM service_charges
          WHERE status = 'Pending' AND user_id IS NOT NULL
          GROUP BY user_id
        `;
        for (const s of scRows) {
          pendingMap.set(Number(s.user_id), Number(s.total_due || 0));
        }
      } catch {
        // service_charges may not exist yet
      }

      const resRows = await sql`
        SELECT u.id, u.name, u.unit_number, u.status
        FROM users u
        WHERE u.role = 'resident'
        ORDER BY u.id DESC
        LIMIT 10
      `;
      residents = resRows.map((r: any) => {
        const due = pendingMap.get(Number(r.id)) || 0;
        return {
          id: String(r.id),
          name: r.name || "Estate Resident",
          tag: `${r.unit_number || "Villa A-402"} • ${due > 0 ? `Service Charge: ₦${due.toLocaleString()} Due` : "Service Charge: Cleared"}`,
          status: r.status === "blocked" ? "RESTRICTED" : "VERIFIED",
          lastActivity: "QR / ANPR Active",
          serviceCharge: due > 0 ? `₦${due.toLocaleString()} Due` : "Cleared",
        };
      });
    } catch (e: any) {
      console.warn("Security HQ DB notice:", e.message);
    }

    intel = alerts.map((a) => ({
      id: a.id,
      title: a.location,
      snippet: a.detail,
      tags: [{ label: a.type, variant: "default" }],
      time: a.time,
    }));

    return NextResponse.json({
      alerts,
      highPriorityCount: alerts.filter((a) => a.type === "LIFE_UNDER_THREAT").length,
      residents,
      intel,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch HQ data.", error: err.message }, { status: 500 });
  }
}

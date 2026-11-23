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
        SELECT a.id, a.type, a.title, a.body, a.unit, a.priority, a.status, a.created_at,
               u.name as resident_name, u.phone as resident_phone
        FROM alerts a
        LEFT JOIN users u ON u.id = a.user_id
        WHERE a.status = 'open' OR a.status = 'active'
        ORDER BY a.id DESC
        LIMIT 5
      `;
      alerts = alertRows.map((r: any) => ({
        id: String(r.id),
        resident: r.resident_name || "Resident",
        houseUnit: r.unit || "Villa A-402",
        time: new Date(r.created_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }),
        phone: r.resident_phone || "+234 801 234 5678",
        priority: r.priority || "high",
      }));

      const resRows = await sql`
        SELECT u.id, u.name, u.unit_number, u.status, u.phone,
               (SELECT count(*)::int FROM vehicles v WHERE v.user_id = u.id) as vehicle_count
        FROM users u
        WHERE u.role = 'resident'
        ORDER BY u.id DESC
        LIMIT 10
      `;
      residents = resRows.map((r: any) => ({
        id: String(r.id),
        name: r.name,
        houseUnit: r.unit_number || "Villa A-402",
        status: r.status === "active" ? "Active" : "Pending",
        phone: r.phone || "+234 800 000 0000",
        vehicles: r.vehicle_count || 1,
      }));

      const intelRows = await sql`
        SELECT id, text, created_at, is_completed
        FROM reminders
        ORDER BY id DESC
        LIMIT 5
      `;
      intel = intelRows.map((r: any) => ({
        id: String(r.id),
        text: r.text,
        time: new Date().toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }),
        level: r.is_completed ? "normal" : "elevated",
      }));
    } catch (e: any) {
      console.warn("Security HQ DB err:", e.message);
    }

    if (residents.length === 0) {
      residents = [
        { id: "2", name: "Chinedu Resident", houseUnit: "Villa A-402", status: "Active", phone: "+234 801 234 5678", vehicles: 2 },
      ];
    }

    if (intel.length === 0) {
      intel = [
        { id: "1", text: "Perimeter optical beam Phase 2 operational test passed.", time: "12:00 PM", level: "normal" },
        { id: "2", text: "Gate 1 ANPR camera 4K night mode firmware updated.", time: "10:30 AM", level: "normal" },
      ];
    }

    return NextResponse.json({
      alerts,
      highPriorityCount: alerts.filter((a) => a.priority === "high").length,
      residents,
      intel,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch HQ data.", error: err.message }, { status: 500 });
  }
}

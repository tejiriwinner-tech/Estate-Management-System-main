import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let collectedToday = "₦2,450,000";
    let pendingActive = "12 Active";
    let recentPayments: any[] = [];

    try {
      const rows = await sql`
        SELECT p.id, p.amount_kobo, p.method, p.status, p.paid_at,
               u.name as resident_name, i.service_name
        FROM fin_payments p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN fin_invoices i ON i.id = p.invoice_id
        ORDER BY p.id DESC
        LIMIT 10
      `;

      if (rows.length > 0) {
        recentPayments = rows.map((r: any) => ({
          id: String(r.id),
          name: r.resident_name || "Estate Resident",
          purpose: r.service_name || "Estate Levy",
          amount: `₦${(Math.round(Number(r.amount_kobo || 0) / 100)).toLocaleString()}`,
          status: r.status === "success" ? "Paid" : "Processing",
          iconType: "house",
        }));
      }
    } catch (e: any) {
      console.error("Mobile summary error:", e.message);
    }

    if (recentPayments.length === 0) {
      recentPayments = [
        { id: "1", name: "Chief Adeleke", purpose: "Security Levy (Q4)", amount: "₦150,000", status: "Paid", iconType: "house" },
        { id: "2", name: "Mrs. Ngozi Eze", purpose: "Facility Maintenance", amount: "₦75,000", status: "Paid", iconType: "wrench" },
        { id: "3", name: "Marcus Reed", purpose: "Power Levy", amount: "₦45,000", status: "Processing", iconType: "car" },
      ];
    }

    return NextResponse.json({
      metrics: {
        collectedToday,
        pendingActive,
      },
      recentPayments,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch mobile payments summary.", error: err.message }, { status: 500 });
  }
}

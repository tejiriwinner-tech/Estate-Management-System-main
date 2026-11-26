import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let collectedTodayNaira = 0;
    let pendingCount = 0;
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

      for (const r of rows) {
        const amt = Math.round(Number(r.amount_kobo || 0) / 100);
        if (r.status === "success" || r.status === "paid") {
          collectedTodayNaira += amt;
        } else {
          pendingCount += 1;
        }
        recentPayments.push({
          id: String(r.id),
          name: r.resident_name || "Estate Resident",
          purpose: r.service_name || "Estate Levy",
          amount: `₦${amt.toLocaleString()}`,
          status: r.status === "success" || r.status === "paid" ? "Paid" : "Processing",
          iconType: "house",
        });
      }
    } catch (e: any) {
      console.error("Mobile summary error:", e.message);
    }

    return NextResponse.json({
      metrics: {
        collectedToday: `₦${collectedTodayNaira.toLocaleString()}`,
        pendingActive: `${pendingCount} Active`,
      },
      recentPayments,
    });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not fetch mobile payments summary.", error: err.message }, { status: 500 });
  }
}

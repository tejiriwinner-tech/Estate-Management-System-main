import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { FinanceOverviewData } from "@/types/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let totalCollected = 0;
    let pendingInvoices = 0;
    let residentCount = 0;

    try {
      const scPaid = await sql`SELECT COALESCE(SUM(amount), 0)::numeric as total FROM service_charges WHERE status = 'Paid'`;
      const scPending = await sql`SELECT COALESCE(SUM(amount), 0)::numeric as total FROM service_charges WHERE status != 'Paid'`;
      totalCollected = Number(scPaid[0]?.total || 0);
      pendingInvoices = Number(scPending[0]?.total || 0);

      const resCnt = await sql`SELECT COUNT(*)::int as c FROM users WHERE role = 'resident'`;
      residentCount = Number(resCnt[0]?.c || 0);
    } catch {
      // Zeroed defaults
    }

    const totalBilled = totalCollected + pendingInvoices;
    const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

    const data: FinanceOverviewData = {
      metrics: [
        {
          id: "total-collected",
          title: "Total Collected",
          value: `₦${totalCollected.toLocaleString()}`,
          subtitle: "Verified service charges",
          subtitleType: "trend-up",
          icon: "wallet",
          badgeBg: "bg-emerald-50",
          iconColor: "text-emerald-600",
        },
        {
          id: "pending-invoices",
          title: "Pending Invoices",
          value: `₦${pendingInvoices.toLocaleString()}`,
          subtitle: "Outstanding dues",
          subtitleType: "warning",
          icon: "hourglass",
          badgeBg: "bg-amber-50",
          iconColor: "text-amber-600",
        },
        {
          id: "collection-efficiency",
          title: "Collection Rate",
          value: `${rate}%`,
          subtitle: "Live compliance",
          subtitleType: "trend-up",
          icon: "chart",
          badgeBg: "bg-blue-50",
          iconColor: "text-blue-600",
        },
        {
          id: "active-subscribers",
          title: "Registered Residents",
          value: String(residentCount),
          subtitle: "Billed units",
          subtitleType: "neutral",
          icon: "calendar",
          badgeBg: "bg-slate-50",
          iconColor: "text-slate-600",
        },
      ],
      revenueHistory: [],
      revenueByService: [],
      breakdowns: [],
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

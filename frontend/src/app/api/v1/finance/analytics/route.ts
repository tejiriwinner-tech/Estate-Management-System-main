import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { PaymentAnalyticsData } from "@/types/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let paidNaira = 0;
    let billedNaira = 0;
    const serviceTotals = new Map<string, number>();

    try {
      const scRows = await sql`SELECT service_type, amount, status FROM service_charges`;
      for (const r of scRows) {
        const amt = Number(r.amount || 0);
        billedNaira += amt;
        if (r.status === "Paid") {
          paidNaira += amt;
          const key = r.service_type || "Service Charge";
          serviceTotals.set(key, (serviceTotals.get(key) || 0) + amt);
        }
      }

      const paySum = await sql`SELECT COALESCE(SUM(amount_kobo), 0)::numeric as total FROM fin_payments WHERE status = 'success'`;
      paidNaira += Number(paySum[0]?.total || 0) / 100;

      const invSum = await sql`SELECT COALESCE(SUM(amount_kobo), 0)::numeric as total FROM fin_invoices`;
      billedNaira += Number(invSum[0]?.total || 0) / 100;
    } catch (e) {
      console.warn("Analytics query fallback:", e);
    }

    const outstandingNaira = Math.max(0, billedNaira - paidNaira);
    const collectionRate = billedNaira > 0 ? Math.min(100, Math.round((paidNaira / billedNaira) * 100)) : 0;
    const outstandingRate = billedNaira > 0 ? 100 - collectionRate : 0;

    const fmt = (val: number) =>
      val >= 1_000_000 ? `₦${(val / 1_000_000).toFixed(2)}M` : `₦${val.toLocaleString()}`;

    const palette = ["#B22222", "#C9A227", "#10b981", "#3b82f6"];
    const totalServicePaid = Array.from(serviceTotals.values()).reduce((s, v) => s + v, 0);
    const revenueByService = Array.from(serviceTotals.entries()).map(([name, val], idx) => ({
      name,
      percentage: totalServicePaid > 0 ? Math.round((val / totalServicePaid) * 100) : 0,
      color: palette[idx % palette.length],
    }));

    const data: PaymentAnalyticsData = {
      kpis: [
        {
          id: "collection-efficiency",
          label: "Collection Efficiency",
          value: `${collectionRate}%`,
          subtext: billedNaira > 0 ? "Live collection rate" : "No bills issued yet",
          trendType: "up",
          iconType: "collection",
        },
        {
          id: "total-collected",
          label: "Total Revenue Collected",
          value: fmt(paidNaira),
          subtext: "Verified payments",
          trendType: "up",
          iconType: "revenue",
        },
        {
          id: "top-service",
          label: "Top Performing Service",
          value: revenueByService[0]?.name || "—",
          subtext: revenueByService[0] ? `${revenueByService[0].percentage}% of inflows` : "No payments yet",
          trendType: "up",
          iconType: "top_service",
        },
        {
          id: "collection-laggard",
          label: "Outstanding Balance",
          value: fmt(outstandingNaira),
          subtext: outstandingNaira > 0 ? "Remaining to recover" : "All cleared",
          trendType: outstandingNaira > 0 ? "down" : "up",
          iconType: "laggard",
        },
      ],
      monthlyRevenueTrend: paidNaira > 0 ? [{ month: "Current", amount: Number((paidNaira / 1_000_000).toFixed(2)) }] : [],
      revenueByService,
      yearlyRevenueTrend: paidNaira > 0 ? [{ year: String(new Date().getFullYear()), amount: Number((paidNaira / 1_000_000).toFixed(2)) }] : [],
      collectionStatus: {
        statusLabel: billedNaira === 0 ? "No Data" : collectionRate >= 80 ? "Healthy Collection" : "Attention Needed",
        collectionPercentage: collectionRate,
        paidAmount: fmt(paidNaira),
        paidPercentage: collectionRate,
        outstandingAmount: fmt(outstandingNaira),
        outstandingPercentage: outstandingRate,
      },
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

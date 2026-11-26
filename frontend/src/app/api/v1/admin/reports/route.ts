import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let paidNaira = 0;
    let outstandingNaira = 0;
    let defaulters: any[] = [];
    let lifeThreatAlerts: any[] = [];

    try {
      const scRows = await sql`
        SELECT id, resident_name, unit_number, service_type, amount, status, due_date
        FROM service_charges
        ORDER BY id DESC
      `;
      for (const r of scRows) {
        const amt = Number(r.amount || 0);
        if (r.status === "Paid") {
          paidNaira += amt;
        } else {
          outstandingNaira += amt;
          defaulters.push({
            id: r.id,
            unit: r.unit_number || "—",
            resident: r.resident_name || "Resident",
            amount: `₦${amt.toLocaleString()}`,
            daysOverdue: r.due_date ? Math.max(0, Math.floor((Date.now() - new Date(r.due_date).getTime()) / 86400000)) : 0,
          });
        }
      }

      const alerts = await sql`
        SELECT id, title, severity, location, status, responder, created_at
        FROM security_alerts
        ORDER BY id DESC
        LIMIT 20
      `;
      lifeThreatAlerts = alerts.map((a: any) => ({
        id: a.id,
        title: a.title || "Security Alert",
        severity: a.severity || "HIGH",
        location: a.location || "Estate",
        reported_at: a.created_at ? new Date(a.created_at).toLocaleString("en-NG") : "Recent",
        status: a.status || "Active",
        responder: a.responder || "Security Team",
      }));
    } catch {
      // Tables may be empty or not yet initialized
    }

    const totalBilled = paidNaira + outstandingNaira;
    const rate = totalBilled > 0 ? Math.round((paidNaira / totalBilled) * 1000) / 10 : 0;

    const kpis = [
      { id: "collection", label: "COLLECTION RATE", value: `${rate}%`, subtext: totalBilled > 0 ? "Live collection rate" : "No bills issued yet", trendType: "positive", iconType: "collection" },
      { id: "revenue", label: "COLLECTED REVENUE", value: `₦${paidNaira.toLocaleString()}`, subtext: "Verified service charges", trendType: "positive", iconType: "revenue" },
      { id: "top_service", label: "TOP REVENUE STREAM", value: paidNaira > 0 ? "Service Charge" : "—", subtext: paidNaira > 0 ? "Primary estate inflow" : "No collections yet", trendType: "positive", iconType: "top_service" },
      { id: "laggard", label: "OUTSTANDING DUES", value: `₦${outstandingNaira.toLocaleString()}`, subtext: `${defaulters.length} unpaid items`, trendType: "positive", iconType: "laggard" },
    ];

    return NextResponse.json({
      data: {
        kpis,
        monthlyRevenue: [],
        serviceShares: [],
        yearlyBars: [],
        collection: {
          statusLabel: totalBilled === 0 ? "NO DATA" : rate >= 80 ? "HEALTHY" : "NEEDS ATTENTION",
          paidPercentage: Math.round(rate),
          paidAmountLabel: `₦${paidNaira.toLocaleString()}`,
          outstandingAmountLabel: `₦${outstandingNaira.toLocaleString()}`,
          outstandingPercentage: totalBilled > 0 ? Math.max(0, 100 - Math.round(rate)) : 0,
        },
        defaulters,
        mobileKpis: [],
        mobileTrendBars: [],
        mobileCategories: [],
        generatedReports: [],
        lifeThreatAlerts,
        lifeThreatTotal: lifeThreatAlerts.length,
        intelligenceReports: [],
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch report center data." }, { status: 500 });
  }
}

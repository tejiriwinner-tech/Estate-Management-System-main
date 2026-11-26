import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { parseCodedAlert } from "@/lib/emergencyCodes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let paidNaira = 0;
    let outstandingNaira = 0;
    let defaulters: any[] = [];
    let lifeThreatAlerts: any[] = [];
    let intelligenceReports: any[] = [];

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
    } catch {
      // service_charges table may not exist yet
    }

    // Fetch both ongoing and resolved emergency/incident alerts from estate_alerts & panic_alerts
    try {
      const eaRows = await sql`
        SELECT id, category, message, location, status, created_at
        FROM estate_alerts
        ORDER BY id DESC
        LIMIT 60
      `;
      for (const a of eaRows) {
        const parsed = parseCodedAlert(a.message || "");
        const isResolved = ["resolved", "closed", "cleared"].includes(String(a.status || "").toLowerCase());
        const dateStr = a.created_at ? new Date(a.created_at).toLocaleString("en-NG") : "Recent";

        if (a.category === "life_threat" || /CODE[_\s]?(RED|AMBER|BLUE|YELLOW)/i.test(a.message || "")) {
          lifeThreatAlerts.push({
            id: `ea-${a.id}`,
            name: `${parsed.spec.label}: ${parsed.spec.title} — ${parsed.sender} (${parsed.role})`,
            house_number: a.location || "Post Army Housing Estate",
            date: dateStr,
            status: isResolved ? "Resolved" : "Ongoing",
            code: parsed.spec.label,
            details: parsed.details,
          });
        } else {
          intelligenceReports.push({
            id: `intel-${a.id}`,
            title: parsed.details || a.message || "Security Intelligence",
            location: a.location || "Post Army Housing Estate",
            date: dateStr,
            status: isResolved ? "Resolved" : "Open",
          });
        }
      }
    } catch {
      // ignore if estate_alerts absent
    }

    try {
      const panicRows = await sql`
        SELECT id, location, note, status, created_at
        FROM panic_alerts
        ORDER BY id DESC
        LIMIT 40
      `;
      for (const p of panicRows) {
        const parsed = parseCodedAlert(p.note || "");
        const isResolved = ["resolved", "closed", "cleared"].includes(String(p.status || "").toLowerCase());
        const loc = p.location || "Post Army Housing Estate";
        const alreadyListed = lifeThreatAlerts.some(
          (x) => x.house_number === loc && x.details === parsed.details
        );
        if (!alreadyListed) {
          lifeThreatAlerts.push({
            id: `pa-${p.id}`,
            name: `${parsed.spec.label}: ${parsed.spec.title} — ${parsed.sender} (${parsed.role})`,
            house_number: loc,
            date: p.created_at ? new Date(p.created_at).toLocaleString("en-NG") : "Recent",
            status: isResolved ? "Resolved" : "Ongoing",
            code: parsed.spec.label,
            details: parsed.details,
          });
        }
      }
    } catch {
      // ignore if panic_alerts absent
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
        intelligenceReports,
      },
    });
  } catch {
    return NextResponse.json({ message: "Could not fetch report center data." }, { status: 500 });
  }
}

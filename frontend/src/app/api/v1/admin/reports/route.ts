import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const kpis = [
      { label: "TOTAL BILLED", value: "₦142,500,000", change: "+12.4%", isPositive: true },
      { label: "COLLECTED REVENUE", value: "₦128,400,000", change: "+8.1%", isPositive: true },
      { label: "OUTSTANDING DUES", value: "₦14,100,000", change: "-4.3%", isPositive: true },
      { label: "COLLECTION EFFICIENCY", value: "90.1%", change: "+2.5%", isPositive: true },
    ];

    const lifeThreatAlerts = [
      { id: 1, title: "Medical Emergency - Villa A-402", severity: "CRITICAL", location: "Palm Crescent", reported_at: "Today, 02:15 PM", status: "Responding", responder: "Lincoln Paramedics" },
      { id: 2, title: "Power Surge & Smoke Smell - Block B", severity: "HIGH", location: "Royal Avenue", reported_at: "Yesterday, 08:30 PM", status: "Resolved", responder: "Estate Fire Marshall" },
    ];

    const intelligenceReports = [
      { id: 1, report_code: "INT-2026-088", title: "Quarterly Estate Perimeter Vulnerability Audit", category: "Physical Security", date: "2026-11-20", author: "Capt. A. Bello", summary: "Complete audit of 4.2km electric fence, 16 infrared beams, and 3 main vehicular gates." },
      { id: 2, report_code: "INT-2026-089", title: "Automated ANPR License Plate Accuracy Analysis", category: "Gate Automation", date: "2026-11-22", author: "Engr. D. Adeleke", summary: "Camera capture rate sustained at 99.4% across 1,840 daily inbound scans." },
    ];

    return NextResponse.json({
      data: {
        kpis,
        monthlyRevenue: [
          { month: "Jan", revenue: 11.2 }, { month: "Feb", revenue: 12.5 },
          { month: "Mar", revenue: 10.8 }, { month: "Apr", revenue: 14.1 },
          { month: "May", revenue: 13.6 }, { month: "Jun", revenue: 15.2 },
        ],
        serviceShares: [
          { name: "Service Charge", percentage: 55, color: "#dc2626" },
          { name: "Power Tariff", percentage: 30, color: "#f59e0b" },
          { name: "Security Levy", percentage: 15, color: "#10b981" },
        ],
        yearlyBars: [],
        collection: {
          statusLabel: "HEALTHY",
          paidPercentage: 90,
          paidAmountLabel: "₦128.4M",
          outstandingAmountLabel: "₦14.1M",
          outstandingPercentage: 10,
        },
        defaulters: [
          { unit: "Flat C-201", resident: "Emeka Okafor", amount: "₦450,000", daysOverdue: 24 },
          { unit: "Villa D-104", resident: "Babajide Williams", amount: "₦320,000", daysOverdue: 18 },
        ],
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

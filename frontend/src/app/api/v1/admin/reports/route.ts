import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const kpis = [
      { id: "collection", label: "COLLECTION RATE", value: "90.1%", subtext: "+2.5% vs last month", trendType: "positive", iconType: "collection" },
      { id: "revenue", label: "COLLECTED REVENUE", value: "₦128,400,000", subtext: "+8.1% vs last month", trendType: "positive", iconType: "revenue" },
      { id: "top_service", label: "TOP REVENUE STREAM", value: "Service Charge", subtext: "55% of estate inflows", trendType: "positive", iconType: "top_service" },
      { id: "laggard", label: "OUTSTANDING DUES", value: "₦14,100,000", subtext: "-4.3% vs last month", trendType: "positive", iconType: "laggard" },
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
          { month: "Jan", valueM: 9.2, revenue: 9.2, showMarker: true },
          { month: "Feb", valueM: 10.5, revenue: 10.5 },
          { month: "Mar", valueM: 10.1, revenue: 10.1 },
          { month: "Apr", valueM: 11.8, revenue: 11.8, showMarker: true },
          { month: "May", valueM: 11.4, revenue: 11.4 },
          { month: "Jun", valueM: 12.6, revenue: 12.6 },
          { month: "Jul", valueM: 12.1, revenue: 12.1 },
          { month: "Aug", valueM: 13.4, revenue: 13.4, showMarker: true },
          { month: "Sep", valueM: 12.9, revenue: 12.9 },
          { month: "Oct", valueM: 14.1, revenue: 14.1 },
          { month: "Nov", valueM: 14.8, revenue: 14.8, showMarker: true },
          { month: "Dec", valueM: 15.2, revenue: 15.2, showMarker: true },
        ],
        serviceShares: [
          { id: "service-charge", name: "Service Charge", percentage: 55, strokeColor: "#B22222", dotColorClass: "bg-[#B22222]" },
          { id: "power-tariff", name: "Power Tariff", percentage: 25, strokeColor: "#C9A227", dotColorClass: "bg-[#C9A227]" },
          { id: "security-levy", name: "Security Levy", percentage: 12, strokeColor: "#1E293B", dotColorClass: "bg-slate-800" },
          { id: "sanitation", name: "Waste & Water", percentage: 8, strokeColor: "#10B981", dotColorClass: "bg-emerald-500" },
        ],
        yearlyBars: [
          { year: "2022", valueM: 84, isCurrent: false },
          { year: "2023", valueM: 98, isCurrent: false },
          { year: "2024", valueM: 115, isCurrent: false },
          { year: "2025", valueM: 124, isCurrent: false },
          { year: "2026", valueM: 142.5, isCurrent: true },
        ],
        collection: {
          statusLabel: "HEALTHY",
          paidPercentage: 90,
          paidAmountLabel: "₦128.4M",
          outstandingAmountLabel: "₦14.1M",
          outstandingPercentage: 10,
        },
        defaulters: [
          { id: 1, unit: "Flat C-201", resident: "Emeka Okafor", amount: "₦450,000", daysOverdue: 24 },
          { id: 2, unit: "Villa D-104", resident: "Babajide Williams", amount: "₦320,000", daysOverdue: 18 },
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

import { NextResponse } from "next/server";
import type { ReportCenterData } from "@/types/reportCenter";

export const dynamic = "force-dynamic";

export async function GET() {
  const data: ReportCenterData = {
    templates: [
      {
        id: "tpl-monthly-rev",
        title: "Monthly Service Charge & Revenue Statement",
        description: "Consolidated inflow of security levies, utility fees, and Paystack settlements across Army Estate Phases 1–5.",
        badgeLabel: "Most Used",
        badgeTone: "primary",
        iconType: "monthly",
      },
      {
        id: "tpl-outstanding",
        title: "Outstanding Arrears & Defaulters Aging Report",
        description: "Detailed unit-by-unit breakdown of pending service charges and overdue assessment balances.",
        badgeLabel: "Action Required",
        badgeTone: "critical",
        iconType: "outstanding",
      },
      {
        id: "tpl-service-perf",
        title: "Estate Services Collection Efficiency",
        description: "Compliance rates across Security Levy, Power Grid, Waste Sanitation, and Water Reticulation.",
        badgeLabel: "Executive",
        badgeTone: "accent",
        iconType: "service",
      },
      {
        id: "tpl-resident-ledger",
        title: "Resident Unit Payment Ledger",
        description: "Audit-ready transaction log per villa/apartment with receipt verification references.",
        badgeLabel: "Audit Ready",
        badgeTone: "neutral",
        iconType: "resident",
      },
      {
        id: "tpl-annual-audit",
        title: "Annual Financial Summary & Fiscal Forecast",
        description: "Year-to-date treasury collections, vendor payouts, and reserve fund balance sheet.",
        badgeLabel: "FY 2026",
        badgeTone: "primary",
        iconType: "yearly",
      },
    ],
    usageMetrics: {
      title: "Report Generation Activity",
      subtitle: "Executive & audit exports over the past 5 billing cycles",
      totalDownloads: 48,
      barHeights: [55, 72, 64, 88, 95],
    },
    recentExports: [
      {
        id: "exp-101",
        fileName: "Lincoln_Estate_Nov2026_Revenue_Statement.pdf",
        generatedBy: "Estate Administrator",
        dateTime: "Today, 09:30 AM",
        format: "PDF",
        downloadUrl: "#",
      },
      {
        id: "exp-102",
        fileName: "Phase1_to_5_Service_Charge_Compliance.xlsx",
        generatedBy: "Finance Officer",
        dateTime: "Yesterday, 04:15 PM",
        format: "XLSX",
        downloadUrl: "#",
      },
      {
        id: "exp-103",
        fileName: "Outstanding_Unit_Levies_Register.csv",
        generatedBy: "Estate Administrator",
        dateTime: "Nov 20, 2026 | 11:10 AM",
        format: "CSV",
        downloadUrl: "#",
      },
    ],
  };

  return NextResponse.json({ data });
}

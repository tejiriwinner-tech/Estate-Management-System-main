import { NextResponse } from "next/server";
import type { ReportCenterData } from "@/types/reportCenter";

export const dynamic = "force-dynamic";

export async function GET() {
  const data: ReportCenterData = {
    templates: [
      {
        id: "tpl-monthly-rev",
        title: "Monthly Service Charge & Revenue Statement",
        description: "Consolidated inflow of security levies, utility fees, and Paystack settlements across Post Army House Estate.",
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
      totalDownloads: 0,
      barHeights: [0, 0, 0, 0, 0],
    },
    recentExports: [],
  };

  return NextResponse.json({ data });
}

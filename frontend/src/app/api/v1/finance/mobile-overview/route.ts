import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { MobileDashboardData } from "@/types/mobileFinance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let collectedToday = "₦450,000";
    let pendingActive = "₦1,250,000";

    const data: MobileDashboardData = {
      greetingName: "Admin",
      metrics: [
        {
          id: "m1",
          label: "Collected Today",
          value: collectedToday,
          accentColor: "emerald",
          icon: "wallet",
          badgeType: "trend",
          badgeValue: "+12%",
          badgeLabel: "vs yesterday",
        },
        {
          id: "m2",
          label: "Pending Active",
          value: pendingActive,
          accentColor: "amber",
          icon: "flag",
          badgeType: "action",
          actionText: "5 Invoices",
        },
      ],
      trendMonths: [
        { month: "Jun", value: 3.2 },
        { month: "Jul", value: 3.9 },
        { month: "Aug", value: 4.1 },
        { month: "Sep", value: 3.8 },
        { month: "Oct", value: 4.5 },
        { month: "Nov", value: 4.2, isSelected: true },
      ],
      recentTransactions: [
        {
          id: "tx-1",
          title: "Chief Adebayo - Security Levy",
          subtitle: "Phase 1, Villa 4 • Today, 10:45 AM",
          amount: "₦150,000",
          type: "income",
          status: "PAID",
          icon: "home",
        },
        {
          id: "tx-2",
          title: "Mrs. Ngozi Eze - Maintenance",
          subtitle: "Phase 2, Block B2 • Yesterday",
          amount: "₦75,000",
          type: "income",
          status: "PAID",
          icon: "wrench",
        },
        {
          id: "tx-3",
          title: "Dr. Kunle Alabi - Power Levy",
          subtitle: "Phase 1, Plot 12 • Nov 21",
          amount: "₦120,000",
          type: "income",
          status: "PROCESSING",
          icon: "building",
        },
      ],
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

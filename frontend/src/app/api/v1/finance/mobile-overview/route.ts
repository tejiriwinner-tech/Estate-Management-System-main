import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import type { MobileDashboardData } from "@/types/mobileFinance";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let collectedTodayNaira = 0;
    let pendingActiveNaira = 0;
    let pendingCount = 0;
    const recentTransactions: MobileDashboardData["recentTransactions"] = [];

    try {
      const scRows = await sql`
        SELECT id, resident_name, unit_number, service_type, amount, status, created_at
        FROM service_charges
        ORDER BY id DESC
        LIMIT 20
      `;
      for (const r of scRows) {
        const amt = Number(r.amount || 0);
        if (r.status === "Paid") {
          collectedTodayNaira += amt;
        } else {
          pendingActiveNaira += amt;
          pendingCount += 1;
        }
        if (recentTransactions.length < 5) {
          recentTransactions.push({
            id: `sc-${r.id}`,
            title: `${r.resident_name || "Resident"} - ${r.service_type || "Service Charge"}`,
            subtitle: `${r.unit_number || "Estate"} • ${r.created_at ? new Date(r.created_at).toLocaleDateString("en-NG") : "Recent"}`,
            amount: `₦${amt.toLocaleString()}`,
            type: "income",
            status: r.status === "Paid" ? "PAID" : "PROCESSING",
            icon: "home",
          });
        }
      }
    } catch {
      // Empty fallback
    }

    const data: MobileDashboardData = {
      greetingName: "Admin",
      metrics: [
        {
          id: "m1",
          label: "Collected Revenue",
          value: `₦${collectedTodayNaira.toLocaleString()}`,
          accentColor: "emerald",
          icon: "wallet",
          badgeType: "trend",
          badgeValue: "Live",
          badgeLabel: "verified",
        },
        {
          id: "m2",
          label: "Pending Active",
          value: `₦${pendingActiveNaira.toLocaleString()}`,
          accentColor: "amber",
          icon: "flag",
          badgeType: "action",
          actionText: `${pendingCount} Invoices`,
        },
      ],
      trendMonths: [],
      recentTransactions,
    };

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ message: "Could not load mobile finance overview.", error: err.message }, { status: 500 });
  }
}

"use client";

import React from "react";
import { Download, Plus, CreditCard, BarChart2 } from "lucide-react";
import { MetricCards } from "@/components/finance/MetricCards";
import { RevenueHistoryChart } from "@/components/finance/RevenueHistoryChart";
import { RevenueByServiceChart } from "@/components/finance/RevenueByServiceChart";
import { RevenueBreakdownsTable } from "@/components/finance/RevenueBreakdownsTable";
import { MobileMetricCards } from "@/components/mobile/MobileMetricCards";
import { MobileRevenueTrends } from "@/components/mobile/MobileRevenueTrends";
import { MobileTransactionsList } from "@/components/mobile/MobileTransactionsList";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { FinanceOverviewData } from "@/types/finance";
import type { MobileDashboardData as MobileFinanceData } from "@/types/mobileFinance";

export function FinanceOverviewView() {
  const EMPTY_DESKTOP = { metrics: [], revenueHistory: [], revenueByService: [], breakdowns: [] } as unknown as FinanceOverviewData;
  const EMPTY_MOBILE = { greetingName: "", metrics: [], trendMonths: [], recentTransactions: [] } as unknown as MobileFinanceData;
  const { data: desktopData, error: desktopError } = useFinance<{ data: FinanceOverviewData }, FinanceOverviewData>("/finance/overview", EMPTY_DESKTOP);
  const { data: mobileData, error: mobileError } = useFinance<{ data: MobileFinanceData }, MobileFinanceData>("/finance/mobile-overview", EMPTY_MOBILE);

  return (
    <div className="space-y-6">
      <ErrorBanner message={desktopError ?? mobileError} />

      {/* Mobile view (< 768px) */}
      <div className="block md:hidden space-y-5">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
            Good Morning, {mobileData.greetingName || "Admin"}
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-0.5">
            Here&apos;s your property portfolio performance today.
          </p>
        </div>
        <MobileMetricCards metrics={mobileData.metrics} />
        <MobileRevenueTrends months={mobileData.trendMonths} />
        <MobileTransactionsList transactions={mobileData.recentTransactions} />
      </div>

      {/* Desktop view (>= 768px) */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-dark tracking-tight">Financial Overview</h1>
            <p className="text-sm text-muted">
              Estate revenues, service fees collection, and billing metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-surface-subtle border border-border text-dark hover:bg-slate-100 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Statement</span>
            </button>
            <a
              href="/admin/finance/payments"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary text-white hover:bg-primary-hover shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </a>
          </div>
        </div>

        <MetricCards metrics={desktopData.metrics} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueHistoryChart data={desktopData.revenueHistory} />
          </div>
          <div className="lg:col-span-1">
            <RevenueByServiceChart data={desktopData.revenueByService} />
          </div>
        </div>

        <RevenueBreakdownsTable breakdowns={desktopData.breakdowns} />
      </div>
    </div>
  );
}

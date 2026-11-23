"use client";

import React from "react";
import Link from "next/link";
import { CreditCard, BarChart2, Smartphone, Monitor } from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { MobileMetricCards } from "@/components/mobile/MobileMetricCards";
import { MobileRevenueTrends } from "@/components/mobile/MobileRevenueTrends";
import { MobileTransactionsList } from "@/components/mobile/MobileTransactionsList";
import { MobileBottomNav } from "@/components/mobile/MobileBottomNav";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { MobileDashboardData } from "@/types/mobileFinance";

export default function FinanceMobileDashboardPage() {
  const { data, error } = useFinance<{ data: MobileDashboardData }, MobileDashboardData>(
    "/finance/mobile-overview",
    { greetingName: "", metrics: [], trendMonths: [], recentTransactions: [] } as unknown as MobileDashboardData
  );

  return (
    <div className="min-h-screen bg-slate-100/70 py-4 sm:py-8 flex flex-col items-center justify-start">
      {/* Top Desktop Switcher Bar (helpful when viewing on desktop monitor) */}
      <div className="mb-4 flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <Smartphone className="h-4 w-4" />
          Mobile Dashboard (Task 3)
        </span>
        <span className="text-slate-300">|</span>
        <Link
          href="/finance"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Monitor className="h-4 w-4" />
          Switch to Desktop View
        </Link>
      </div>

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[390px] overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-white shadow-2xl">
        {/* Device Speaker Notch */}
        <div className="flex h-6 w-full items-center justify-center bg-white pt-2">
          <div className="h-1.5 w-20 rounded-full bg-slate-200" />
        </div>

        {/* 1. Mobile Header */}
        <ErrorBanner message={error} />
        <MobileHeader />

        {/* Mobile Scrollable Content Area */}
        <main className="space-y-5 px-5 py-5 bg-[#F8FAFC]">
          {/* Greeting */}
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
              Good Morning, {data.greetingName}
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              Here&apos;s your property portfolio performance today.
            </p>
          </div>

          {/* 2. Highlight Metric Cards */}
          <MobileMetricCards metrics={data.metrics} />

          {/* 3. Revenue Trends Widget */}
          <MobileRevenueTrends months={data.trendMonths} />

          {/* 4. Recent Transactions */}
          <MobileTransactionsList transactions={data.recentTransactions} />

          {/* 5. Action Buttons (New Payment & Export Report) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm shadow-emerald-700/25 hover:bg-emerald-800 transition-colors"
            >
              <CreditCard className="h-4 w-4" />
              <span>New Payment</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200/80 py-3 text-xs font-bold text-slate-800 hover:bg-slate-300/80 transition-colors"
            >
              <BarChart2 className="h-4 w-4 text-slate-700" />
              <span>Export Report</span>
            </button>
          </div>
        </main>

        {/* 6. Sticky Bottom Navigation Bar */}
        <MobileBottomNav activeTab="dashboard" />
      </div>
    </div>
  );
}

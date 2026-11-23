"use client";

import React, { useState } from "react";
import { Calendar, Download, CheckCircle2 } from "lucide-react";
import { AnalyticsKpiCards } from "@/components/analytics/AnalyticsKpiCards";
import { MonthlyRevenueTrendChart } from "@/components/analytics/MonthlyRevenueTrendChart";
import { AnalyticsServiceDonut } from "@/components/analytics/AnalyticsServiceDonut";
import { YearlyRevenueBarChart } from "@/components/analytics/YearlyRevenueBarChart";
import { CollectionStatusCard } from "@/components/analytics/CollectionStatusCard";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { PaymentAnalyticsData } from "@/types/analytics";

const TIME_RANGES = ["This Month", "Last Quarter", "This Year"] as const;

export default function PaymentAnalyticsPage() {
  const { data, error } = useFinance<{ data: PaymentAnalyticsData }, PaymentAnalyticsData>(
    "/finance/analytics",
    { kpis: [], monthlyRevenueTrend: [], revenueByService: [], yearlyRevenueTrend: [], collectionStatus: { statusLabel: "", collectionPercentage: 0, paidAmount: "₦0", paidPercentage: 0, outstandingAmount: "₦0", outstandingPercentage: 0 } } as PaymentAnalyticsData
  );
  const [selectedRange, setSelectedRange] =
    useState<(typeof TIME_RANGES)[number]>("This Month");

  const cycleRange = () => {
    const idx = TIME_RANGES.indexOf(selectedRange);
    setSelectedRange(TIME_RANGES[(idx + 1) % TIME_RANGES.length]);
  };

  const handleExport = () => window.print();

  return (
    <div className="space-y-6 pb-8">
      <ErrorBanner message={error} />
      {/* 1. Page Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">
            Payment Analytics
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Real-time financial performance overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Period Selector Button */}
          <button
            type="button"
            onClick={cycleRange}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-dark shadow-xs transition-colors cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-accent" />
            <span>{selectedRange}</span>
          </button>

          {/* Export Report Button */}
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* 2. Top Row: 4 KPI Metric Cards */}
      <AnalyticsKpiCards cards={data.kpis} />

      {/* 3. Middle Row: Monthly Revenue Trend (8 cols) + Revenue by Service (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <MonthlyRevenueTrendChart data={data.monthlyRevenueTrend} />
        </div>
        <div className="lg:col-span-4">
          <AnalyticsServiceDonut items={data.revenueByService} />
        </div>
      </div>

      {/* 4. Bottom Row: Yearly Revenue Trend (6 cols) + Collection Status (6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-6">
          <YearlyRevenueBarChart data={data.yearlyRevenueTrend} />
        </div>
        <div className="lg:col-span-6">
          <CollectionStatusCard status={data.collectionStatus} />
        </div>
      </div>
    </div>
  );
}

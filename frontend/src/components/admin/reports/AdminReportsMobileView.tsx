"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  Banknote,
  Home,
  FileText,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
} from "lucide-react";
import { useAdminReports } from "@/lib/admin/reportsApi";
import { MobileReportKpiItem } from "@/types/admin/reports";
import { cn } from "@/lib/admin/utils";

const MOBILE_PERIODS = ["Last 30 Days", "Last 90 Days", "This Year"] as const;

function MobileKpiRightBadge({
  iconType,
}: {
  iconType: MobileReportKpiItem["iconType"];
}) {
  switch (iconType) {
    case "revenue":
      return (
        <div className="w-11 h-11 rounded-full bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "leased":
      return (
        <div className="w-11 h-11 rounded-full bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <Home className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "dues":
      return (
        <div className="w-11 h-11 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

export function AdminReportsMobileView() {
  const { data: rd } = useAdminReports();
  const mobileReportKpis = rd.mobileKpis;
  const mobileRevenueTrendBars = rd.mobileTrendBars;
  const mobileRevenueCategories = rd.mobileCategories;
  const mobileGeneratedReports = rd.generatedReports;

  const [periodIdx, setPeriodIdx] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [showAllReports, setShowAllReports] = useState(false);
  const [showTrendMenu, setShowTrendMenu] = useState(false);

  const activePeriod = MOBILE_PERIODS[periodIdx];
  const visibleReports = showAllReports
    ? mobileGeneratedReports
    : mobileGeneratedReports.slice(0, 2);

  const handleCyclePeriod = () => {
    setPeriodIdx((prev) => (prev + 1) % MOBILE_PERIODS.length);
  };

  const handleDownloadCsv = (fileName: string, title: string) => {
    const csvRows = [
      ["Report Title", title],
      ["Period", activePeriod],
      [],
      ["Metric", "Value", "Note"],
      ...mobileReportKpis.map((k) => [k.label, k.value, k.subtext]),
      [],
      ["Category", "Revenue"],
      ...mobileRevenueCategories.map((c) => [c.name, c.amountLabel]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-300 pb-8">
      {/* ================= HEADER & ACTION PILL ROW ================= */}
      <div className="space-y-3">
        <div>
          <h1 className="text-xl font-extrabold text-dark tracking-tight">
            Reports Dashboard
          </h1>
          <p className="text-xs font-semibold text-primary mt-0.5 leading-relaxed">
            Overview of financial and property performance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCyclePeriod}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#E9EEF5] hover:bg-[#DFE6F0] text-dark text-xs font-bold transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-dark/80" />
            <span>{activePeriod}</span>
          </button>

          <button
            type="button"
            onClick={() =>
              handleDownloadCsv(
                "lincoln-estate-mobile-report.csv",
                "Reports Dashboard Summary"
              )
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-2xs transition-all active:scale-[0.99]"
          >
            <Download className="w-3.5 h-3.5 stroke-[2.3]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* ================= 3 STACKED HORIZONTAL KPI CARDS ================= */}
      <div className="space-y-3">
        {mobileReportKpis.map((kpi) => {
          const isWarning = kpi.subtextType === "warning";
          return (
            <div
              key={kpi.id}
              className="bg-surface-card rounded-2xl border border-border/80 px-5 py-4 shadow-xs flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {kpi.label}
                </div>
                <div className="text-2xl font-extrabold text-dark tracking-tight mt-0.5">
                  {kpi.value}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold text-primary mt-1">
                  {isWarning ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-primary shrink-0" />
                  ) : (
                    <TrendingUp className="w-3.5 h-3.5 text-primary shrink-0" />
                  )}
                  <span>{kpi.subtext}</span>
                </div>
              </div>

              <MobileKpiRightBadge iconType={kpi.iconType} />
            </div>
          );
        })}
      </div>

      {/* ================= REVENUE TREND 6-BAR CARD ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between relative">
          <h2 className="text-base font-extrabold text-dark tracking-tight">
            Revenue Trend
          </h2>

          <button
            type="button"
            onClick={() => setShowTrendMenu((prev) => !prev)}
            className="p-1 rounded-lg text-primary hover:bg-surface transition-colors"
            aria-label="Revenue trend options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showTrendMenu && (
            <div className="absolute right-0 top-8 z-20 w-40 bg-surface-card rounded-xl border border-border shadow-md py-1.5 text-xs font-bold text-dark">
              <button
                type="button"
                onClick={() => {
                  setShowTrendMenu(false);
                  handleDownloadCsv(
                    "revenue-trend-6m.csv",
                    "6-Month Revenue Trend"
                  );
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-surface-subtle flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download CSV</span>
              </button>
            </div>
          )}
        </div>

        {/* 6 Vertical Progressive Bars (Jan - Jun) */}
        <div className="pt-2">
          <div className="h-44 flex items-end justify-between gap-2.5 border-b border-border/60 pb-2 px-1">
            {mobileRevenueTrendBars.map((bar) => {
              const isSelected = selectedMonth === bar.month;
              return (
                <button
                  key={bar.month}
                  type="button"
                  onClick={() =>
                    setSelectedMonth(isSelected ? null : bar.month)
                  }
                  style={{ height: `${bar.heightPct}%` }}
                  className={cn(
                    "relative flex-1 rounded-t-md transition-all duration-300 cursor-pointer hover:opacity-95",
                    bar.opacityClass,
                    isSelected && "ring-2 ring-accent"
                  )}
                  title={`${bar.month}: ${bar.amountLabel}`}
                >
                  {isSelected && (
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded bg-dark text-white text-[10px] font-bold whitespace-nowrap shadow-xs">
                      {bar.amountLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* X-Axis Month Labels */}
          <div className="flex items-center justify-between gap-2.5 pt-2 px-1 text-[10px] font-extrabold text-primary select-none">
            {mobileRevenueTrendBars.map((bar) => (
              <div key={bar.month} className="flex-1 text-center">
                {bar.month}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= REVENUE BY CATEGORY CARD ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-extrabold text-dark tracking-tight">
          Revenue by Category
        </h2>

        <div className="space-y-3.5">
          {mobileRevenueCategories.map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-dark/85">{cat.name}</span>
                <span className="font-extrabold text-dark">
                  {cat.amountLabel}
                </span>
              </div>

              <div className="w-full h-2.5 rounded-full bg-[#EEF2F8] overflow-hidden">
                <div
                  style={{ width: `${cat.fillPct}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    cat.barColorClass
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= GENERATED REPORTS CARD ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-dark tracking-tight">
            Generated Reports
          </h2>

          <button
            type="button"
            onClick={() => setShowAllReports((prev) => !prev)}
            className="text-xs font-extrabold text-primary hover:underline transition-colors"
          >
            {showAllReports ? "Show Less" : "View All"}
          </button>
        </div>

        <div className="divide-y divide-border/60">
          {visibleReports.map((report) => (
            <div
              key={report.id}
              className="py-3 first:pt-1 last:pb-0 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#EEF2F8] text-primary flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 stroke-[2.2]" />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold text-dark truncate">
                    {report.title}
                  </div>
                  <div className="text-[11px] font-extrabold text-primary mt-0.5">
                    {report.meta}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleDownloadCsv(report.fileName, report.title)
                }
                title={`Download ${report.title}`}
                aria-label={`Download ${report.title}`}
                className="p-2 rounded-lg text-primary hover:bg-surface transition-colors shrink-0"
              >
                <Download className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

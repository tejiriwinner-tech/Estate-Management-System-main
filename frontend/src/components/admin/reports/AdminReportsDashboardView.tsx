"use client";

import React, { useState } from "react";
import {
  Calendar,
  Download,
  CheckCircle2,
  Banknote,
  Shield,
  Trash2,
  TrendingUp,
  TrendingDown,
  X,
  AlertTriangle,
  BarChart3,
  Table2,
  ListChecks,
  ChevronDownSquare,
} from "lucide-react";
import { useAdminReports } from "@/lib/admin/reportsApi";
import { ReportKpiMetric, ReportPeriod } from "@/types/admin/reports";
import { MonthlyRevenueTrendCard } from "./MonthlyRevenueTrendCard";
import { RevenueByServiceCard } from "./RevenueByServiceCard";
import { YearlyRevenueTrendCard } from "./YearlyRevenueTrendCard";
import { CollectionStatusCard } from "./CollectionStatusCard";
import { AdminReportsMobileView } from "./AdminReportsMobileView";
import { AdminReportTableView } from "./AdminReportTableView";
import { AdminReportListView } from "./AdminReportListView";
import { AdminReportDropdownView } from "./AdminReportDropdownView";

const PERIODS: ReportPeriod[] = ["This Month", "Last Month", "This Year"];

function KpiIconBadge({
  iconType,
}: {
  iconType: ReportKpiMetric["iconType"];
}) {
  switch (iconType) {
    case "collection":
      return (
        <div className="w-12 h-12 rounded-2xl bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "revenue":
      return (
        <div className="w-12 h-12 rounded-2xl bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <Banknote className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "top_service":
      return (
        <div className="w-12 h-12 rounded-2xl bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "laggard":
      return (
        <div className="w-12 h-12 rounded-2xl bg-primary-light text-primary flex items-center justify-center shrink-0">
          <Trash2 className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

export function AdminReportsDashboardView() {
  const { data: rd, error: reportsError } = useAdminReports();
  const initialReportKpis = rd.kpis;
  const monthlyRevenueTrendData = rd.monthlyRevenue;
  const serviceRevenueShares = rd.serviceShares;
  const yearlyRevenueBars = rd.yearlyBars;
  const initialCollectionStatus = rd.collection;
  const initialDefaultersList = rd.defaulters;

  const [viewMode, setViewMode] = useState<
    "analytics" | "list" | "table" | "dropdown"
  >("analytics");
  const [periodIdx, setPeriodIdx] = useState(0);
  const [isDefaultersModalOpen, setIsDefaultersModalOpen] = useState(false);

  const activePeriod = PERIODS[periodIdx];

  const handleCyclePeriod = () => {
    setPeriodIdx((prev) => (prev + 1) % PERIODS.length);
  };

  const handleExportReport = () => {
    const csvRows = [
      ["Metric", "Value", "Comparison"],
      ...initialReportKpis.map((k) => [k.label, k.value, k.subtext]),
      [],
      ["Month", "Revenue (NGN Millions)"],
      ...monthlyRevenueTrendData.map((m) => [m.month, m.valueM.toFixed(2)]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `lincoln-estate-payment-analytics-${activePeriod
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-8">
      {reportsError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{reportsError}</div>
      )}
      {/* ================= REPORT SECTION SWITCHER (NO DUPLICATE MOBILE TAB) ================= */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-surface-card border border-border/70 rounded-2xl px-4 py-2.5 shadow-2xs">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-surface border border-border/70 flex-wrap">
          <button
            type="button"
            onClick={() => setViewMode("analytics")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              viewMode === "analytics"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted hover:text-dark"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Payment Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              viewMode === "list"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted hover:text-dark"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Intelligent Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              viewMode === "table"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted hover:text-dark"
            }`}
          >
            <Table2 className="w-3.5 h-3.5" />
            <span>Life Threat Reports</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("dropdown")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all ${
              viewMode === "dropdown"
                ? "bg-primary text-white shadow-2xs"
                : "text-muted hover:text-dark"
            }`}
          >
            <ChevronDownSquare className="w-3.5 h-3.5" />
            <span>Report Selector</span>
          </button>
        </div>
      </div>

      {viewMode === "dropdown" ? (
        <AdminReportDropdownView
          onSelectIntelligentReports={() => setViewMode("list")}
          onSelectLifeThreatReports={() => setViewMode("table")}
        />
      ) : viewMode === "list" ? (
        <AdminReportListView />
      ) : viewMode === "table" ? (
        <AdminReportTableView />
      ) : (
        <>
          {/* ================= AUTOMATIC MOBILE LAYOUT (< 768px) ================= */}
          <div className="md:hidden">
            <AdminReportsMobileView />
          </div>

          {/* ================= AUTOMATIC DESKTOP / TABLET LAYOUT (>= 768px) ================= */}
          <div className="hidden md:block space-y-6">
            {/* ================= PAGE HEADER ROW ================= */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                  Payment Analytics
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
                  Real-time financial performance overview
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={handleCyclePeriod}
                  title="Click to switch reporting period"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-dark text-xs sm:text-sm font-bold shadow-2xs transition-colors"
                >
                  <Calendar className="w-4 h-4 text-dark/80" />
                  <span>{activePeriod}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReport}
                  className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-[0.99]"
                >
                  <Download className="w-4 h-4 stroke-[2.3]" />
                  <span>Export Report</span>
                </button>
              </div>
            </div>

            {/* ================= 4 HORIZONTAL KPI CARDS ================= */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
              {initialReportKpis.map((kpi) => {
                const isDown = kpi.trendDirection === "down";
                const isUp = kpi.trendDirection === "up";
                return (
                  <div
                    key={kpi.id}
                    className="bg-surface-card rounded-2xl border border-border/80 px-5 py-5 shadow-xs flex items-center gap-4"
                  >
                    <KpiIconBadge iconType={kpi.iconType} />

                    <div className="min-w-0">
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary leading-tight max-w-[110px]">
                        {kpi.label}
                      </div>
                      <div className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight mt-1">
                        {kpi.value}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-[11px] font-bold mt-1 ${
                          isDown ? "text-primary" : "text-accent"
                        }`}
                      >
                        {isUp && (
                          <TrendingUp className="w-3.5 h-3.5 stroke-[2.3]" />
                        )}
                        {isDown && (
                          <TrendingDown className="w-3.5 h-3.5 stroke-[2.3]" />
                        )}
                        <span>{kpi.subtext}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ================= MIDDLE ROW: MONTHLY REVENUE TREND (8 COL) + REVENUE BY SERVICE (4 COL) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8">
                <MonthlyRevenueTrendCard points={monthlyRevenueTrendData} />
              </div>

              <div className="lg:col-span-4">
                <RevenueByServiceCard services={serviceRevenueShares} />
              </div>
            </div>

            {/* ================= BOTTOM ROW: YEARLY REVENUE TREND (6 COL) + COLLECTION STATUS (6 COL) ================= */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-6">
                <YearlyRevenueTrendCard bars={yearlyRevenueBars} />
              </div>

              <div className="lg:col-span-6">
                <CollectionStatusCard
                  data={initialCollectionStatus}
                  onOpenDefaulters={() => setIsDefaultersModalOpen(true)}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================= DEFAULTERS LIST MODAL ================= */}
      {isDefaultersModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-dark/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsDefaultersModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="defaulters-modal-title"
            className="bg-surface-card w-full max-w-lg rounded-2xl border border-border shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5" />
                <h2
                  id="defaulters-modal-title"
                  className="text-base font-extrabold tracking-tight"
                >
                  Outstanding Defaulters List (₦0.8M)
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsDefaultersModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 divide-y divide-border/70">
              {initialDefaultersList.map((item) => (
                <div
                  key={item.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="text-sm font-extrabold text-dark">
                      {item.resident_name}
                    </div>
                    <div className="text-xs font-semibold text-muted mt-0.5">
                      {item.unit} • {item.service}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-primary">
                      {item.amount_due}
                    </div>
                    <div className="text-[11px] font-bold text-accent">
                      {item.days_overdue} days overdue
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-6 py-3.5 bg-surface border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setIsDefaultersModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-dark text-white text-xs font-extrabold hover:bg-dark/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

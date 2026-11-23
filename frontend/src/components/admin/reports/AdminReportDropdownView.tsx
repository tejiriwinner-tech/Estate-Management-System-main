"use client";

import React from "react";
import { SummaryCard } from "@/components/admin/dashboard/SummaryCard";
import { RemindersWidget } from "@/components/admin/dashboard/RemindersWidget";
import { EstateUpdatesWidget } from "@/components/admin/dashboard/EstateUpdatesWidget";
import { MetricCardData } from "@/types/admin/dashboard";

interface AdminReportDropdownViewProps {
  onSelectIntelligentReports: () => void;
  onSelectLifeThreatReports: () => void;
}

const dashboardMetrics: MetricCardData[] = [
  {
    id: "residents",
    label: "TOTAL RESIDENTS",
    value: "1,248",
    trend: "+24",
    trendType: "positive",
    iconType: "residents",
  },
  {
    id: "houses",
    label: "OCCUPIED HOUSES",
    value: "356",
    badge: "94%",
    iconType: "houses",
  },
  {
    id: "revenue",
    label: "MONTHLY REVENUE",
    value: "₦15.2M",
    trend: "+8.4%",
    trendType: "positive",
    iconType: "revenue",
  },
  {
    id: "requests",
    label: "PENDING REQUESTS",
    value: "18",
    iconType: "requests",
  },
];

export function AdminReportDropdownView({
  onSelectIntelligentReports,
  onSelectLifeThreatReports,
}: AdminReportDropdownViewProps) {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-border/70 animate-in fade-in duration-300">
      {/* ================= BLURRED EXECUTIVE DASHBOARD BACKGROUND ================= */}
      <div
        aria-hidden="true"
        className="space-y-8 p-4 sm:p-6 pointer-events-none select-none filter blur-[2.5px] opacity-90"
      >
        {/* Top Welcome & Operational Status Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Welcome back, Administrator
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
              Here&apos;s an overview of everything happening across
              LincolnEstate today.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-xs font-extrabold text-dark uppercase">
                OCT 24, 2024
              </div>
              <div className="text-[11px] font-semibold text-muted">
                14:32 PM WAT
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-light/80 border border-accent/40 text-dark text-[11px] font-extrabold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary" />
              OPERATIONAL
            </span>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {dashboardMetrics.map((metric) => (
            <SummaryCard key={metric.id} data={metric} />
          ))}
        </div>

        {/* Lower Split: Reminders & Estate Updates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <RemindersWidget />
          <EstateUpdatesWidget />
        </div>
      </div>

      {/* ================= DIMMED OVERLAY & CENTERED 2-OPTION SELECTOR CARD ================= */}
      <div className="absolute inset-0 z-20 bg-dark/45 backdrop-blur-[2px] flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Select Report Type"
          className="w-full max-w-[300px] sm:max-w-[330px] bg-surface-card rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-border/50"
        >
          <button
            type="button"
            onClick={onSelectIntelligentReports}
            className="w-full py-5 sm:py-6 px-6 text-center text-base sm:text-lg font-extrabold text-primary hover:bg-primary-light/40 active:bg-primary-light/60 transition-colors cursor-pointer"
          >
            Intelligent Reports
          </button>

          <div className="border-t border-primary/80" />

          <button
            type="button"
            onClick={onSelectLifeThreatReports}
            className="w-full py-5 sm:py-6 px-6 text-center text-base sm:text-lg font-extrabold text-primary hover:bg-primary-light/40 active:bg-primary-light/60 transition-colors cursor-pointer"
          >
            Life Threat Reports
          </button>
        </div>
      </div>
    </div>
  );
}

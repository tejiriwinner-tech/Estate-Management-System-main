"use client";

import React from "react";
import {
  Calendar,
  BarChart3,
  UserCog,
  Contact,
  AlertOctagon,
  Eye,
  FileText,
  FileSpreadsheet,
  Printer,
  Check,
} from "lucide-react";
import {
  ReportTemplateCard,
  ReportUsageMetrics,
  ReportIconType,
  ReportBadgeTone,
} from "@/types/reportCenter";

interface ReportCardsGridProps {
  templates: ReportTemplateCard[];
  usageMetrics: ReportUsageMetrics;
  onPreview: (template: ReportTemplateCard) => void;
  onExport: (template: ReportTemplateCard, format: "PDF" | "XLSX" | "PRINT") => void;
}

const iconMap: Record<
  ReportIconType,
  React.ComponentType<{ className?: string }>
> = {
  monthly: Calendar,
  yearly: BarChart3,
  service: UserCog,
  resident: Contact,
  outstanding: AlertOctagon,
};

const badgeToneCls: Record<ReportBadgeTone, string> = {
  neutral: "bg-primary/10 text-primary border border-primary/15",
  accent: "bg-accent/15 text-accent-dark border border-accent/30",
  critical: "bg-rose-50 text-primary border border-primary/20",
  primary: "bg-primary text-white",
};

export function ReportCardsGrid({
  templates,
  usageMetrics,
  onPreview,
  onExport,
}: ReportCardsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* 5 Report Template Cards */}
      {templates.map((tpl) => {
        const Icon = iconMap[tpl.iconType] || Calendar;
        const isCritical = tpl.badgeTone === "critical";

        return (
          <div
            key={tpl.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div>
              {/* Top Row: Icon Badge + Category Pill */}
              <div className="flex items-start justify-between gap-2 mb-4">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                    isCritical
                      ? "bg-primary/10 text-primary"
                      : "bg-accent/15 text-primary"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-extrabold tracking-wide ${
                    badgeToneCls[tpl.badgeTone]
                  }`}
                >
                  {tpl.badgeLabel}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-extrabold tracking-tight text-dark">
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-1.5">
                {tpl.description}
              </p>
            </div>

            {/* Bottom Actions: Full-Width Preview + 3 Format Buttons */}
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => onPreview(tpl)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50/80 hover:bg-primary/5 py-2.5 text-xs font-extrabold text-primary transition-colors cursor-pointer"
              >
                <Eye className="h-4 w-4 text-accent" />
                <span>Preview</span>
              </button>

              <div className="flex items-center gap-2">
                {/* PDF Export */}
                <button
                  type="button"
                  onClick={() => onExport(tpl, "PDF")}
                  title="Download PDF"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                >
                  <FileText className="h-4 w-4" />
                </button>

                {/* XLSX Export */}
                <button
                  type="button"
                  onClick={() => onExport(tpl, "XLSX")}
                  title="Download Excel (XLSX)"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                </button>

                {/* Print Report */}
                <button
                  type="button"
                  onClick={() => onExport(tpl, "PRINT")}
                  title="Print Report"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-dark hover:bg-dark hover:text-white transition-colors cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* 6th Card: Report Usage Metrics (Solid Brand Primary Card) */}
      <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-6 text-white shadow-md">
        <div>
          <h3 className="text-base font-extrabold tracking-tight text-white">
            {usageMetrics.title}
          </h3>
          <p className="text-xs text-white/80 mt-1">
            {usageMetrics.subtitle}
          </p>
        </div>

        {/* 5-Bar Decorative Histogram matching Figma */}
        <div className="my-6 flex h-24 items-end justify-between gap-2.5 px-1">
          {usageMetrics.barHeights.map((heightPct, idx) => {
            const isCenterPeak = idx === 2;
            return (
              <div
                key={idx}
                style={{ height: `${heightPct}%` }}
                className={`flex-1 rounded-t-lg transition-all ${
                  isCenterPeak
                    ? "bg-accent/70 shadow-sm"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              />
            );
          })}
        </div>

        {/* Bottom Inner Glass Box: Total Downloads */}
        <div className="flex items-center justify-between rounded-xl bg-dark/25 px-4 py-3.5 border border-white/10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/75">
              TOTAL DOWNLOADS
            </p>
            <p className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
              {usageMetrics.totalDownloads.toLocaleString("en-US")}
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-accent">
            <Check className="h-5 w-5 border-b-2 border-accent pb-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}

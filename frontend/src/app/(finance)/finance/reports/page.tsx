"use client";

import React, { useState } from "react";
import { FileBarChart2, Upload, CheckCircle2 } from "lucide-react";
import { ReportFilterBar } from "@/components/reports/ReportFilterBar";
import { ReportCardsGrid } from "@/components/reports/ReportCardsGrid";
import { RecentExportsTable } from "@/components/reports/RecentExportsTable";
import { ErrorBanner, financeFetch, useFinance } from "@/lib/finance/api";
import {
  ReportFilterState,
  ReportTemplateCard,
  RecentExportItem,
  ReportCenterData,
} from "@/types/reportCenter";

export default function FinanceReportCenterPage() {
  const { data, error, reload } = useFinance<{ data: ReportCenterData }, ReportCenterData>(
    "/finance/reports",
    { templates: [], usageMetrics: { title: "Report Usage Metrics", subtitle: "", totalDownloads: 0, barHeights: [0, 0, 0, 0, 0] }, recentExports: [] }
  );
  const [filters, setFilters] = useState<ReportFilterState>({
    month: "Current Month",
    year: "2024",
    service: "All Services",
    area: "All Areas",
    status: "All Status",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateCustomReport = () => {
    triggerToast(
      `Custom report generated for ${filters.month} ${filters.year} (${filters.service}, ${filters.area}).`
    );
  };

  const handlePreview = (tpl: ReportTemplateCard) => {
    triggerToast(
      `Opening preview for "${tpl.title}" (${filters.month} ${filters.year})...`
    );
  };

  const handleExportTemplate = async (
    tpl: ReportTemplateCard,
    format: "PDF" | "XLSX" | "PRINT"
  ) => {
    if (format === "PRINT") {
      window.print();
      return;
    }
    try {
      // Only CSV is generated for now, whichever button was pressed.
      const res = await financeFetch<{ export: RecentExportItem }>("/finance/reports/export", {
        method: "POST",
        body: JSON.stringify({ template_id: tpl.id, format: "CSV", service: filters.service, status: filters.status }),
      });
      await reload();
      triggerToast(`Generated ${res.export.fileName} (CSV${format !== "PDF" ? "" : "; PDF is not available yet"}).`);
      if (res.export.downloadUrl) window.open(res.export.downloadUrl, "_blank");
    } catch (e) {
      triggerToast(e instanceof Error ? e.message : "Could not generate the report.");
    }
  };

  const handleDownloadRecent = (item: RecentExportItem) => {
    if (item.downloadUrl) window.open(item.downloadUrl, "_blank");
    triggerToast(`Downloading ${item.fileName}...`);
  };

  return (
    <div className="relative space-y-6 pb-12">
      <ErrorBanner message={error} />
      {/* 1. Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">
            Export &amp; Report Center
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Generate, analyze, and download financial and operational reports for
            the estate.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={handleCreateCustomReport}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all cursor-pointer"
          >
            <FileBarChart2 className="h-4 w-4 text-accent" />
            <span>Create Custom Report</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs font-bold text-dark shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. 5-Column Filter Bar */}
      <ReportFilterBar filters={filters} onChange={setFilters} />

      {/* 3. 2x3 Report Cards Grid + Usage Metrics Card */}
      <ReportCardsGrid
        templates={data.templates}
        usageMetrics={data.usageMetrics}
        onPreview={handlePreview}
        onExport={handleExportTemplate}
      />

      {/* 4. Recent Exports Table */}
      <RecentExportsTable
        exportsList={data.recentExports}
        onDownload={handleDownloadRecent}
      />

      {/* Floating Bottom-Right Quick Share/Export FAB matching Figma */}
      <button
        type="button"
        onClick={handleCreateCustomReport}
        title="Quick Export / Share Report"
        className="fixed bottom-20 md:bottom-8 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/30 transition-transform hover:scale-105 cursor-pointer print:hidden"
      >
        <Upload className="h-5 w-5" />
      </button>
    </div>
  );
}

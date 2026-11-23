"use client";

import React, { useState } from "react";
import { FileText, X, Home, Calendar } from "lucide-react";
import { useAdminReports } from "@/lib/admin/reportsApi";
import { IntelligenceReportItem } from "@/types/admin/reports";
import { cn } from "@/lib/admin/utils";

export function AdminReportListView() {
  const { data: rd } = useAdminReports();
  const reports: IntelligenceReportItem[] = rd.intelligenceReports;

  const [selectedReport, setSelectedReport] =
    useState<IntelligenceReportItem | null>(null);

  return (
    <div className="animate-in fade-in duration-300 pb-8">
      {/* ================= MAIN CARD: LIST OF INTELLIGENCE REPORT ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Card Header Area */}
        <div className="px-6 sm:px-8 py-6 bg-surface-card">
          <h1 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
            List of intelligence report
          </h1>
        </div>

        {/* Desktop & Tablet 4-Column Table (sm and up) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-[#EEF1F6] text-dark/75 text-xs font-extrabold uppercase tracking-wider border-y border-border/60">
                <th className="py-3.5 pl-6 sm:pl-8 pr-4 w-[34%]">NAME</th>
                <th className="py-3.5 px-4 w-[24%]">HOUSE NUMBER</th>
                <th className="py-3.5 px-4 w-[22%]">DATE</th>
                <th className="py-3.5 pl-4 pr-6 sm:pr-8 w-[20%] text-center">
                  VIEW
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50">
              {reports.map((item, idx) => {
                const isStriped = idx % 2 === 1;
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "text-xs sm:text-sm transition-colors hover:bg-primary-light/15",
                      isStriped ? "bg-[#F7F7F8]" : "bg-surface-card"
                    )}
                  >
                    <td className="py-3.5 pl-6 sm:pl-8 pr-4 font-medium text-dark">
                      {item.name}
                    </td>
                    <td className="py-3.5 px-4 font-normal text-dark/70">
                      {item.house_number}
                    </td>
                    <td className="py-3.5 px-4 font-normal text-dark/70">
                      {item.date}
                    </td>
                    <td className="py-2.5 pl-4 pr-6 sm:pr-8 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReport(item)}
                        className="inline-flex items-center justify-center min-w-[74px] px-5 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-2xs transition-all active:scale-95"
                      >
                        view
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Zebra Card Stack (< 640px) */}
        <div className="sm:hidden divide-y divide-border/60 border-t border-border/60">
          {reports.map((item, idx) => {
            const isStriped = idx % 2 === 1;
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 flex items-center justify-between gap-3",
                  isStriped ? "bg-[#F7F7F8]" : "bg-surface-card"
                )}
              >
                <div className="space-y-1 min-w-0">
                  <div className="text-sm font-extrabold text-dark truncate">
                    {item.name}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted font-semibold">
                    <span className="px-2 py-0.5 rounded bg-accent-light/75 text-dark font-bold">
                      {item.house_number}
                    </span>
                    <span>{item.date}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedReport(item)}
                  className="inline-flex items-center justify-center px-4 py-1.5 rounded-md bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-2xs shrink-0 transition-all active:scale-95"
                >
                  view
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= INTELLIGENCE REPORT DETAIL MODAL ================= */}
      {selectedReport && (
        <div
          className="fixed inset-0 z-50 bg-dark/55 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedReport(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="intel-report-modal-title"
            className="bg-surface-card w-full max-w-md rounded-2xl border border-border shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-primary text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5" />
                <h2
                  id="intel-report-modal-title"
                  className="text-base font-extrabold tracking-tight"
                >
                  Intelligence Report Details
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted">
                  Reported By / Resident
                </div>
                <div className="text-lg font-extrabold text-dark mt-0.5">
                  {selectedReport.name}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-surface rounded-xl p-3.5 border border-border/70">
                <div className="flex items-center gap-2 text-xs">
                  <Home className="w-4 h-4 text-accent shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted">
                      House No
                    </div>
                    <div className="font-extrabold text-dark">
                      {selectedReport.house_number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold uppercase text-muted">
                      Date
                    </div>
                    <div className="font-extrabold text-dark">
                      {selectedReport.date}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-extrabold text-primary uppercase tracking-wider">
                  Intelligence Summary
                </div>
                <p className="text-xs sm:text-sm text-dark/85 leading-relaxed bg-accent-light/35 border border-accent/30 rounded-xl p-3.5 font-medium">
                  {selectedReport.summary}
                </p>
              </div>
            </div>

            <div className="px-6 py-3.5 bg-surface border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="px-5 py-2 rounded-xl bg-dark hover:bg-dark/90 text-white text-xs font-extrabold transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

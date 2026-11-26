"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, ShieldAlert, ArrowLeft } from "lucide-react";
import { useAdminReports } from "@/lib/admin/reportsApi";
import { LifeThreatAlertItem } from "@/types/admin/reports";
import { cn } from "@/lib/admin/utils";

export function AdminReportTableView() {
  const { data: rd } = useAdminReports();
  const alerts: (LifeThreatAlertItem & { status?: string; details?: string })[] = rd.lifeThreatAlerts;
  const TOTAL_LIFE_THREAT_ALERTS = rd.lifeThreatTotal;

  const [showAlertToast, setShowAlertToast] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Ongoing" | "Resolved">("ALL");

  const filtered = alerts.filter((a) => {
    if (statusFilter === "ALL") return true;
    return (a.status || "Ongoing") === statusFilter;
  });

  return (
    <div className="space-y-4 animate-in fade-in duration-300 pb-8">
      <div>
        <Link
          href="/admin/reports"
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
          Back to Reports Overview
        </Link>
      </div>

      {/* ================= SUB-HEADER BAR: LIST OF LIFE THREAT ALERTS ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/80 px-5 sm:px-7 py-4 shadow-2xs flex items-center justify-between gap-4">
        <h1 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
          List of Life Threat Alerts
        </h1>

        <button
          type="button"
          onClick={() => setShowAlertToast((prev) => !prev)}
          title="View alert notifications"
          aria-label="View alert notifications"
          className="relative p-2 rounded-xl text-dark/70 hover:text-dark hover:bg-surface-subtle transition-colors"
        >
          <Bell className="w-5 h-5 stroke-[2]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white" />
        </button>
      </div>

      {showAlertToast && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-primary-light/60 border border-primary/30 text-dark text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
            <span>
              Monitoring <strong>{alerts.length}</strong> recent emergency life
              threat alerts across the estate ({TOTAL_LIFE_THREAT_ALERTS} total
              archived).
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAlertToast(false)}
            className="text-xs font-extrabold text-primary hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ================= MAIN ZEBRA-STRIPED TABLE CARD ================= */}
      <div className="flex flex-wrap items-center gap-2">
        {(["ALL", "Ongoing", "Resolved"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setStatusFilter(tab)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors",
              statusFilter === tab
                ? "bg-[#B22222] text-white border-[#B22222]"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab === "ALL" ? `All Alerts (${alerts.length})` : tab}
          </button>
        ))}
      </div>

      <div className="bg-surface-card rounded-2xl border border-border/80 shadow-xs overflow-hidden">
        {/* Desktop & Tablet Zebra Table (sm and up) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-surface-card border-b border-border/50 text-xs sm:text-sm font-bold text-dark">
                <th className="py-4 pl-6 pr-4 w-[40%]">Alert / Sender</th>
                <th className="py-4 px-4 w-[25%]">Location</th>
                <th className="py-4 px-4 w-[15%]">Status</th>
                <th className="py-4 pl-4 pr-6 w-[20%]">Date</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((item, idx) => {
                const isStriped = idx % 2 === 1;
                const isResolved = item.status === "Resolved";
                return (
                  <tr
                    key={item.id}
                    className={cn(
                      "text-xs sm:text-sm text-dark/90 transition-colors hover:bg-primary-light/15",
                      isStriped ? "bg-[#EFEFEF]" : "bg-surface-card"
                    )}
                  >
                    <td className="py-4 pl-6 pr-4 font-semibold text-dark">
                      {item.name}
                    </td>
                    <td className="py-4 px-4 font-normal text-dark">
                      {item.house_number}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border",
                          isResolved
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        )}
                      >
                        {item.status || "Ongoing"}
                      </span>
                    </td>
                    <td className="py-4 pl-4 pr-6 font-normal text-dark">
                      {item.date}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-slate-500">
                    No emergency or incident alerts match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Zebra Card Stack (< 640px) */}
        <div className="sm:hidden divide-y divide-border/60">
          {filtered.map((item, idx) => {
            const isStriped = idx % 2 === 1;
            const isResolved = item.status === "Resolved";
            return (
              <div
                key={item.id}
                className={cn(
                  "p-4 flex items-center justify-between gap-3",
                  isStriped ? "bg-[#EFEFEF]/80" : "bg-surface-card"
                )}
              >
                <div className="min-w-0">
                  <div className="text-sm font-extrabold text-dark truncate">
                    {item.name}
                  </div>
                  <div className="text-xs font-semibold text-muted mt-0.5">
                    {item.house_number} • {item.date}
                  </div>
                </div>

                <span
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-extrabold shrink-0 border",
                    isResolved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-red-50 text-red-700 border-red-200"
                  )}
                >
                  {item.status || "Ongoing"}
                </span>
              </div>
            );
          })}
        </div>

        {/* Card Footer Row */}
        <div className="px-6 py-4 bg-surface-card border-t border-border/50 text-xs sm:text-sm font-extrabold text-dark">
          {filtered.length} of {TOTAL_LIFE_THREAT_ALERTS}
        </div>
      </div>
    </div>
  );
}

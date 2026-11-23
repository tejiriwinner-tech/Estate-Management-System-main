"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { MobileTrendMonth } from "@/types/mobileFinance";

interface MobileRevenueTrendsProps {
  months: MobileTrendMonth[];
}

export function MobileRevenueTrends({ months }: MobileRevenueTrendsProps) {
  const [selectedMonth, setSelectedMonth] = useState("MAR");

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Revenue Trends</h3>
          <p className="text-xs text-slate-400">Last 6 Months</p>
        </div>

        <Link
          href="/reports"
          className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          <span>Details</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mini Trend Visualizer */}
      <div className="pt-2">
        {/* Simple Bar Visualizer */}
        <div className="flex items-end justify-between gap-2 h-20 pb-3 border-b border-slate-50">
          {months.map((m) => {
            const isCurrent = m.month === selectedMonth;
            const heightPct = Math.round((m.value / 500000) * 100);

            return (
              <div
                key={m.month}
                className="flex flex-1 flex-col items-center justify-end h-full gap-1"
                onClick={() => setSelectedMonth(m.month)}
              >
                <div
                  className={`w-full rounded-t-md transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/30"
                      : "bg-slate-100 hover:bg-slate-200"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Month Selector Labels */}
        <div className="flex items-center justify-between pt-3">
          {months.map((m) => {
            const isCurrent = m.month === selectedMonth;
            return (
              <button
                key={m.month}
                type="button"
                onClick={() => setSelectedMonth(m.month)}
                className={`text-[11px] font-bold transition-colors ${
                  isCurrent
                    ? "text-emerald-600 font-extrabold"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {m.month}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

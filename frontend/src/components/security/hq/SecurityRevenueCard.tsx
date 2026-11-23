"use client";

import { Download, TrendingUp } from "lucide-react";

interface RevenueRow {
  label: string;
  value: string;
  percentage?: string;
}

interface SecurityRevenueCardProps {
  total: string;
  currency?: string;
  rows: RevenueRow[];
  chartBars?: number[]; // 0–100 relative heights
}

export default function SecurityRevenueCard({
  total,
  currency = "₦",
  rows,
  chartBars = [40, 55, 45, 70, 80, 90, 75],
}: SecurityRevenueCardProps) {
  const max = Math.max(...chartBars);

  return (
    <div className="rounded-xl bg-[--color-primary-dark] text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-green-200">Security Revenue</p>
        <TrendingUp className="w-4 h-4 text-green-300" />
      </div>

      {/* Total */}
      <div className="px-5 pb-4">
        <p className="text-3xl font-bold tracking-tight">
          {currency}{total}
        </p>
      </div>

      {/* Rows */}
      <div className="px-5 pb-4 flex flex-col gap-2.5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-xs text-green-200">{row.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">{row.value}</span>
              {row.percentage && (
                <span className="text-[10px] text-green-300">{row.percentage}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-5 pb-4 flex items-end gap-1 h-16">
        {chartBars.map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-t-sm bg-green-400 opacity-80"
            style={{ height: `${(h / max) * 100}%` }}
          />
        ))}
      </div>

      {/* Download button */}
      <div className="px-4 pb-5">
        <button className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-white text-[--color-primary-dark] text-xs font-bold hover:bg-green-50 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Download Financial Report
        </button>
      </div>
    </div>
  );
}

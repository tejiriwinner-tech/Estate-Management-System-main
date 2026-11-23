"use client";

import React from "react";
import { PerformancePoint } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface PerformanceChartProps {
  data: PerformancePoint[];
  year: string;
  highlightMonth?: string;
}

export function PerformanceChart({ data, year, highlightMonth }: PerformanceChartProps) {
  const highlight =
    highlightMonth ?? data.reduce((best, p) => (p.value > best.value ? p : best), data[0])?.month;
  const average = Math.round(data.reduce((sum, p) => sum + p.value, 0) / (data.length || 1));

  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-card h-full flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
            Performance Summary
          </h2>
          <p className="text-xs text-muted font-medium mt-0.5">
            Efficiency &amp; Resolution Rate (Last 6 Months) · Avg {average}%
          </p>
        </div>
        <span className="shrink-0 px-3 py-1 rounded-lg text-xs font-bold bg-surface-subtle text-dark border border-border">
          {year}
        </span>
      </div>

      {/* Bars */}
      <div className="flex-1 grid grid-cols-6 gap-2 sm:gap-4 items-end mt-6 min-h-[160px] sm:min-h-[200px]">
        {data.map((point) => {
          const isHighlight = point.month === highlight;
          return (
            <div key={point.month} className="flex flex-col items-center h-full group">
              {/* Track */}
              <div className="relative w-full flex-1 rounded-lg bg-surface-subtle overflow-hidden flex items-end">
                <div
                  className={cn(
                    "w-full rounded-lg transition-all duration-500",
                    isHighlight ? "bg-accent" : "bg-primary group-hover:bg-primary-hover"
                  )}
                  style={{ height: `${point.value}%` }}
                />
                {/* Tooltip */}
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-md bg-dark text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {point.value}%
                </span>
              </div>
              <span
                className={cn(
                  "mt-2 text-[10px] sm:text-xs font-bold tracking-wide",
                  isHighlight ? "text-accent" : "text-muted"
                )}
              >
                {point.month}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

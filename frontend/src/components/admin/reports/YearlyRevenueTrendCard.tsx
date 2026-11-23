"use client";

import React, { useState } from "react";
import { YearlyRevenueBar } from "@/types/admin/reports";

interface YearlyRevenueTrendCardProps {
  bars: YearlyRevenueBar[];
}

const Y_TICKS = [16, 14, 12, 10, 8, 6, 4, 2, 0];

export function YearlyRevenueTrendCard({ bars }: YearlyRevenueTrendCardProps) {
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);
  const maxVal = 16;

  return (
    <div className="bg-surface-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="mb-5">
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Yearly Revenue Trend (2020-2024)
        </h2>
      </div>

      {/* Bar Chart Area */}
      <div className="flex items-stretch gap-3">
        {/* Y-Axis Labels */}
        <div className="flex flex-col justify-between pb-6 text-[10px] sm:text-[11px] font-bold text-primary select-none shrink-0 text-right w-9">
          {Y_TICKS.map((tick) => (
            <span key={tick}>₦{tick}M</span>
          ))}
        </div>

        {/* Plot Grid + Columns */}
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="relative h-[200px] sm:h-[220px] flex items-end justify-around gap-3 sm:gap-5 px-2 sm:px-4">
            {/* Horizontal Dashed/Subtle Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
              {Y_TICKS.map((tick) => (
                <div
                  key={tick}
                  className="w-full border-t border-border/50"
                />
              ))}
            </div>

            {/* 5 Vertical Bars */}
            {bars.map((bar) => {
              const heightPct = Math.min(100, (bar.valueM / maxVal) * 100);
              const isHovered = hoveredYear === bar.year;

              return (
                <div
                  key={bar.year}
                  className="relative z-10 flex-1 max-w-[54px] h-full flex flex-col justify-end items-center group"
                  onMouseEnter={() => setHoveredYear(bar.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {isHovered && (
                    <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-dark text-white text-[10px] font-extrabold shadow-sm whitespace-nowrap">
                      ₦{bar.valueM.toFixed(1)}M
                    </div>
                  )}

                  <div
                    style={{ height: `${heightPct}%` }}
                    className="w-full rounded-t-lg bg-primary hover:bg-primary-hover transition-all duration-300 shadow-2xs cursor-pointer"
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Year Labels */}
          <div className="flex items-center justify-around gap-3 sm:gap-5 px-2 sm:px-4 pt-2.5 text-[10px] sm:text-[11px] font-semibold text-primary select-none">
            {bars.map((bar) => (
              <div
                key={bar.year}
                className="flex-1 max-w-[54px] text-center"
              >
                {bar.year}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { CollectionStatusData } from "@/types/admin/reports";

interface CollectionStatusCardProps {
  data: CollectionStatusData;
  onOpenDefaulters: () => void;
}

export function CollectionStatusCard({
  data,
  onOpenDefaulters,
}: CollectionStatusCardProps) {
  // Semi-circle arc math (radius 74, circumference of semi-circle = PI * 74 = 232.48)
  const radius = 74;
  const arcLength = Math.PI * radius;
  const dashOffset = arcLength * (1 - data.paidPercentage / 100);

  return (
    <div className="bg-surface-card rounded-2xl border border-border/80 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between gap-2 mb-5">
        <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Collection Status
        </h2>

        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-accent-light/75 text-dark text-[10px] font-extrabold uppercase tracking-wider">
          {data.statusLabel}
        </span>
      </div>

      {/* Main Content Split: Left Gauge + Right Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto">
        {/* Left 5 Columns: 180-Degree Semi-Circle Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 sm:w-48 h-28 flex items-end justify-center">
            <svg
              viewBox="0 0 180 100"
              className="w-full h-full overflow-visible"
            >
              {/* Track Arc */}
              <path
                d="M 16 90 A 74 74 0 0 1 164 90"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="14"
                strokeLinecap="butt"
              />
              {/* Active Paid Arc */}
              <path
                d="M 16 90 A 74 74 0 0 1 164 90"
                fill="none"
                stroke="#B22222"
                strokeWidth="14"
                strokeLinecap="butt"
                strokeDasharray={arcLength}
                strokeDashoffset={dashOffset}
                className="transition-all duration-500"
              />
            </svg>

            {/* Center Label inside Semi-Circle */}
            <div className="absolute bottom-1.5 flex flex-col items-center text-center">
              <span className="text-2xl font-extrabold text-dark leading-none">
                {data.paidPercentage}%
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary mt-1">
                PAID
              </span>
            </div>
          </div>
        </div>

        {/* Right 7 Columns: Paid & Outstanding Bars + View Defaulters List CTA */}
        <div className="sm:col-span-7 space-y-4">
          {/* Paid Amount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-dark">Paid Amount</span>
              <span className="text-accent">{data.paidAmountLabel}</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E9EEF5] overflow-hidden">
              <div
                style={{ width: `${data.paidPercentage}%` }}
                className="h-full rounded-full bg-primary transition-all duration-500"
              />
            </div>
          </div>

          {/* Outstanding */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className="text-dark">Outstanding</span>
              <span className="text-primary">
                {data.outstandingAmountLabel}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#E9EEF5] overflow-hidden">
              <div
                style={{ width: `${data.outstandingPercentage}%` }}
                className="h-full rounded-full bg-primary transition-all duration-500"
              />
            </div>
          </div>

          {/* Outline Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={onOpenDefaulters}
              className="w-full py-2.5 px-4 rounded-xl border border-primary text-primary hover:bg-primary hover:text-white text-xs sm:text-sm font-extrabold transition-colors shadow-2xs"
            >
              View Defaulters List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

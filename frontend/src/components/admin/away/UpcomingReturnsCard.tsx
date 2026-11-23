"use client";

import React from "react";
import { Home, AlertTriangle, Info } from "lucide-react";
import { UpcomingReturnItem } from "@/types/admin/away";
import { cn } from "@/lib/admin/utils";

interface UpcomingReturnsCardProps {
  items: UpcomingReturnItem[];
}

export function UpcomingReturnsCard({ items }: UpcomingReturnsCardProps) {
  return (
    <div className="bg-surface-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full min-h-[540px] space-y-6">
      <div>
        {/* Card Header */}
        <div className="pb-4 border-b border-border/60">
          <h2 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
            Upcoming Returns
          </h2>
          <p className="text-xs text-muted font-medium mt-0.5">Next 7 days</p>
        </div>

        {/* Upcoming Return Cards */}
        <div className="space-y-3.5 pt-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border/75 bg-[#FAFBFD] hover:bg-surface-subtle/70 transition-colors p-3.5 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Date Badge (NOV 18 / NOV 20 / NOV 25) */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 leading-none",
                    item.highlight_badge
                      ? "bg-accent-light/85 text-primary"
                      : "bg-[#EAEFF8] text-dark"
                  )}
                >
                  <span className="text-[9px] font-extrabold uppercase tracking-wider opacity-80">
                    {item.month_short}
                  </span>
                  <span className="text-base font-extrabold mt-0.5">
                    {item.day}
                  </span>
                </div>

                {/* Resident Name & Unit */}
                <div className="min-w-0">
                  <div className="font-extrabold text-dark text-xs sm:text-sm truncate">
                    {item.resident_name}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted font-medium mt-0.5">
                    <Home className="w-3 h-3 text-muted shrink-0" />
                    <span className="truncate">{item.unit}</span>
                  </div>
                </div>
              </div>

              {/* Optional Warning Triangle for Overdue / Urgent */}
              {item.has_warning && (
                <AlertTriangle className="w-4 h-4 text-primary shrink-0 stroke-[2.2]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Notice Box */}
      <div className="rounded-2xl bg-accent-light/45 border border-accent/30 p-4 flex items-start gap-3">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5 stroke-[2.3]" />
        <p className="text-xs text-dark/85 font-medium leading-relaxed">
          Ensure security gates are notified 24 hours prior to expected return
          dates.
        </p>
      </div>
    </div>
  );
}

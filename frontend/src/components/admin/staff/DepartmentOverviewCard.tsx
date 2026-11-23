"use client";

import React from "react";
import { DepartmentAnalyticsData } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface DepartmentOverviewCardProps {
  analytics: DepartmentAnalyticsData;
}

export function DepartmentOverviewCard({ analytics }: DepartmentOverviewCardProps) {
  return (
    <div className="bg-surface-card border border-border/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div>
        <h3 className="text-base sm:text-lg font-extrabold text-dark tracking-tight">
          Department Overview
        </h3>
        <p className="text-xs text-muted font-medium mt-0.5">
          Distribution of staff across operational units
        </p>
      </div>

      {/* Body: Left Bar Distribution + Right KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-end mt-6 pt-2">
        {/* Left: 5 Department Columns (OPS, FIN, MAINT, LEGAL, HR) */}
        <div className="sm:col-span-7 flex items-end justify-between gap-3 sm:gap-4 h-36 px-2">
          {analytics.departments.map((dept, index) => {
            const isTop = index === 0;
            return (
              <div
                key={dept.code}
                className="flex-1 flex flex-col items-center h-full justify-end group"
              >
                {/* Track + Fill Bar */}
                <div className="w-full max-w-[42px] h-28 bg-[#F4F6F9] rounded-xl flex items-end overflow-hidden p-0.5 relative">
                  <div
                    style={{ height: `${dept.percentage}%` }}
                    className={cn(
                      "w-full rounded-lg transition-all duration-500 group-hover:opacity-90",
                      isTop ? "bg-primary" : "bg-primary/80"
                    )}
                    title={`${dept.label}: ${dept.count} staff (${dept.percentage}%)`}
                  />
                </div>
                <span className="mt-2.5 text-[10px] font-bold uppercase tracking-wider text-muted group-hover:text-dark transition-colors">
                  {dept.code}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Retention Rate, Avg Tenure, Hiring Target */}
        <div className="sm:col-span-5 sm:border-l sm:border-border/80 sm:pl-6 space-y-4">
          {analytics.retention_rate && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted font-medium">
              Retention Rate
            </span>
            <span className="text-base sm:text-lg font-extrabold text-accent">
              {analytics.retention_rate}
            </span>
          </div>
          )}

          {analytics.avg_tenure && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted font-medium">
              Avg Tenure
            </span>
            <span className="text-base sm:text-lg font-extrabold text-dark">
              {analytics.avg_tenure}
            </span>
          </div>
          )}

          {analytics.hiring_target && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-sm text-muted font-medium">
              Hiring Target
            </span>
            <span className="text-base sm:text-lg font-extrabold text-dark">
              {analytics.hiring_target}
            </span>
          </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { History } from "lucide-react";
import { StaffActivityItem } from "@/types/admin/staff";
import { cn } from "@/lib/admin/utils";

interface RecentActivityWidgetProps {
  activities: StaffActivityItem[];
}

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-sm">
      {/* Widget Header */}
      <div className="flex items-center gap-2.5 mb-5 pb-3.5 border-b border-border/60">
        <div className="w-8 h-8 rounded-full bg-accent-light text-accent flex items-center justify-center">
          <History className="w-4 h-4" />
        </div>
        <h3 className="font-extrabold text-base text-dark tracking-tight">
          Recent Activity
        </h3>
      </div>

      {/* Timeline Items */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {activities.map((item) => {
          const isRed = item.dot_color === "red";

          return (
            <div key={item.id} className="relative group">
              {/* Dot Indicator */}
              <div
                className={cn(
                  "absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white transition-transform group-hover:scale-125",
                  isRed ? "bg-primary ring-red-100" : "bg-accent ring-yellow-100"
                )}
              />

              {/* Timestamp */}
              <div className="text-[11px] font-bold text-muted">
                {item.timestamp_display}
              </div>

              {/* Activity Description */}
              <p className="text-xs sm:text-sm text-dark mt-1 font-medium leading-snug">
                <span className="font-bold text-dark">{item.staff_name}</span>{" "}
                {item.action_text}{" "}
                {item.target_entity && (
                  <span className={cn("font-bold", isRed ? "text-primary" : "text-dark")}>
                    {item.target_entity}
                  </span>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

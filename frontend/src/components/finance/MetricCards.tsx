"use client";

import React from "react";
import {
  CreditCard,
  Calendar,
  BarChart3,
  Hourglass,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { MetricCardData } from "@/types/finance";

interface MetricCardsProps {
  metrics: MetricCardData[];
}

export function MetricCards({ metrics }: MetricCardsProps) {
  const getIcon = (type: MetricCardData["icon"]) => {
    switch (type) {
      case "wallet":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "calendar":
        return <Calendar className="h-4 w-4 text-emerald-600" />;
      case "chart":
        return <BarChart3 className="h-4 w-4 text-purple-600" />;
      case "hourglass":
        return <Hourglass className="h-4 w-4 text-amber-600" />;
      case "check":
        return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-rose-500" />;
    }
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {metrics.map((item) => {
        return (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:shadow-md"
          >
            {/* Top row: Icon badge + Title */}
            <div className="flex items-center gap-2">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${item.badgeBg}`}
              >
                {getIcon(item.icon)}
              </div>
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase truncate">
                {item.title}
              </span>
            </div>

            {/* Value */}
            <div className="my-2 sm:my-2.5">
              <p className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                {item.value}
              </p>
            </div>

            {/* Bottom subtitle / trend */}
            <div className="truncate">
              {item.subtitleType === "trend-up" && (
                <p className="text-xs font-semibold text-emerald-600 truncate">
                  {item.subtitle}
                </p>
              )}
              {item.subtitleType === "warning" && (
                <p className="text-xs font-medium text-amber-600 truncate">
                  {item.subtitle}
                </p>
              )}
              {item.subtitleType === "neutral" && (
                <p className="text-xs font-medium text-slate-400 truncate">
                  {item.subtitle}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

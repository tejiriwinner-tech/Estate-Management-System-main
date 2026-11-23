"use client";

import React from "react";
import { CreditCard, Flag, AlertCircle } from "lucide-react";
import { MobileMetric } from "@/types/mobileFinance";

interface MobileMetricCardsProps {
  metrics: MobileMetric[];
}

export function MobileMetricCards({ metrics }: MobileMetricCardsProps) {
  const getIcon = (type: MobileMetric["icon"], color: MobileMetric["accentColor"]) => {
    switch (type) {
      case "wallet":
        return <CreditCard className="h-5 w-5 text-emerald-600" />;
      case "flag":
        return <Flag className="h-5 w-5 text-amber-700" />;
      case "briefcase":
        return <AlertCircle className="h-5 w-5 text-rose-600" />;
    }
  };

  const getBorderColor = (color: MobileMetric["accentColor"]) => {
    switch (color) {
      case "emerald":
        return "border-l-emerald-600";
      case "amber":
        return "border-l-amber-600";
      case "rose":
        return "border-l-rose-600";
    }
  };

  const getIconBg = (color: MobileMetric["accentColor"]) => {
    switch (color) {
      case "emerald":
        return "bg-emerald-50";
      case "amber":
        return "bg-amber-50";
      case "rose":
        return "bg-rose-50";
    }
  };

  return (
    <div className="space-y-3">
      {metrics.map((item) => {
        return (
          <div
            key={item.id}
            className={`flex items-center justify-between rounded-2xl border border-slate-100 border-l-4 bg-white p-4 shadow-sm ${getBorderColor(
              item.accentColor
            )}`}
          >
            {/* Left section: Circular icon + Label & Value */}
            <div className="flex items-center gap-3.5">
              <div
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl ${getIconBg(
                  item.accentColor
                )}`}
              >
                {getIcon(item.icon, item.accentColor)}
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {item.label}
                </p>
                <p className="text-xl font-extrabold tracking-tight text-slate-900">
                  {item.value}
                </p>
              </div>
            </div>

            {/* Right badge / indicator */}
            <div>
              {item.badgeType === "trend" && (
                <span className="inline-flex items-center rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                  {item.badgeValue}
                </span>
              )}

              {item.badgeType === "radial" && (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-600 bg-amber-50/30 text-[11px] font-extrabold text-amber-800">
                  {item.badgeValue}
                </div>
              )}

              {item.badgeType === "action" && (
                <button
                  type="button"
                  className="rounded-lg bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-800 transition-colors"
                >
                  {item.actionText}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

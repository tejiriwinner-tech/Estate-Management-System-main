"use client";

import React from "react";
import { CheckCircle2, Banknote, ShieldCheck, Trash2 } from "lucide-react";
import { AnalyticsKpiCard, AnalyticsIconType } from "@/types/analytics";

interface AnalyticsKpiCardsProps {
  cards: AnalyticsKpiCard[];
}

const iconConfig: Record<
  AnalyticsIconType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgCls: string;
    iconCls: string;
  }
> = {
  collection: {
    icon: CheckCircle2,
    bgCls: "bg-accent/15",
    iconCls: "text-accent",
  },
  revenue: {
    icon: Banknote,
    bgCls: "bg-primary/10",
    iconCls: "text-primary",
  },
  top_service: {
    icon: ShieldCheck,
    bgCls: "bg-accent/15",
    iconCls: "text-accent",
  },
  laggard: {
    icon: Trash2,
    bgCls: "bg-primary/10",
    iconCls: "text-primary",
  },
};

export function AnalyticsKpiCards({ cards }: AnalyticsKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const cfg = iconConfig[card.iconType];
        const Icon = cfg.icon;

        return (
          <div
            key={card.id}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Left Rounded Square Icon Badge */}
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${cfg.bgCls}`}
            >
              <Icon className={`h-6 w-6 ${cfg.iconCls}`} />
            </div>

            {/* Right Text Stack */}
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-dark mt-0.5 truncate">
                {card.value}
              </p>
              <p
                className={`text-[11px] font-bold mt-1 truncate ${
                  card.trendType === "up"
                    ? "text-emerald-600"
                    : card.trendType === "down"
                      ? "text-primary"
                      : "text-slate-400 font-medium"
                }`}
              >
                {card.subtext}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

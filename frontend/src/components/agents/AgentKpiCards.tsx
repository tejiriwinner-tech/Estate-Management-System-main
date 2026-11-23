"use client";

import React from "react";
import {
  Users,
  Home,
  UserPlus,
  Handshake,
  Wallet,
  Star,
} from "lucide-react";
import { AgentKpi } from "@/types/agent";

interface AgentKpiCardsProps {
  kpis: AgentKpi[];
}

const iconFor = (icon: AgentKpi["icon"]) => {
  switch (icon) {
    case "agents":
      return <Users className="h-4 w-4 text-blue-600" />;
    case "listings":
      return <Home className="h-4 w-4 text-purple-600" />;
    case "leads":
      return <UserPlus className="h-4 w-4 text-amber-600" />;
    case "deals":
      return <Handshake className="h-4 w-4 text-emerald-600" />;
    case "commission":
      return <Wallet className="h-4 w-4 text-primary" />;
    case "rating":
      return <Star className="h-4 w-4 text-accent" />;
  }
};

const subtitleClass: Record<AgentKpi["subtitleType"], string> = {
  "trend-up": "font-semibold text-emerald-600",
  "trend-down": "font-semibold text-rose-500",
  warning: "font-medium text-amber-600",
  neutral: "font-medium text-slate-400",
};

export function AgentKpiCards({ kpis }: AgentKpiCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-3.5 sm:p-4 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${kpi.badgeBg}`}
            >
              {iconFor(kpi.icon)}
            </div>
            <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase truncate">
              {kpi.title}
            </span>
          </div>

          <p className="my-2 sm:my-2.5 text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
            {kpi.value}
          </p>

          <p className={`text-xs truncate ${subtitleClass[kpi.subtitleType]}`}>
            {kpi.subtitle}
          </p>
        </div>
      ))}
    </div>
  );
}

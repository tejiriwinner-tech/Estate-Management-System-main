"use client";

import React from "react";
import { Home, UserPlus, CalendarClock, Wallet, Hourglass } from "lucide-react";
import { formatNairaShort } from "./portalUtils";

export interface PortalKpiValues {
  activeListings: number;
  newRequests: number;
  viewingsThisWeek: number;
  earnedThisMonth: number;
  pendingCommission: number;
}

export function PortalKpiCards({ values }: { values: PortalKpiValues }) {
  const cards = [
    { title: "Active Listings", value: String(values.activeListings), sub: "Available to rent", icon: Home, tone: "bg-purple-50 text-purple-600" },
    { title: "New Requests", value: String(values.newRequests), sub: "Waiting for a reply", icon: UserPlus, tone: "bg-primary-light text-primary" },
    { title: "Viewings This Week", value: String(values.viewingsThisWeek), sub: "Scheduled", icon: CalendarClock, tone: "bg-blue-50 text-blue-600" },
    { title: "Earned This Month", value: formatNairaShort(values.earnedThisMonth), sub: "Commission paid", icon: Wallet, tone: "bg-emerald-50 text-emerald-600" },
    { title: "Pending Commission", value: formatNairaShort(values.pendingCommission), sub: "From listings under offer", icon: Hourglass, tone: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-5">
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-2">
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg ${c.tone}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <span className="truncate text-[10px] font-bold uppercase tracking-wider text-slate-500">{c.title}</span>
          </div>
          <p className="my-2 text-xl font-extrabold tracking-tight text-slate-900">{c.value}</p>
          <p className="truncate text-xs font-medium text-slate-400">{c.sub}</p>
        </div>
      ))}
    </div>
  );
}

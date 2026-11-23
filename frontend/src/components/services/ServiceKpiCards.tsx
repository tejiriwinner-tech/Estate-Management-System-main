"use client";

import React from "react";
import { Wrench, CheckCircle2, PauseCircle, Wallet } from "lucide-react";
import { ServiceSummaryKpis } from "@/types/serviceManagement";

interface ServiceKpiCardsProps {
  kpis: ServiceSummaryKpis;
}

export function ServiceKpiCards({ kpis }: ServiceKpiCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* 1. Total Services */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-primary">
          <Wrench className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Services</p>
          <p className="text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            {kpis.totalServices}
          </p>
        </div>
      </div>

      {/* 2. Active Services */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Active Services</p>
          <p className="text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            {kpis.activeServices}
          </p>
        </div>
      </div>

      {/* 3. Inactive Services */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-rose-50 text-primary">
          <PauseCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">
            Inactive Services
          </p>
          <p className="text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            {String(kpis.inactiveServices).padStart(2, "0")}
          </p>
        </div>
      </div>

      {/* 4. Expected Revenue (Solid Primary Brand Card) */}
      <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-5 text-white shadow-md hover:shadow-lg transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-accent">
          <Wallet className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-xs font-medium text-white/80">Expected Revenue</p>
          <p className="text-2xl font-extrabold tracking-tight text-white mt-0.5">
            {kpis.expectedRevenue}
          </p>
        </div>
      </div>
    </div>
  );
}

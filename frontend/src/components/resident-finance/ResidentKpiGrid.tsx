"use client";

import React from "react";
import { Banknote, Wallet, History, LayoutGrid } from "lucide-react";
import { ResidentKPIs } from "@/types/residentFinance";

interface ResidentKpiGridProps {
  kpis: ResidentKPIs;
}

export function ResidentKpiGrid({ kpis }: ResidentKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
      {/* 1. Total Paid */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-dark">
          <Banknote className="h-6 w-6 text-accent" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Total Paid</p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            ₦{kpis.totalPaid.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      {/* 2. Outstanding Balance (Left Primary Crimson Accent Bar) */}
      <div className="relative overflow-hidden flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Wallet className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">
            Outstanding Balance
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-primary mt-0.5">
            ₦{kpis.outstandingBalance.toLocaleString("en-US")}
          </p>
        </div>
      </div>

      {/* 3. Last Payment */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <History className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Last Payment</p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            {kpis.lastPaymentDate}
          </p>
        </div>
      </div>

      {/* 4. Active Services */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-dark">
          <LayoutGrid className="h-6 w-6 text-dark" />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-400">Active Services</p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-dark mt-0.5">
            {kpis.activeServicesCount} Items
          </p>
        </div>
      </div>
    </div>
  );
}

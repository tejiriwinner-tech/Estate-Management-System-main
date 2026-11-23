"use client";

import React from "react";
import { CreditCard, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { PaymentSummaryMetrics } from "@/types/paymentRecord";

interface PaymentSummaryCardsProps {
  metrics: PaymentSummaryMetrics;
}

export function PaymentSummaryCards({ metrics }: PaymentSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {/* 1. Total Revenue */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CreditCard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            TOTAL REVENUE
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            ₦{metrics.totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* 2. Paid Items */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            PAID ITEMS
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            {metrics.paidItems.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 3. Pending */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <Clock className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            PENDING
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            {metrics.pendingItems.toLocaleString()}
          </p>
        </div>
      </div>

      {/* 4. Overdue */}
      <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            OVERDUE
          </p>
          <p className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 mt-0.5">
            {metrics.overdueItems.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}

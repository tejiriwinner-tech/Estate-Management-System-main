"use client";

import React from "react";
import { AlertTriangle, ListChecks, Info } from "lucide-react";
import { OutstandingBillItem } from "@/types/residentFinance";

interface OutstandingBillsCardProps {
  bills: OutstandingBillItem[];
  nextBillingNotice: string;
  onPayNow: (bill: OutstandingBillItem) => void;
}

export function OutstandingBillsCard({
  bills,
  nextBillingNotice,
  onPayNow,
}: OutstandingBillsCardProps) {
  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
      <div>
        <h3 className="text-base font-extrabold tracking-tight text-dark mb-4">
          Outstanding Bills
        </h3>

        {/* Overdue Bill Cards */}
        <div className="space-y-3">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs"
            >
              {/* Left Crimson Accent Stripe */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary" />

              <div className="pl-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-extrabold text-dark leading-snug">
                      {bill.title}
                    </h4>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      Due: {bill.dueDate}
                    </p>
                  </div>
                  <span className="text-sm font-extrabold text-primary font-mono">
                    ₦{bill.amount.toLocaleString("en-US")}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary">
                    <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                    <span>{bill.daysOverdue} Days Overdue</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onPayNow(bill)}
                    className="rounded-lg bg-primary hover:bg-primary-hover px-3.5 py-1.5 text-[11px] font-bold text-white shadow-xs transition-all cursor-pointer"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Caught-Up Empty State Illustration */}
        <div className="flex flex-col items-center justify-center text-center py-8 px-4 border-b border-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 mb-3">
            <ListChecks className="h-5 w-5" />
          </div>
          <p className="text-xs font-medium text-slate-400 max-w-[200px] leading-relaxed">
            No other pending payments found for this cycle.
          </p>
        </div>
      </div>

      {/* Bottom Automated Billing Info Box */}
      <div className="flex items-start gap-3 rounded-xl bg-accent/15 border border-accent/30 p-3.5">
        <Info className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
        <p className="text-[11px] font-medium text-dark leading-relaxed">
          {nextBillingNotice}
        </p>
      </div>
    </div>
  );
}

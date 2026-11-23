"use client";

import React from "react";
import Link from "next/link";
import { User, AlertTriangle, Send, ChevronRight } from "lucide-react";
import { OutstandingPayment, OutstandingStatus } from "@/types/outstanding";

interface OutstandingMobileViewProps {
  payments: OutstandingPayment[];
  totalOutstanding: number;
  overdueCount: number;
  onSendReminder: (id: string) => void;
}

const statusConfig: Record<
  OutstandingStatus,
  { label: string; pillCls: string; dotCls: string }
> = {
  overdue: {
    label: "Overdue",
    pillCls: "bg-red-50 text-red-600",
    dotCls: "bg-red-500",
  },
  pending: {
    label: "Pending",
    pillCls: "bg-amber-50 text-amber-700",
    dotCls: "bg-amber-500",
  },
  partial: {
    label: "Partial",
    pillCls: "bg-blue-50 text-blue-600",
    dotCls: "bg-blue-500",
  },
};

export function OutstandingMobileView({
  payments,
  totalOutstanding,
  overdueCount,
  onSendReminder,
}: OutstandingMobileViewProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Top Summary Strip */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total Outstanding
          </p>
          <p className="text-lg font-extrabold text-primary tracking-tight mt-1">
            ₦{totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Overdue
          </p>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <p className="text-lg font-extrabold text-red-600">
              {overdueCount} Residents
            </p>
          </div>
        </div>
      </div>

      {/* Outstanding Cards List */}
      <div className="space-y-3">
        {payments.map((payment) => {
          const cfg = statusConfig[payment.status];
          const balance = payment.amountDue - payment.amountPaid;

          return (
            <div
              key={payment.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-3">
                <Link
                  href={`/outstanding/resident/${payment.residentId ?? payment.id}`}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark group-hover:text-primary transition-colors leading-tight flex items-center gap-1">
                      <span>{payment.residentName}</span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {payment.propertyAddress}
                    </p>
                  </div>
                </Link>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.pillCls}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
                  {cfg.label}
                </span>
              </div>

              {/* Card Details Grid */}
              <div className="grid grid-cols-2 gap-y-2.5 text-xs mb-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Service
                  </p>
                  <p className="font-semibold text-dark mt-0.5">
                    {payment.serviceType}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Due Date
                  </p>
                  <p className="font-semibold text-dark mt-0.5">
                    {payment.dueDate}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Balance Due
                  </p>
                  <p className="font-extrabold text-primary mt-0.5 font-mono">
                    ₦{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                {payment.daysOverdue > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Days Overdue
                    </p>
                    <p className="font-bold text-red-600 mt-0.5">
                      {payment.daysOverdue} days
                    </p>
                  </div>
                )}
              </div>

              {/* Send Reminder Button */}
              <button
                type="button"
                onClick={() => onSendReminder(payment.id)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 hover:bg-primary hover:text-white text-primary py-2.5 text-xs font-bold transition-all"
              >
                <Send className="h-3.5 w-3.5" />
                Send Payment Reminder
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

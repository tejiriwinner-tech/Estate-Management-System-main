"use client";

import React from "react";
import Link from "next/link";
import { User, AlertTriangle, Clock, CreditCard, Send } from "lucide-react";
import { OutstandingPayment, OutstandingStatus } from "@/types/outstanding";

interface OutstandingPaymentsTableProps {
  payments: OutstandingPayment[];
  onSendReminder: (id: string) => void;
}

const statusConfig: Record<
  OutstandingStatus,
  { label: string; pillCls: string; dotCls: string; icon: React.ComponentType<{ className?: string }> }
> = {
  overdue: {
    label: "Overdue",
    pillCls: "bg-red-50 text-red-600",
    dotCls: "bg-red-500",
    icon: AlertTriangle,
  },
  pending: {
    label: "Pending",
    pillCls: "bg-accent/10 text-accent-dark",
    dotCls: "bg-accent",
    icon: Clock,
  },
  partial: {
    label: "Partial",
    pillCls: "bg-blue-50 text-blue-600",
    dotCls: "bg-blue-500",
    icon: CreditCard,
  },
};

export function OutstandingPaymentsTable({
  payments,
  onSendReminder,
}: OutstandingPaymentsTableProps) {
  if (payments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <AlertTriangle className="h-7 w-7 text-slate-400" />
        </div>
        <p className="text-sm font-bold text-dark">No outstanding payments</p>
        <p className="text-xs text-slate-400 mt-1">
          All residents are up to date with their payments.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full text-left min-w-[800px]">
        <thead>
          <tr className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            <th className="py-3.5 px-5 rounded-tl-2xl">RESIDENT</th>
            <th className="py-3.5 px-5">PROPERTY</th>
            <th className="py-3.5 px-5">SERVICE</th>
            <th className="py-3.5 px-5">AMOUNT DUE</th>
            <th className="py-3.5 px-5">DUE DATE</th>
            <th className="py-3.5 px-5">DAYS OVERDUE</th>
            <th className="py-3.5 px-5">STATUS</th>
            <th className="py-3.5 px-5 rounded-tr-2xl text-center">ACTION</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white text-xs">
          {payments.map((payment) => {
            const cfg = statusConfig[payment.status];
            const StatusIcon = cfg.icon;
            const balance = payment.amountDue - payment.amountPaid;

            return (
              <tr
                key={payment.id}
                className="hover:bg-slate-50/60 transition-colors group"
              >
                {/* Resident */}
                <td className="py-4 px-5">
                  <Link
                    href={`/outstanding/resident/${payment.residentId ?? payment.id}`}
                    className="flex items-center gap-3 group/link"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 group-hover/link:bg-primary group-hover/link:text-white transition-colors">
                      <User className="h-4 w-4 text-primary group-hover/link:text-white transition-colors" />
                    </div>
                    <div>
                      <p className="font-bold text-dark group-hover/link:text-primary transition-colors leading-tight">
                        {payment.residentName}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {payment.invoiceNumber}
                      </p>
                    </div>
                  </Link>
                </td>

                {/* Property */}
                <td className="py-4 px-5 text-slate-600 font-medium">
                  {payment.propertyAddress}
                </td>

                {/* Service */}
                <td className="py-4 px-5 text-slate-600 font-medium">
                  {payment.serviceType}
                </td>

                {/* Amount Due */}
                <td className="py-4 px-5">
                  <p className="font-extrabold text-dark font-mono">
                    ₦{balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                  {payment.amountPaid > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Paid: ₦{payment.amountPaid.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </td>

                {/* Due Date */}
                <td className="py-4 px-5 text-slate-500 font-medium">
                  {payment.dueDate}
                </td>

                {/* Days Overdue */}
                <td className="py-4 px-5">
                  {payment.daysOverdue > 0 ? (
                    <span className="font-bold text-red-600">
                      {payment.daysOverdue} days
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">—</span>
                  )}
                </td>

                {/* Status Pill */}
                <td className="py-4 px-5">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${cfg.pillCls}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotCls}`} />
                    {cfg.label}
                  </span>
                </td>

                {/* Action */}
                <td className="py-4 px-5 text-center">
                  <button
                    type="button"
                    onClick={() => onSendReminder(payment.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white px-3 py-1.5 text-[11px] font-bold transition-all"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Remind</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

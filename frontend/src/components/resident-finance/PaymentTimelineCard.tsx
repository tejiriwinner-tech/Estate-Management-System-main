"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Trash2,
  Droplets,
  Printer,
  ExternalLink,
} from "lucide-react";
import {
  TimelinePaymentItem,
  TimelineServiceIcon,
} from "@/types/residentFinance";

interface PaymentTimelineCardProps {
  items: TimelinePaymentItem[];
}

const iconMap: Record<
  TimelineServiceIcon,
  React.ComponentType<{ className?: string }>
> = {
  security: ShieldCheck,
  waste: Trash2,
  utility: Droplets,
};

export function PaymentTimelineCard({ items }: PaymentTimelineCardProps) {
  const router = useRouter();

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <h3 className="text-base font-extrabold tracking-tight text-dark">
          Payment Timeline
        </h3>
        <Link
          href="/payments"
          className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-primary-hover transition-colors"
        >
          <span>View All</span>
          <ExternalLink className="h-3.5 w-3.5 text-accent" />
        </Link>
      </div>

      {/* Desktop Table View (>= sm) */}
      <div className="hidden sm:block overflow-x-auto flex-1">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3 px-6">SERVICE</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-6 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {items.map((item) => {
              const Icon = iconMap[item.iconType] || ShieldCheck;
              const receiptSlug = item.invoiceNumber.replace("#", "");

              return (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {/* Service */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-dark leading-snug">
                          {item.serviceName}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400">
                          Rec: {item.invoiceNumber}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-4 font-bold text-dark font-mono">
                    ₦{item.amount.toLocaleString("en-US")}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-4 text-slate-500 font-medium max-w-[90px] leading-tight">
                    {item.date}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
                      {item.status}
                    </span>
                  </td>

                  {/* Action (Print / Receipt) */}
                  <td className="py-4 px-6 text-right">
                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/payments/receipt/${receiptSlug}`)
                      }
                      title="Print / View Official Receipt"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs hover:bg-primary-hover transition-colors cursor-pointer"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked List (< sm) */}
      <div className="block sm:hidden divide-y divide-slate-100">
        {items.map((item) => {
          const Icon = iconMap[item.iconType] || ShieldCheck;
          const receiptSlug = item.invoiceNumber.replace("#", "");

          return (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-dark truncate">
                    {item.serviceName}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Rec: {item.invoiceNumber} • {item.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs font-extrabold text-dark font-mono">
                    ₦{item.amount.toLocaleString("en-US")}
                  </p>
                  <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700 mt-0.5">
                    {item.status}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/payments/receipt/${receiptSlug}`)
                  }
                  aria-label="View receipt"
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white shadow-xs hover:bg-primary-hover"
                >
                  <Printer className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

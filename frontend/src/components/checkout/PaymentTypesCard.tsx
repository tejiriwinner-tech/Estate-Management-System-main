"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Droplets,
  Zap,
  ShieldCheck,
  FileUp,
  Banknote,
  RotateCcw,
} from "lucide-react";
import { PaymentTypeItem, PaymentTypeIcon } from "@/types/paystackCheckout";

interface PaymentTypesCardProps {
  items: PaymentTypeItem[];
  onPayClick: (item: PaymentTypeItem) => void;
  onSimulateNewCycle: () => void;
}

const iconMap: Record<
  PaymentTypeIcon,
  React.ComponentType<{ className?: string }>
> = {
  trash: Trash2,
  water: Droplets,
  electricity: Zap,
  security: ShieldCheck,
};

export function PaymentTypesCard({
  items,
  onPayClick,
  onSimulateNewCycle,
}: PaymentTypesCardProps) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      {/* Card Header matching Figma "Payment Types" */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-5 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-dark">
            Payment Types
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any estate bill below to pay instantly via Paystack or view
            official receipt.
          </p>
        </div>

        <button
          type="button"
          onClick={onSimulateNewCycle}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 text-xs font-bold text-dark transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5 text-accent" />
          <span>Simulate Unpaid Billing Cycle</span>
        </button>
      </div>

      {/* 1. Desktop Table View (>= md) matching Figma columns */}
      <div className="hidden md:block p-6">
        <div className="overflow-hidden rounded-xl border border-slate-200/80">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200/80 text-xs font-extrabold text-primary">
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-4 text-center">Amount</th>
                <th className="py-4 px-4 text-center">Payment Schedule</th>
                <th className="py-4 px-4 text-center">Paid</th>
                <th className="py-4 px-4 text-center">Balance</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 text-sm">
              {items.map((item, idx) => {
                const Icon = iconMap[item.iconType] || ShieldCheck;
                const isEven = idx % 2 === 1;

                return (
                  <tr
                    key={item.id}
                    className={`transition-colors ${
                      isEven ? "bg-slate-100/70" : "bg-white"
                    } hover:bg-primary/5`}
                  >
                    {/* Type */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/15 text-primary">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-extrabold text-dark">
                          {item.type}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 text-center font-extrabold text-dark font-mono">
                      {item.amount.toLocaleString("en-US")}
                    </td>

                    {/* Payment Schedule */}
                    <td className="py-4 px-4 text-center font-bold text-slate-600">
                      {item.schedule}
                    </td>

                    {/* Paid */}
                    <td className="py-4 px-4 text-center font-extrabold text-emerald-700 font-mono">
                      {item.paid.toLocaleString("en-US")}
                    </td>

                    {/* Balance */}
                    <td
                      className={`py-4 px-4 text-center font-extrabold font-mono ${
                        item.balance > 0 ? "text-primary" : "text-dark"
                      }`}
                    >
                      {item.balance.toFixed(2)}
                    </td>

                    {/* Action: Receipt Button + Paystack Pay Button */}
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2.5">
                        {/* Document / Receipt Button */}
                        <button
                          type="button"
                          onClick={() =>
                            router.push(`/payments/receipt/${item.receiptId}`)
                          }
                          title={`View Receipt / Proof for ${item.type}`}
                          className="flex h-9 w-11 items-center justify-center rounded-lg bg-dark hover:bg-dark-soft text-accent shadow-xs transition-all hover:scale-105 cursor-pointer"
                        >
                          <FileUp className="h-4 w-4" />
                        </button>

                        {/* Paystack Pay Button */}
                        <button
                          type="button"
                          onClick={() => onPayClick(item)}
                          title={`Pay ${item.type} with Paystack`}
                          className="flex h-9 w-11 items-center justify-center rounded-lg bg-primary hover:bg-primary-hover text-white shadow-xs shadow-primary/25 transition-all hover:scale-105 cursor-pointer"
                        >
                          <Banknote className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Mobile Responsive Card Stack (< md) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {items.map((item) => {
          const Icon = iconMap[item.iconType] || ShieldCheck;

          return (
            <div key={item.id} className="p-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-primary">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-dark">
                      {item.type}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Schedule: {item.schedule}
                    </p>
                  </div>
                </div>

                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
                    item.balance > 0
                      ? "bg-rose-50 text-primary"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {item.balance > 0 ? "Balance Due" : "Paid"}
                </span>
              </div>

              {/* 3-Column Mobile Metrics Strip */}
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Amount
                  </p>
                  <p className="font-extrabold text-dark font-mono mt-0.5">
                    ₦{item.amount.toLocaleString("en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Paid
                  </p>
                  <p className="font-extrabold text-emerald-700 font-mono mt-0.5">
                    ₦{item.paid.toLocaleString("en-US")}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Balance
                  </p>
                  <p
                    className={`font-extrabold font-mono mt-0.5 ${
                      item.balance > 0 ? "text-primary" : "text-dark"
                    }`}
                  >
                    ₦{item.balance.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Mobile Action Buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/payments/receipt/${item.receiptId}`)
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-dark py-2.5 text-xs font-bold text-white"
                >
                  <FileUp className="h-4 w-4 text-accent" />
                  <span>Receipt</span>
                </button>

                <button
                  type="button"
                  onClick={() => onPayClick(item)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-xs shadow-primary/20"
                >
                  <Banknote className="h-4 w-4" />
                  <span>Pay Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

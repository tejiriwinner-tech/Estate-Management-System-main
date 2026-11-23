"use client";

import React from "react";
import { AlertTriangle, Clock, CreditCard, TrendingDown } from "lucide-react";
import { OutstandingSummaryMetrics } from "@/types/outstanding";

interface OutstandingSummaryCardsProps {
  metrics: OutstandingSummaryMetrics;
}

export function OutstandingSummaryCards({ metrics }: OutstandingSummaryCardsProps) {
  const cards = [
    {
      label: "TOTAL OUTSTANDING",
      value: `₦${metrics.totalOutstanding.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
      valueCls: "text-primary",
    },
    {
      label: "OVERDUE",
      value: metrics.overdueCount.toString(),
      icon: AlertTriangle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueCls: "text-red-600",
    },
    {
      label: "PENDING",
      value: metrics.pendingCount.toString(),
      icon: Clock,
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
      valueCls: "text-dark",
    },
    {
      label: "PARTIAL PAYMENT",
      value: metrics.partialCount.toString(),
      icon: CreditCard,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      valueCls: "text-dark",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
              <p className={`text-xl font-extrabold tracking-tight mt-0.5 ${card.valueCls}`}>
                {card.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

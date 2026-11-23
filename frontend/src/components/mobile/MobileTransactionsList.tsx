"use client";

import React from "react";
import Link from "next/link";
import { Home, Wrench, Building2, User, Car } from "lucide-react";
import { MobileTransaction } from "@/types/mobileFinance";

interface MobileTransactionsListProps {
  transactions: MobileTransaction[];
}

export function MobileTransactionsList({ transactions }: MobileTransactionsListProps) {
  const getIcon = (icon: MobileTransaction["icon"]) => {
    switch (icon) {
      case "home":
        return <Home className="h-5 w-5 text-slate-600" />;
      case "wrench":
        return <Wrench className="h-5 w-5 text-slate-600" />;
      case "building":
        return <Building2 className="h-5 w-5 text-slate-600" />;
      case "user":
        return <User className="h-5 w-5 text-slate-600" />;
      case "car":
        return <Car className="h-5 w-5 text-slate-600" />;
    }
  };

  const getStatusBadge = (status: MobileTransaction["status"]) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            PAID
          </span>
        );
      case "PROCESSING":
        return (
          <span className="inline-flex rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            PROCESSING
          </span>
        );
      case "DEFAULT":
        return (
          <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
            DEFAULT
          </span>
        );
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
        <Link
          href="/payments"
          className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
        >
          See All
        </Link>
      </div>

      {/* Transactions Cards */}
      <div className="space-y-2.5">
        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Left: Icon + Info */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100">
                {getIcon(t.icon)}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">{t.title}</p>
                <p className="text-[10px] font-medium text-slate-400">{t.subtitle}</p>
              </div>
            </div>

            {/* Right: Amount + Status */}
            <div className="text-right">
              <p
                className={`text-xs font-extrabold ${
                  t.type === "income" ? "text-emerald-600" : "text-slate-800"
                }`}
              >
                {t.amount}
              </p>
              <div className="mt-0.5">{getStatusBadge(t.status)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

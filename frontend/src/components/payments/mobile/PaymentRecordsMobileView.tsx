"use client";

import { useFinance } from "@/lib/finance/api";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  User,
  Car,
  Home,
  AlertTriangle,
  Wrench,
} from "lucide-react";

interface MobilePaymentItem {
  id: string;
  name: string;
  purpose: string;
  amount: string;
  status: "Paid" | "Processing" | "Default";
  iconType: "user" | "car" | "house" | "alert" | "wrench";
}

export function PaymentRecordsMobileView() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: summary } = useFinance<{ metrics: { collectedToday: string; pendingActive: string }; recentPayments: MobilePaymentItem[] }>(
    "/payments/mobile-summary",
    { metrics: { collectedToday: "₦0.00", pendingActive: "0 Active" }, recentPayments: [] },
    (j) => j
  );
  const payments = summary.recentPayments;

  const filteredPayments = useMemo(() => {
    if (!searchQuery.trim()) return payments;
    const q = searchQuery.toLowerCase();
    return payments.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.purpose.toLowerCase().includes(q)
    );
  }, [payments, searchQuery]);

  const getIcon = (type: MobilePaymentItem["iconType"]) => {
    switch (type) {
      case "user":
        return <User className="h-5 w-5 text-emerald-700" />;
      case "car":
        return <Car className="h-5 w-5 text-amber-800" />;
      case "house":
        return <Home className="h-5 w-5 text-emerald-700" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-rose-600" />;
      case "wrench":
        return <Wrench className="h-5 w-5 text-emerald-700" />;
    }
  };

  const getIconBg = (type: MobilePaymentItem["iconType"]) => {
    switch (type) {
      case "user":
      case "house":
      case "wrench":
        return "bg-emerald-100/70";
      case "car":
        return "bg-amber-100/60";
      case "alert":
        return "bg-rose-100/60";
    }
  };

  const getStatusBadge = (status: MobilePaymentItem["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
            Paid
          </span>
        );
      case "Processing":
        return (
          <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
            Processing
          </span>
        );
      case "Default":
        return (
          <span className="inline-flex rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600">
            Default
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Search Bar with Filter Button */}
      <div className="flex items-center gap-2.5">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search residents..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs text-slate-700 placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <button
          type="button"
          aria-label="Filter records"
          className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-emerald-50/50 text-emerald-700 shadow-xs hover:bg-emerald-100/60 transition-colors"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* 2 Daily Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Card 1: Collected Today */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">
            Collected Today
          </p>
          <p className="text-lg font-extrabold text-emerald-600 mt-1">
            {summary.metrics.collectedToday}
          </p>
        </div>

        {/* Card 2: Pending */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold text-slate-400">
            Pending
          </p>
          <p className="text-lg font-extrabold text-amber-700 mt-1">
            {summary.metrics.pendingActive}
          </p>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Payments</h2>
          <Link
            href="/payments"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            View All
          </Link>
        </div>

        {/* Cards Stack */}
        <div className="space-y-2.5">
          {filteredPayments.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Left: Icon + Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full ${getIconBg(
                    p.iconType
                  )}`}
                >
                  {getIcon(p.iconType)}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">{p.name}</p>
                  <p className="text-[10px] font-medium text-slate-400">{p.purpose}</p>
                </div>
              </div>

              {/* Right: Amount + Status */}
              <div className="text-right">
                <p className="text-xs font-extrabold text-slate-900">
                  {p.amount}
                </p>
                <div className="mt-1">{getStatusBadge(p.status)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

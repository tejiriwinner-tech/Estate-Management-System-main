"use client";

import React from "react";
import Link from "next/link";
import {
  Shield,
  Trash2,
  Zap,
  Droplets,
  Wrench,
  Eye,
} from "lucide-react";
import { RevenueBreakdownItem } from "@/types/finance";

interface RevenueBreakdownsTableProps {
  breakdowns: RevenueBreakdownItem[];
}

export function RevenueBreakdownsTable({ breakdowns }: RevenueBreakdownsTableProps) {
  const getServiceIcon = (icon: RevenueBreakdownItem["icon"]) => {
    switch (icon) {
      case "security":
        return <Shield className="h-4 w-4 text-blue-600" />;
      case "waste":
        return <Trash2 className="h-4 w-4 text-emerald-600" />;
      case "electricity":
        return <Zap className="h-4 w-4 text-amber-500" />;
      case "water":
        return <Droplets className="h-4 w-4 text-cyan-500" />;
      case "maintenance":
        return <Wrench className="h-4 w-4 text-slate-600" />;
    }
  };

  const formatNaira = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-base font-bold text-slate-800">Revenue Breakdowns</h2>

        <div className="flex items-center gap-4 text-xs font-semibold text-primary">
          <Link href="/payments" className="hover:underline">
            View All
          </Link>
          <span className="text-slate-300">|</span>
          <Link href="/finance/reports" className="hover:underline">
            Finance Report
          </Link>
        </div>
      </div>

      {/* Responsive Table with Touch-Momentum Scrolling */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <table className="w-full min-w-[620px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="pb-3 font-semibold">SERVICE NAME</th>
              <th className="pb-3 font-semibold">TOTAL AMOUNT</th>
              <th className="pb-3 font-semibold">TOTAL PAYMENTS</th>
              <th className="pb-3 font-semibold">BALANCE DUE</th>
              <th className="pb-3 font-semibold">% COLLECTION</th>
              <th className="pb-3 text-center font-semibold">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {breakdowns.map((item) => (
              <tr
                key={item.id}
                className="group transition-colors hover:bg-slate-50/70"
              >
                {/* Service Name with Icon Badge */}
                <td className="py-4 font-medium text-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.iconBg}`}
                    >
                      {getServiceIcon(item.icon)}
                    </div>
                    <span className="font-semibold text-slate-800">
                      {item.serviceName}
                    </span>
                  </div>
                </td>

                {/* Total Amount */}
                <td className="py-4 font-bold text-slate-800">
                  {formatNaira(item.totalAmount)}
                </td>

                {/* Total Payments */}
                <td className="py-4 font-bold text-emerald-600">
                  {formatNaira(item.totalPayments)}
                </td>

                {/* Balance Due */}
                <td className="py-4 font-bold text-rose-500">
                  {formatNaira(item.balanceDue)}
                </td>

                {/* % Collection Progress Bar */}
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-500"
                        style={{ width: `${item.collectionRate}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {item.collectionRate}%
                    </span>
                  </div>
                </td>

                {/* Action View Button */}
                <td className="py-4 text-center">
                  <button
                    type="button"
                    aria-label={`View details for ${item.serviceName}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

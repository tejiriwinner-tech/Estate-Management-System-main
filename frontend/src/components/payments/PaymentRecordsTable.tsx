"use client";

import React from "react";
import { PaymentRecord } from "@/types/paymentRecord";

interface PaymentRecordsTableProps {
  records: PaymentRecord[];
  onSelectRecord?: (record: PaymentRecord) => void;
}

export function PaymentRecordsTable({
  records,
  onSelectRecord,
}: PaymentRecordsTableProps) {
  const getStatusBadge = (status: PaymentRecord["status"]) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Paid
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case "Overdue":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            Overdue
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-3.5 px-6">RECEIPT #</th>
              <th className="py-3.5 px-6">RESIDENT NAME</th>
              <th className="py-3.5 px-6">PROPERTY</th>
              <th className="py-3.5 px-6">SERVICE PAID</th>
              <th className="py-3.5 px-6">AMOUNT</th>
              <th className="py-3.5 px-6">DATE</th>
              <th className="py-3.5 px-6">METHOD</th>
              <th className="py-3.5 px-6">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {records.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                  No payment records found matching the current filters.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <tr
                  key={record.id}
                  onClick={() => onSelectRecord?.(record)}
                  className="group transition-colors hover:bg-slate-50/70 cursor-pointer"
                >
                  {/* Receipt # */}
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {record.receiptNumber}
                  </td>

                  {/* Resident Name with Avatar */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] ring-2 ring-emerald-500/10">
                        {record.residentName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {record.residentName}
                      </span>
                    </div>
                  </td>

                  {/* Property */}
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {record.property}
                  </td>

                  {/* Service Paid */}
                  <td className="py-4 px-6 font-semibold text-slate-700">
                    {record.servicePaid}
                  </td>

                  {/* Amount */}
                  <td className="py-4 px-6 font-bold text-slate-900">
                    ₦{record.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>

                  {/* Date */}
                  <td className="py-4 px-6 text-slate-500 font-medium">
                    {record.date}
                  </td>

                  {/* Method */}
                  <td className="py-4 px-6 text-slate-600 font-medium">
                    {record.method}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-6">
                    {getStatusBadge(record.status)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

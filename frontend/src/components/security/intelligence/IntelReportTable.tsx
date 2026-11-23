"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface ReportRow {
  id: string;
  name: string;
  houseNumber: string;
  date: string;
  report?: string;
}

interface Props {
  title: string;
  rows: ReportRow[];
  total: number;
  showViewButton?: boolean;
  pageSize?: number;
  onView?: (id: string) => void;
}

export default function IntelReportTable({
  title,
  rows,
  total,
  showViewButton = true,
  pageSize = 11,
  onView,
}: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / pageSize);
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-xl border border-[--color-border] overflow-hidden">
      {/* Title bar */}
      <div className="px-5 py-3.5 border-b border-[--color-border] bg-gray-50">
        <h3 className="text-sm font-semibold text-[--color-text]">{title}</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">Name</th>
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">House Number</th>
              <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">Date</th>
              {rows[0]?.report !== undefined && (
                <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">Report</th>
              )}
              {showViewButton && (
                <th className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5">View</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {visible.map((row, i) => (
              <tr key={row.id} className={cn("hover:bg-gray-50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-gray-50/40")}>
                <td className="px-5 py-2.5 text-sm text-[--color-text]">{row.name}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.houseNumber}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted] whitespace-nowrap">{row.date}</td>
                {row.report !== undefined && (
                  <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.report}</td>
                )}
                {showViewButton && (
                  <td className="px-5 py-2.5">
                    <button
                      onClick={() => onView?.(row.id)}
                      className="px-3 py-1 rounded-lg bg-[--color-primary] text-white text-xs font-semibold hover:bg-[--color-primary-dark] transition-colors"
                    >
                      view
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-[--color-border]">
        <span className="text-xs text-[--color-text-muted] font-semibold">
          {Math.min((page - 1) * pageSize + 1, total)}–{Math.min(page * pageSize, total)} of {total}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-[--color-border] text-[--color-text-muted] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-3 py-1 text-xs font-semibold text-[--color-text]">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-[--color-border] text-[--color-text-muted] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface ActivityRow {
  id: string;
  name: string;
  out: string;
  outWith: string;
  in: string;
  inWith: string;
}

interface Props {
  rows: ActivityRow[];
  total: number;
  pageSize?: number;
  onAddActivity?: () => void;
}

export default function EstateActivityTable({ rows, total, pageSize = 10, onAddActivity }: Props) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const visible = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-xl border border-[--color-border] overflow-hidden">
      {/* Title bar */}
      <div className="px-5 py-3.5 border-b border-[--color-border] bg-gray-50">
        <h3 className="text-sm font-semibold text-[--color-text]">Family Check in and Out Activity</h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--color-border] bg-[--color-bg]">
              {["Name", "Out", "Out With", "In", "In With"].map((h) => (
                <th
                  key={h}
                  className="text-left text-xs font-semibold text-[--color-text-muted] px-5 py-2.5 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[--color-border]">
            {visible.map((row, i) => (
              <tr
                key={row.id}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  i % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                )}
              >
                <td className="px-5 py-2.5 text-sm font-medium text-[--color-text]">{row.name}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.out}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.outWith}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.in}</td>
                <td className="px-5 py-2.5 text-sm text-[--color-text-muted]">{row.inWith}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-xs text-center text-[--color-text-muted]">
                  No activity records found.
                </td>
              </tr>
            )}
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
          <span className="px-3 py-1 text-xs font-semibold text-[--color-text]">
            {page} / {totalPages}
          </span>
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

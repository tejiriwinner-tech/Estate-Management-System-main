"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaymentPaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function PaymentPagination({
  currentPage,
  totalPages,
  totalRecords,
  pageSize,
  onPageChange,
}: PaymentPaginationProps) {
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 text-xs font-medium text-slate-500">
      <div>
        Showing {startRecord} to {endRecord} of {totalRecords.toLocaleString()} transactions
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Page 1 (Active) */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
            currentPage === 1
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "border border-slate-200 bg-white text-dark hover:bg-slate-50"
          }`}
        >
          1
        </button>

        {/* Page 2 */}
        <button
          type="button"
          onClick={() => onPageChange(2)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
            currentPage === 2
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "border border-slate-200 bg-white text-dark hover:bg-slate-50"
          }`}
        >
          2
        </button>

        {/* Page 3 */}
        <button
          type="button"
          onClick={() => onPageChange(3)}
          className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-all ${
            currentPage === 3
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "border border-slate-200 bg-white text-dark hover:bg-slate-50"
          }`}
        >
          3
        </button>

        <span className="px-1 text-slate-400">...</span>

        {/* Total Pages (e.g. 128) */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          className={`flex h-8 min-w-[32px] px-2 items-center justify-center rounded-lg text-xs font-bold transition-all ${
            currentPage === totalPages
              ? "bg-primary text-white shadow-sm shadow-primary/30"
              : "border border-slate-200 bg-white text-dark hover:bg-slate-50"
          }`}
        >
          {totalPages}
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

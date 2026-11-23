"use client";

import React from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import { PaymentFilterState } from "@/types/paymentRecord";

interface PaymentFilterToolbarProps {
  filters: PaymentFilterState;
  onChange: (filters: PaymentFilterState) => void;
  onClear: () => void;
}

export function PaymentFilterToolbar({
  filters,
  onChange,
  onClear,
}: PaymentFilterToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-xs">
        {/* Month Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase text-[11px]">MONTH:</span>
          <div className="relative">
            <select
              value={filters.month}
              onChange={(e) => onChange({ ...filters, month: e.target.value })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All Months">All Months</option>
              <option value="Oct">October</option>
              <option value="Sep">September</option>
              <option value="Aug">August</option>
              <option value="Jul">July</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Year Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase text-[11px]">YEAR:</span>
          <div className="relative">
            <select
              value={filters.year}
              onChange={(e) => onChange({ ...filters, year: e.target.value })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Service Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase text-[11px]">SERVICE:</span>
          <div className="relative">
            <select
              value={filters.service}
              onChange={(e) => onChange({ ...filters, service: e.target.value })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All Services">All Services</option>
              <option value="Security Fee">Security Fee</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Waste Mgmt">Waste Mgmt</option>
              <option value="Water Bill">Water Bill</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400 uppercase text-[11px]">STATUS:</span>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => onChange({ ...filters, status: e.target.value })}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
            >
              <option value="All Status">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
      >
        <RotateCcw className="h-3.5 w-3.5 text-accent" />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}

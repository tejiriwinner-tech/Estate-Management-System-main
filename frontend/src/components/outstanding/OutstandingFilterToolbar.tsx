"use client";

import React from "react";
import { OutstandingFilterState } from "@/types/outstanding";
import { X } from "lucide-react";

interface OutstandingFilterToolbarProps {
  filters: OutstandingFilterState;
  onFilterChange: (filters: OutstandingFilterState) => void;
}

const SERVICE_TYPES = [
  "All Services",
  "Security Fee",
  "Waste Management",
  "Estate Maintenance",
  "Electricity Levy",
];

const STATUS_OPTIONS = [
  "All Status",
  "overdue",
  "pending",
  "partial",
];

const SORT_OPTIONS: { label: string; value: OutstandingFilterState["sortBy"] }[] = [
  { label: "Due Date", value: "dueDate" },
  { label: "Amount", value: "amount" },
  { label: "Days Overdue", value: "daysOverdue" },
  { label: "Resident Name", value: "name" },
];

export function OutstandingFilterToolbar({
  filters,
  onFilterChange,
}: OutstandingFilterToolbarProps) {
  const hasActiveFilters =
    filters.serviceType !== "All Services" ||
    filters.status !== "All Status" ||
    filters.sortBy !== "dueDate";

  const handleClear = () => {
    onFilterChange({
      serviceType: "All Services",
      status: "All Status",
      sortBy: "dueDate",
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Service Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          SERVICE:
        </span>
        <select
          value={filters.serviceType}
          onChange={(e) =>
            onFilterChange({ ...filters, serviceType: e.target.value })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-dark shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {SERVICE_TYPES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          STATUS:
        </span>
        <select
          value={filters.status}
          onChange={(e) =>
            onFilterChange({ ...filters, status: e.target.value })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-dark shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer capitalize"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s} className="capitalize">
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          SORT:
        </span>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFilterChange({
              ...filters,
              sortBy: e.target.value as OutstandingFilterState["sortBy"],
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-dark shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Clear Filters
        </button>
      )}
    </div>
  );
}

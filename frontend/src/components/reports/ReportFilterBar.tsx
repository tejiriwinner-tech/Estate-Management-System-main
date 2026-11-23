"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import { ReportFilterState } from "@/types/reportCenter";

interface ReportFilterBarProps {
  filters: ReportFilterState;
  onChange: (filters: ReportFilterState) => void;
}

const MONTHS = [
  "Current Month",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = ["2024", "2023", "2025", "2026"];

const SERVICES = [
  "All Services",
  "Security Levy",
  "Waste Management",
  "Electricity",
  "Water Bill",
  "Utility Maintenance",
];

const AREAS = [
  "All Areas",
  "Boulevard Crescent",
  "Willow Creek",
  "Maple Street",
  "Oak Drive",
  "Pine Lane",
];

const STATUSES = ["All Status", "Paid", "Pending", "Overdue"];

export function ReportFilterBar({ filters, onChange }: ReportFilterBarProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. Month */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Month
          </label>
          <div className="relative">
            <select
              value={filters.month}
              onChange={(e) =>
                onChange({ ...filters, month: e.target.value })
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* 2. Year */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Year
          </label>
          <div className="relative">
            <select
              value={filters.year}
              onChange={(e) => onChange({ ...filters, year: e.target.value })}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* 3. Service */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Service
          </label>
          <div className="relative">
            <select
              value={filters.service}
              onChange={(e) =>
                onChange({ ...filters, service: e.target.value })
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* 4. Street / Area */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Street / Area
          </label>
          <div className="relative">
            <select
              value={filters.area}
              onChange={(e) => onChange({ ...filters, area: e.target.value })}
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {AREAS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

        {/* 5. Payment Status */}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
            Payment Status
          </label>
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) =>
                onChange({ ...filters, status: e.target.value })
              }
              className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/70 py-2.5 pl-3.5 pr-9 text-xs font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
            >
              {STATUSES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-3 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

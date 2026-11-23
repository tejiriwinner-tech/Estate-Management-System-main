"use client";

import React, { useState, useMemo } from "react";
import {
  LogIn,
  LogOut,
  Home,
  Users,
  Search,
  ListFilter,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAccessOverview } from "@/lib/admin/accessApi";
import {
  AccessGate,
  MobileAccessBadgeType,
  MobileAccessMetric,
} from "@/types/admin/access";
import { cn } from "@/lib/admin/utils";

interface CheckInOutMobileViewProps {
  /** If true, constrains width to a mobile frame when previewed on desktop */
  isStandalonePreview?: boolean;
}

function MobileMetricIcon({
  iconType,
}: {
  iconType: MobileAccessMetric["iconType"];
}) {
  switch (iconType) {
    case "checkin":
      return (
        <div className="w-11 h-11 rounded-full bg-accent-light flex items-center justify-center text-primary shrink-0">
          <LogIn className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "checkout":
      return (
        <div className="w-11 h-11 rounded-full bg-accent-light/55 flex items-center justify-center text-accent shrink-0">
          <LogOut className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "residents":
      return (
        <div className="w-11 h-11 rounded-full bg-[#E8EEF7] flex items-center justify-center text-dark shrink-0">
          <Home className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "visitors":
      return (
        <div className="w-11 h-11 rounded-full bg-primary-light flex items-center justify-center text-primary shrink-0">
          <Users className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

function CategoryBadge({ type }: { type: MobileAccessBadgeType }) {
  if (type === "Resident") {
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-accent-light text-dark">
        Resident
      </span>
    );
  }
  if (type === "Visitor") {
    return (
      <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-primary-light text-primary">
        Visitor
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold bg-[#E3ECF8] text-dark">
      Service
    </span>
  );
}

const PAGE_SIZE = 3;

export function CheckInOutMobileView({
  isStandalonePreview = false,
}: CheckInOutMobileViewProps) {
  const { data: access, error: loadError } = useAccessOverview("today");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBadge, setSelectedBadge] = useState<
    MobileAccessBadgeType | "All"
  >("All");
  const [selectedGate, setSelectedGate] = useState<AccessGate | "All">("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return access.mobileLogs.filter((item) => {
      const matchesBadge =
        selectedBadge === "All" || item.badge_type === selectedBadge;
      const matchesGate =
        selectedGate === "All" || item.gate === selectedGate;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.unit_label.toLowerCase().includes(q) ||
        item.vehicle.toLowerCase().includes(q) ||
        item.gate.toLowerCase().includes(q);
      return matchesBadge && matchesGate && matchesQuery;
    });
  }, [access.mobileLogs, searchQuery, selectedBadge, selectedGate]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Unit / Destination",
      "Category",
      "Action",
      "Time",
      "Gate",
      "Vehicle",
    ];
    const rows = filteredLogs.map((l) => [
      `"${l.name}"`,
      `"${l.unit_label}"`,
      l.badge_type,
      l.action_type,
      l.time,
      `"${l.gate}"`,
      `"${l.vehicle}"`,
    ]);
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute(
      "download",
      `LincolnEstate_Mobile_Access_Logs_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={cn(
        "space-y-4 pb-8 animate-in fade-in duration-300",
        isStandalonePreview && "max-w-[430px] mx-auto"
      )}
    >
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight">
          Dashboard
        </h1>
        <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
          Overview of daily check-ins and check-outs.
        </p>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{loadError}</div>
      )}

      {/* ================= 4 STACKED HORIZONTAL METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {access.metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-surface-card rounded-2xl border border-border/80 px-5 py-4 shadow-2xs flex items-center justify-between gap-4"
          >
            <div>
              <div className="text-xs font-semibold text-accent">
                {metric.label}
              </div>
              <div className="text-2xl font-extrabold text-dark tracking-tight mt-1">
                {metric.value}
              </div>
            </div>

            <MobileMetricIcon iconType={metric.iconType} />
          </div>
        ))}
      </div>

      {/* ================= SEARCH BAR & 50/50 FILTER + EXPORT BUTTONS ================= */}
      <div className="space-y-3 pt-1 relative">
        {/* Full-Width Rounded Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-primary absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.3]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search logs..."
            aria-label="Search logs"
            className="w-full rounded-full bg-[#EFF4F3] hover:bg-[#E7EEEC] focus:bg-white pl-10 pr-4 py-2.5 text-sm text-dark placeholder:text-primary/80 font-medium border border-transparent focus:border-primary/40 focus:outline-none transition-all"
          />
        </div>

        {/* 50 / 50 Filter & Export Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark shadow-2xs transition-colors"
          >
            <ListFilter className="w-4 h-4 text-dark stroke-[2.2]" />
            <span>
              {selectedBadge === "All" && selectedGate === "All"
                ? "Filter"
                : "Filtered"}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4 stroke-[2.2]" />
            <span>Export</span>
          </button>
        </div>

        {/* Filter Popover */}
        {isFilterOpen && (
          <div className="bg-surface-card rounded-2xl border border-border shadow-lg p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  Category
                </label>
                <select
                  value={selectedBadge}
                  onChange={(e) => {
                    setSelectedBadge(
                      e.target.value as MobileAccessBadgeType | "All"
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#F4F6F9] px-2.5 py-2 text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="All">All Types</option>
                  <option value="Resident">Resident</option>
                  <option value="Visitor">Visitor</option>
                  <option value="Service">Service</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                  Gate
                </label>
                <select
                  value={selectedGate}
                  onChange={(e) => {
                    setSelectedGate(e.target.value as AccessGate | "All");
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-border bg-[#F4F6F9] px-2.5 py-2 text-xs font-bold text-dark focus:outline-none"
                >
                  <option value="All">All Gates</option>
                  <option value="Main Gate">Main Gate</option>
                  <option value="East Gate">East Gate</option>
                  <option value="Service Gate">Service Gate</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedBadge("All");
                  setSelectedGate("All");
                  setIsFilterOpen(false);
                }}
                className="text-xs font-bold text-primary hover:underline"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsFilterOpen(false)}
                className="px-3 py-1 rounded-lg bg-dark text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MOBILE ACCESS LOG CARDS ================= */}
      <div className="space-y-3.5 pt-1">
        {paginatedLogs.length === 0 ? (
          <div className="bg-surface-card rounded-2xl border border-border/80 p-8 text-center text-xs sm:text-sm text-muted font-medium">
            No access logs match your search or filter.
          </div>
        ) : (
          paginatedLogs.map((log) => {
            const isCheckIn = log.action_type === "Check-in";
            return (
              <div
                key={log.id}
                className="bg-surface-card rounded-2xl border border-border/80 p-4 shadow-2xs space-y-3.5"
              >
                {/* Top Row: Initials Circle + Name & Unit + Category Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-[#E8F1F5] text-primary font-extrabold text-xs flex items-center justify-center shrink-0">
                      {log.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-dark text-base leading-snug truncate">
                        {log.name}
                      </div>
                      <div className="text-xs font-semibold text-accent leading-tight mt-0.5 truncate">
                        {log.unit_label}
                      </div>
                    </div>
                  </div>

                  <CategoryBadge type={log.badge_type} />
                </div>

                {/* Divider */}
                <div className="border-t border-border/60" />

                {/* 2x2 Metadata Grid: Action, Time, Gate, Vehicle */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
                  {/* Action */}
                  <div>
                    <div className="text-[11px] font-semibold text-accent">
                      Action
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-dark mt-0.5">
                      {isCheckIn ? (
                        <LogIn className="w-3.5 h-3.5 text-primary stroke-[2.3]" />
                      ) : (
                        <LogOut className="w-3.5 h-3.5 text-accent stroke-[2.3]" />
                      )}
                      <span>{log.action_type}</span>
                    </div>
                  </div>

                  {/* Time */}
                  <div>
                    <div className="text-[11px] font-semibold text-accent">
                      Time
                    </div>
                    <div className="font-semibold text-dark mt-0.5">
                      {log.time}
                    </div>
                  </div>

                  {/* Gate */}
                  <div>
                    <div className="text-[11px] font-semibold text-accent">
                      Gate
                    </div>
                    <div className="font-semibold text-dark mt-0.5">
                      {log.gate}
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div>
                    <div className="text-[11px] font-semibold text-accent">
                      Vehicle
                    </div>
                    <div className="font-semibold text-dark mt-0.5">
                      {log.vehicle}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ================= CENTERED PAGINATION (< Page 1 of 12 >) ================= */}
      <div className="pt-3 pb-2 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage <= 1}
          aria-label="Previous page"
          className="w-9 h-9 rounded-full border border-border bg-surface-card hover:bg-surface-subtle disabled:opacity-40 flex items-center justify-center text-primary transition-colors shadow-2xs"
        >
          <ChevronLeft className="w-4 h-4 stroke-[2.3]" />
        </button>

        <span className="text-xs sm:text-sm font-semibold text-dark">
          Page {currentPage} of {totalPages}
        </span>

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage >= totalPages}
          aria-label="Next page"
          className="w-9 h-9 rounded-full border border-border bg-surface-card hover:bg-surface-subtle disabled:opacity-40 flex items-center justify-center text-primary transition-colors shadow-2xs"
        >
          <ChevronRight className="w-4 h-4 stroke-[2.3]" />
        </button>
      </div>

      {/* ================= CORPORATE FOOTER ================= */}
      <footer className="pt-5 border-t border-border/60 text-center text-[11px] text-muted space-y-0.5">
        <p>© 2024 LincolnEstate Corporate. All rights reserved.</p>
        <p>Built for secure property management.</p>
      </footer>
    </div>
  );
}

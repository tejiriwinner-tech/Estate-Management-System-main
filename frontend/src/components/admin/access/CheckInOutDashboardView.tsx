"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  ListFilter,
  Download,
  LogIn,
  LogOut,
  Users,
  IdCard,
  ChevronRight,
} from "lucide-react";
import { useAccessOverview } from "@/lib/admin/accessApi";
import { AccessGate, AccessMetricIconType, AccessStatus } from "@/types/admin/access";
import { AccessLogCard } from "./AccessLogCard";
import { SecuritySummaryCard } from "./SecuritySummaryCard";
import { CheckInOutMobileView } from "./CheckInOutMobileView";

function MetricIcon({
  iconType,
  isWatermark = false,
}: {
  iconType: AccessMetricIconType;
  isWatermark?: boolean;
}) {
  const cls = isWatermark ? "w-24 h-24 stroke-[1.3]" : "w-5 h-5 stroke-[2.2]";
  switch (iconType) {
    case "checkin":
      return <LogIn className={cls} />;
    case "checkout":
      return <LogOut className={cls} />;
    case "residents":
      return <Users className={cls} />;
    case "visitors":
      return <IdCard className={cls} />;
  }
}

export function CheckInOutDashboardView() {
  const [dateRange, setDateRange] = useState<"Today" | "Yesterday" | "This Week">(
    "Today"
  );
  const rangeKey = dateRange === "Today" ? "today" : dateRange === "Yesterday" ? "yesterday" : "week";
  const { data: access, error: loadError } = useAccessOverview(rangeKey);
  const [selectedGate, setSelectedGate] = useState<AccessGate | "All">("All");
  const [selectedStatus, setSelectedStatus] = useState<AccessStatus | "All">(
    "All"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return access.logs.filter((log) => {
      const matchesGate = selectedGate === "All" || log.gate === selectedGate;
      const matchesStatus =
        selectedStatus === "All" || log.status === selectedStatus;
      const matchesQuery =
        !q ||
        log.name.toLowerCase().includes(q) ||
        log.house_no.toLowerCase().includes(q) ||
        log.person_type.toLowerCase().includes(q) ||
        log.gate.toLowerCase().includes(q);
      return matchesGate && matchesStatus && matchesQuery;
    });
  }, [access.logs, selectedGate, selectedStatus, searchQuery]);

  const handleCycleDate = () => {
    setDateRange((prev) =>
      prev === "Today"
        ? "Yesterday"
        : prev === "Yesterday"
          ? "This Week"
          : "Today"
    );
  };

  const handleExportCSV = () => {
    const headers = [
      "Name",
      "Type",
      "House No.",
      "Check-In",
      "Check-Out",
      "Gate",
      "Status",
    ];
    const rows = filteredLogs.map((l) => [
      `"${l.name}"`,
      `"${l.person_type}"`,
      `"${l.house_no}"`,
      l.check_in,
      l.check_out,
      `"${l.gate}"`,
      l.status === "in_estate" ? "IN ESTATE" : "CHECKED OUT",
    ]);
    const csv =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csv));
    link.setAttribute(
      "download",
      `LincolnEstate_Access_Log_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* ================= AUTOMATIC MOBILE LAYOUT (< md) — TASK 12 ================= */}
      <div className="md:hidden">
        <CheckInOutMobileView />
      </div>

      {/* ================= DESKTOP & TABLET LAYOUT (md+) — TASK 11 ================= */}
      <div className="hidden md:block space-y-6 animate-in fade-in duration-300 pb-10">
        {/* ================= BREADCRUMB & HEADER ROW ================= */}
      <div className="space-y-2">
        {/* Breadcrumb: Dashboard > Check-In / Check-Out */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold"
        >
          <Link
            href="/admin/dashboard"
            className="text-muted hover:text-dark transition-colors"
          >
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted" />
          <span className="text-primary font-bold">Check-In / Check-Out</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
              Check-In / Check-Out
            </h1>
            <p className="text-xs sm:text-sm text-muted font-medium mt-0.5">
              Monitor estate access.
            </p>
          </div>

          {/* Right Controls: Today + Filter + Export */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 relative">
            <button
              type="button"
              onClick={handleCycleDate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card border border-border/80 hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark shadow-2xs transition-all"
            >
              <Calendar className="w-4 h-4 text-dark/80" />
              <span>{dateRange}</span>
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-card border border-border/80 hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark shadow-2xs transition-all"
              >
                <ListFilter className="w-4 h-4 text-dark/80" />
                <span>
                  {selectedGate === "All" && selectedStatus === "All"
                    ? "Filter"
                    : "Filtered"}
                </span>
              </button>

              {isFilterOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsFilterOpen(false)}
                  />
                  <div className="absolute right-0 top-12 z-20 w-56 bg-surface-card rounded-2xl border border-border shadow-xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        Gate
                      </label>
                      <select
                        value={selectedGate}
                        onChange={(e) =>
                          setSelectedGate(e.target.value as AccessGate | "All")
                        }
                        className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3 py-2 text-xs font-bold text-dark focus:outline-none"
                      >
                        <option value="All">All Gates</option>
                        <option value="Main Gate">Main Gate</option>
                        <option value="Service Gate">Service Gate</option>
                        <option value="East Gate">East Gate</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) =>
                          setSelectedStatus(
                            e.target.value as AccessStatus | "All"
                          )
                        }
                        className="w-full rounded-xl border border-border bg-[#F4F6F9] px-3 py-2 text-xs font-bold text-dark focus:outline-none"
                      >
                        <option value="All">All Statuses</option>
                        <option value="in_estate">In Estate</option>
                        <option value="checked_out">Checked Out</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGate("All");
                        setSelectedStatus("All");
                        setIsFilterOpen(false);
                      }}
                      className="w-full py-1.5 text-xs font-bold text-primary hover:underline text-center"
                    >
                      Reset Filters
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
            >
              <Download className="w-4 h-4 stroke-[2.2]" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</div>
      )}

      {/* ================= 4 WATERMARK KPI METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {access.metrics.map((metric) => {
          const badgeStyle =
            metric.iconType === "residents"
              ? "bg-primary-light text-primary"
              : metric.iconType === "visitors"
                ? "bg-[#EFF1F5] text-dark"
                : "bg-accent-light text-accent";

          return (
            <div
              key={metric.id}
              className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/70 shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[155px]"
            >
              {/* Top-left Circular Icon Badge */}
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center ${badgeStyle} relative z-10`}
              >
                <MetricIcon iconType={metric.iconType} />
              </div>

              {/* Label & Value */}
              <div className="mt-6 relative z-10">
                <div className="text-[11px] font-extrabold uppercase tracking-wider text-muted">
                  {metric.label}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mt-1">
                  {metric.value}
                </div>
              </div>

              {/* Oversized Faint Watermark Icon at Bottom-Right */}
              <div className="absolute -bottom-3 -right-2 text-dark/[0.04] pointer-events-none">
                <MetricIcon iconType={metric.iconType} isWatermark />
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= LOWER 12-COLUMN SPLIT GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Columns: Access Log */}
        <div className="lg:col-span-8">
          <AccessLogCard
            logs={filteredLogs}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>

        {/* Right 4 Columns: Today's Security Summary */}
        <div className="lg:col-span-4">
          <SecuritySummaryCard summary={access.summary} />
        </div>
      </div>
      </div>
    </>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  Plus,
  PlaneTakeoff,
  PlaneLanding,
  ShieldAlert,
} from "lucide-react";
import { useAway } from "@/lib/admin/awayApi";
import { AwayMetricCard, AwayResidentRecord, AwaySavePayload } from "@/types/admin/away";
import { LogAwayStatusFormCard } from "./LogAwayStatusFormCard";
import { CurrentAwayResidentsCard } from "./CurrentAwayResidentsCard";
import { UpcomingReturnsCard } from "./UpcomingReturnsCard";
import { AwayNotificationMobileView } from "./AwayNotificationMobileView";

function AwayMetricIcon({
  iconType,
}: {
  iconType: AwayMetricCard["iconType"];
}) {
  switch (iconType) {
    case "away":
      return (
        <div className="w-12 h-12 rounded-full bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
          <PlaneTakeoff className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "returns":
      return (
        <div className="w-12 h-12 rounded-full bg-accent-light/65 text-accent flex items-center justify-center shrink-0">
          <PlaneLanding className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
    case "alerts":
      return (
        <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
          <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
        </div>
      );
  }
}

export function AwayNotificationView() {
  const { data: away, error: loadError, save } = useAway();
  const metrics = away.metrics;
  const residents = away.residents;
  const [editingRecord, setEditingRecord] =
    useState<AwayResidentRecord | null>(null);

  const handleScrollToForm = () => {
    setEditingRecord(null);
    const el = document.getElementById("log-away-form-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleEditResident = (record: AwayResidentRecord) => {
    setEditingRecord(record);
    const el = document.getElementById("log-away-form-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleSaveRecord = (payload: AwaySavePayload, editId?: number) => save(payload, editId);

  return (
    <div className="animate-in fade-in duration-300">
      {/* ================= AUTOMATIC MOBILE LAYOUT (< 768px) ================= */}
      <div className="md:hidden">
        <AwayNotificationMobileView />
      </div>

      {/* ================= AUTOMATIC DESKTOP / TABLET LAYOUT (>= 768px) ================= */}
      <div className="hidden md:block space-y-6 pb-6">
        {loadError && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</div>
        )}
        {/* ================= BREADCRUMB & HEADER ROW ================= */}
        <div className="space-y-1.5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Link
              href="/admin/dashboard"
              className="text-primary hover:underline transition-colors"
            >
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted" />
            <span className="text-primary font-extrabold">
              Away Notification
            </span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                Away Notification
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-primary mt-0.5">
                Residents notify management when away.
              </p>
            </div>

            <button
              type="button"
              onClick={handleScrollToForm}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all w-fit"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Log New Away Status</span>
            </button>
          </div>
        </div>

        {/* ================= 3 HORIZONTAL KPI METRIC CARDS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {metrics.map((m) => (
            <div
              key={m.id}
              className="bg-surface-card rounded-2xl border border-border/70 px-5 py-5 shadow-xs flex items-center gap-4 relative overflow-hidden"
            >
              {m.id === "expected-returns" && (
                <div className="w-28 h-28 rounded-full bg-accent-light/35 absolute -top-8 -right-8 pointer-events-none" />
              )}

              <AwayMetricIcon iconType={m.iconType} />

              <div className="relative z-10">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-muted leading-tight max-w-[140px]">
                  {m.label}
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight mt-1">
                  {m.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= LOWER 12-COLUMN SPLIT GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left 8 Columns: Log Away Status Form + Current Away Residents Table */}
          <div className="lg:col-span-8 space-y-6">
            <LogAwayStatusFormCard
              editingRecord={editingRecord}
              onCancelEdit={() => setEditingRecord(null)}
              options={away.options}
              onSaveRecord={handleSaveRecord}
            />

            <CurrentAwayResidentsCard
              residents={residents}
              onEditResident={handleEditResident}
            />
          </div>

          {/* Right 4 Columns: Upcoming Returns Card */}
          <div className="lg:col-span-4">
            <UpcomingReturnsCard items={away.upcoming} />
          </div>
        </div>

        {/* ================= CORPORATE FOOTER ================= */}
        <footer className="pt-6 border-t border-border/70 text-center text-xs text-muted font-medium">
          © 2024 LincolnEstate Corporate. All rights reserved. Built for secure
          property management.
        </footer>
      </div>
    </div>
  );
}

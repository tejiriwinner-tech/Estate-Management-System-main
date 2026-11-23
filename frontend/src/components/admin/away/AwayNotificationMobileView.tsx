"use client";

import React, { useRef, useState } from "react";
import {
  Plus,
  PlaneTakeoff,
  Calendar,
  Pencil,
  CheckCircle2,
  X,
} from "lucide-react";
import { useAway } from "@/lib/admin/awayApi";
import {
  MobileAwayMetric,
  MobileActiveAwayLogItem,
  MobileAwayLogStatus,
} from "@/types/admin/away";

export function AwayNotificationMobileView() {
  const { data: away, error: loadError, save } = useAway();
  const metrics = away.mobileMetrics;
  const logs = away.mobileLogs;
  const [showAllLogs, setShowAllLogs] = useState(false);

  // Quick Log form state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [residentName, setResidentName] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<MobileAwayLogStatus>("AWAY");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const quickLogRef = useRef<HTMLDivElement | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const visibleLogs = showAllLogs ? logs : logs.slice(0, 3);

  const resetForm = () => {
    setEditingId(null);
    setResidentName("");
    setUnitNumber("");
    setFromDate("");
    setToDate("");
    setNotes("");
    setStatus("AWAY");
  };

  const handleTapLogNewButton = () => {
    resetForm();
    quickLogRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 250);
  };

  const handleEditLog = (item: MobileActiveAwayLogItem) => {
    setEditingId(item.id);
    setResidentName(item.resident_name);
    setUnitNumber(item.unit.replace(/^Unit\s+/i, ""));
    setFromDate(item.from_date ?? "");
    setToDate(item.to_date ?? "");
    setNotes(item.footer_note);
    setStatus(item.status);
    quickLogRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    setTimeout(() => {
      nameInputRef.current?.focus();
    }, 250);
  };

  const handleSubmitQuickLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = residentName.trim();
    const unit = unitNumber.trim().replace(/^unit\s+/i, "");
    if (!cleanName || !unit || !fromDate || !toDate) {
      setToastMessage("Enter the resident, unit and both dates.");
      return;
    }
    try {
      await save(
        {
          resident_name: cleanName,
          unit: `Unit ${unit}`,
          departure_date: fromDate,
          expected_return_date: toDate,
          notes: notes.trim() || undefined,
        },
        editingId ?? undefined
      );
      setToastMessage(editingId !== null ? `Updated away log for ${cleanName}.` : `Logged away status for ${cleanName}.`);
      resetForm();
    } catch (err) {
      setToastMessage(err instanceof Error ? err.message : "Could not save the away log.");
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-300 pb-8">
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{loadError}</div>
      )}
      {/* ================= PAGE HEADER & PRIMARY CTA ================= */}
      <div className="space-y-4">
        <div>
          <h1 className="text-xl font-extrabold text-dark tracking-tight">
            Away Notification
          </h1>
          <p className="text-xs font-semibold text-primary mt-1 leading-relaxed">
            Log and monitor residents currently away from the estate.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTapLogNewButton}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Log New Away Status</span>
        </button>
      </div>

      {/* ================= 2 STACKED KPI CARDS ================= */}
      <div className="space-y-3">
        {metrics.map((metric) => {
          const isCurrentlyAway = metric.iconType === "currently_away";
          return (
            <div
              key={metric.id}
              className="bg-surface-card rounded-2xl border border-border/80 px-5 py-4 shadow-xs flex items-center justify-between"
            >
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
                  {metric.label}
                </div>
                <div
                  className={`text-2xl font-extrabold tracking-tight mt-1 ${
                    isCurrentlyAway ? "text-primary" : "text-dark"
                  }`}
                >
                  {metric.value}
                </div>
              </div>

              <div className="shrink-0 flex items-center justify-center">
                {isCurrentlyAway ? (
                  <PlaneTakeoff className="w-6 h-6 text-primary stroke-[2.2]" />
                ) : (
                  <Calendar className="w-6 h-6 text-accent stroke-[2.1]" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= QUICK LOG FORM CARD ================= */}
      <div
        ref={quickLogRef}
        id="mobile-quick-log-card"
        className="bg-surface-card rounded-2xl border border-border/80 p-5 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-base font-extrabold text-dark tracking-tight">
            {editingId !== null ? "Edit Away Log" : "Quick Log"}
          </h2>

          {editingId !== null && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-1 text-[11px] font-extrabold text-primary hover:underline"
            >
              <X className="w-3.5 h-3.5" />
              Cancel Edit
            </button>
          )}
        </div>

        {toastMessage && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-accent-light/55 border border-accent/40 text-dark text-xs font-bold">
            <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmitQuickLog} className="space-y-3.5">
          {/* Resident Name */}
          <div className="space-y-1.5">
            <label
              htmlFor="mobile-away-resident-name"
              className="block text-[11px] font-extrabold text-primary"
            >
              Resident Name
            </label>
            <input
              ref={nameInputRef}
              id="mobile-away-resident-name"
              type="text"
              value={residentName}
              onChange={(e) => setResidentName(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/90 bg-[#F4F6FA] text-xs font-semibold text-dark placeholder:text-muted/75 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* Unit Number */}
          <div className="space-y-1.5">
            <label
              htmlFor="mobile-away-unit-number"
              className="block text-[11px] font-extrabold text-primary"
            >
              Unit Number
            </label>
            <input
              id="mobile-away-unit-number"
              type="text"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              placeholder="e.g. B-14"
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/90 bg-[#F4F6FA] text-xs font-semibold text-dark placeholder:text-muted/75 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          {/* From Date & To Date (2 Columns) */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label
                htmlFor="mobile-away-from-date"
                className="block text-[11px] font-extrabold text-primary"
              >
                From Date
              </label>
              <input
                id="mobile-away-from-date"
                type="text"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                onFocus={(e) => (e.currentTarget.type = "date")}
                onBlur={(e) => {
                  if (!e.currentTarget.value) e.currentTarget.type = "text";
                }}
                placeholder="mm/dd/yyyy"
                className="w-full px-3 py-2.5 rounded-xl border border-border/90 bg-[#F4F6FA] text-xs font-semibold text-dark placeholder:text-dark/75 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="mobile-away-to-date"
                className="block text-[11px] font-extrabold text-primary"
              >
                To Date
              </label>
              <input
                id="mobile-away-to-date"
                type="text"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                onFocus={(e) => (e.currentTarget.type = "date")}
                onBlur={(e) => {
                  if (!e.currentTarget.value) e.currentTarget.type = "text";
                }}
                placeholder="mm/dd/yyyy"
                className="w-full px-3 py-2.5 rounded-xl border border-border/90 bg-[#F4F6FA] text-xs font-semibold text-dark placeholder:text-dark/75 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          {/* Emergency Contact / Notes */}
          <div className="space-y-1.5">
            <label
              htmlFor="mobile-away-notes"
              className="block text-[11px] font-extrabold text-primary"
            >
              Emergency Contact / Notes
            </label>
            <textarea
              id="mobile-away-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add emergency contact or instructions..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-border/90 bg-[#F4F6FA] text-xs font-semibold text-dark placeholder:text-muted/60 focus:outline-none focus:border-primary transition-colors resize-none"
            />
          </div>

          {/* Submit Log Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-[#E3E8F2] hover:bg-primary hover:text-white text-primary text-xs font-extrabold transition-colors shadow-2xs"
          >
            {editingId !== null ? "Update Log" : "Submit Log"}
          </button>
        </form>
      </div>

      {/* ================= ACTIVE AWAY LOGS SECTION ================= */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-dark tracking-tight">
            Active Away Logs
          </h2>
          <button
            type="button"
            onClick={() => setShowAllLogs((prev) => !prev)}
            className="text-xs font-extrabold text-primary hover:underline transition-colors"
          >
            {showAllLogs ? "Show Less" : "View All"}
          </button>
        </div>

        <div className="space-y-3">
          {visibleLogs.map((log) => {
            const isReturningSoon = log.status === "RETURNING SOON";
            return (
              <div
                key={log.id}
                className="bg-surface-card rounded-2xl border border-border/80 p-4 shadow-xs space-y-3"
              >
                {/* Top Row: Name + Unit & Status Pill */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-extrabold text-dark leading-snug">
                      {log.resident_name}
                    </div>
                    <div className="text-xs font-semibold text-primary mt-0.5">
                      {log.unit}
                    </div>
                  </div>

                  {isReturningSoon ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary-light text-primary text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      RETURNING SOON
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-accent-light/75 text-dark text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      AWAY
                    </span>
                  )}
                </div>

                {/* Date Range Row */}
                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{log.date_range}</span>
                </div>

                {/* Divider */}
                <div className="border-t border-border/70 pt-2.5 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-primary truncate">
                    {log.footer_note}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleEditLog(log)}
                    title={`Edit ${log.resident_name}`}
                    className="p-1 rounded-lg text-primary hover:text-dark hover:bg-surface transition-colors shrink-0"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

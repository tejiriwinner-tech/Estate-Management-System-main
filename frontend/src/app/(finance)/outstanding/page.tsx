"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Download, Bell, AlertTriangle, User } from "lucide-react";
import { OutstandingSummaryCards } from "@/components/outstanding/OutstandingSummaryCards";
import { OutstandingFilterToolbar } from "@/components/outstanding/OutstandingFilterToolbar";
import { OutstandingPaymentsTable } from "@/components/outstanding/OutstandingPaymentsTable";
import { OutstandingMobileView } from "@/components/outstanding/OutstandingMobileView";
import { ErrorBanner, financeFetch, useFinance } from "@/lib/finance/api";
import type { OutstandingPayment, OutstandingSummaryMetrics } from "@/types/outstanding";
import { OutstandingFilterState } from "@/types/outstanding";

export default function OutstandingPaymentsPage() {
  const [filters, setFilters] = useState<OutstandingFilterState>({
    serviceType: "All Services",
    status: "All Status",
    sortBy: "dueDate",
  });

  const [reminderSent, setReminderSent] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const { data: outstanding, error: loadError, reload } = useFinance<
    { data: OutstandingPayment[]; summary: OutstandingSummaryMetrics }
  >(
    "/payments/outstanding?per_page=100",
    { data: [], summary: { totalOutstanding: 0, overdueCount: 0, pendingCount: 0, partialCount: 0 } },
    (j) => j
  );
  const outstandingRows = outstanding.data;
  const outstandingSummary = outstanding.summary;

  const filteredPayments = useMemo(() => {
    let result = [...outstandingRows];

    // Filter by service type
    if (filters.serviceType !== "All Services") {
      result = result.filter((p) => p.serviceType === filters.serviceType);
    }

    // Filter by status
    if (filters.status !== "All Status") {
      result = result.filter((p) => p.status === filters.status);
    }

    // Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case "amount":
          return b.amountDue - b.amountPaid - (a.amountDue - a.amountPaid);
        case "daysOverdue":
          return b.daysOverdue - a.daysOverdue;
        case "name":
          return a.residentName.localeCompare(b.residentName);
        case "dueDate":
        default:
          return 0; // mock data already in date order
      }
    });

    return result;
  }, [filters, outstandingRows]);

  const handleSendReminder = async (id: string) => {
    try {
      await financeFetch(`/payments/outstanding/${id}/remind`, { method: "POST" });
      setActionError(null);
      setReminderSent(id);
      setTimeout(() => setReminderSent(null), 3000);
      void reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not send the reminder.");
    }
  };

  const handleSendBulkReminders = async () => {
    try {
      await financeFetch("/payments/outstanding/remind-all", { method: "POST", body: JSON.stringify({}) });
      setActionError(null);
      setReminderSent("bulk");
      setTimeout(() => setReminderSent(null), 3000);
      void reload();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not send the reminders.");
    }
  };

  return (
    <>
      <ErrorBanner message={loadError ?? actionError} />
      {/* ─── MOBILE VIEW (<768px) ─── */}
      <div className="block md:hidden space-y-5">
        {/* Mobile Page Header */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <h1 className="text-lg font-extrabold text-dark">
              Outstanding Payments
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Overdue &amp; pending resident payments
            </p>
          </div>
          <button
            type="button"
            onClick={handleSendBulkReminders}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/25"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>

        {/* Reminder Toast (Mobile) */}
        {reminderSent && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-700">
            ✓ {reminderSent === "bulk" ? "Bulk reminders sent!" : "Reminder sent successfully!"}
          </div>
        )}

        {/* Mobile Card List */}
        <OutstandingMobileView
          payments={filteredPayments}
          totalOutstanding={outstandingSummary.totalOutstanding}
          overdueCount={outstandingSummary.overdueCount}
          onSendReminder={handleSendReminder}
        />
      </div>

      {/* ─── DESKTOP VIEW (>=768px) ─── */}
      <div className="hidden md:block space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-dark">
              Outstanding Payments
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Track and manage overdue and pending resident payments.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/outstanding/resident"
              className="inline-flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white shadow-xs transition-colors"
            >
              <User className="h-4 w-4" />
              Resident Finance Summary
            </Link>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-dark hover:bg-slate-50 shadow-xs transition-colors"
            >
              <Download className="h-4 w-4 text-accent" />
              Export CSV
            </button>
            <button
              type="button"
              onClick={handleSendBulkReminders}
              className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all"
            >
              <Bell className="h-4 w-4" />
              Send All Reminders
            </button>
          </div>
        </div>

        {/* Reminder Toast (Desktop) */}
        {reminderSent && (
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-3 text-sm font-bold text-emerald-700 flex items-center gap-2">
            <span className="h-5 w-5 flex items-center justify-center rounded-full bg-emerald-500 text-white text-xs">✓</span>
            {reminderSent === "bulk"
              ? "Bulk payment reminders sent to all outstanding residents!"
              : "Payment reminder sent successfully to resident!"}
          </div>
        )}

        {/* Summary Cards */}
        <OutstandingSummaryCards metrics={outstandingSummary} />

        {/* Filter Toolbar */}
        <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm">
          <OutstandingFilterToolbar
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          {/* Table Header Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-dark">
                {filteredPayments.length} Outstanding{" "}
                {filteredPayments.length === 1 ? "Record" : "Records"}
              </span>
            </div>
          </div>
          <OutstandingPaymentsTable
            payments={filteredPayments}
            onSendReminder={handleSendReminder}
          />
        </div>

        {/* Footer */}
        <footer className="text-center py-4">
          <p className="text-xs text-slate-400">
            © 2024 LincolnEstate Finance Management. All rights reserved. System
            V2.4.1
          </p>
        </footer>
      </div>
    </>
  );
}

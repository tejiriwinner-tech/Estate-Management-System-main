"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download, Briefcase, Search } from "lucide-react";
import { PaymentSummaryCards } from "@/components/payments/PaymentSummaryCards";
import { PaymentFilterToolbar } from "@/components/payments/PaymentFilterToolbar";
import { PaymentRecordsTable } from "@/components/payments/PaymentRecordsTable";
import { PaymentPagination } from "@/components/payments/PaymentPagination";
import { PaymentRecordsMobileView } from "@/components/payments/mobile/PaymentRecordsMobileView";
import { PaymentMobileBottomNav } from "@/components/payments/mobile/PaymentMobileBottomNav";
import { ErrorBanner, useFinance } from "@/lib/finance/api";
import type { PaymentRecord, PaymentSummaryMetrics } from "@/types/paymentRecord";
import { PaymentFilterState } from "@/types/paymentRecord";

export default function PaymentRecordsPage() {
  const router = useRouter();
  const { data: recordsRes, error } = useFinance<{ summary: PaymentSummaryMetrics; data: PaymentRecord[] }>(
    "/payments/records?per_page=100",
    { summary: { totalRevenue: 0, paidItems: 0, pendingItems: 0, overdueItems: 0 }, data: [] },
    (j) => j
  );
  const records = recordsRes.data;
  const metrics = recordsRes.summary;
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const [filters, setFilters] = useState<PaymentFilterState>({
    month: "All Months",
    year: "2024",
    service: "All Services",
    status: "All Status",
    search: "",
  });

  // Dynamic filter logic
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      // Status filter
      if (filters.status !== "All Status" && r.status !== filters.status) {
        return false;
      }
      // Service filter
      if (filters.service !== "All Services" && r.servicePaid !== filters.service) {
        return false;
      }
      // Search query filter (receipt #, resident name, property)
      if (filters.search.trim()) {
        const query = filters.search.toLowerCase();
        const matchesReceipt = r.receiptNumber.toLowerCase().includes(query);
        const matchesName = r.residentName.toLowerCase().includes(query);
        const matchesProperty = r.property.toLowerCase().includes(query);
        if (!matchesReceipt && !matchesName && !matchesProperty) {
          return false;
        }
      }
      return true;
    });
  }, [records, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const pageRecords = filteredRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleClearFilters = () => {
    setFilters({
      month: "All Months",
      year: "2024",
      service: "All Services",
      status: "All Status",
      search: "",
    });
  };

  return (
    <>
      <ErrorBanner message={error} />
      {/* =========================================================================
          1. NATIVE MOBILE VIEW (< 768px): Task 7 Payment Records Mobile
          Automatically displays on any mobile phone or narrow viewport
          ========================================================================= */}
      <div className="block md:hidden pb-10">
        <PaymentRecordsMobileView />
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
          <PaymentMobileBottomNav onAddClick={() => alert("New Payment Flow")} />
        </div>
      </div>

      {/* =========================================================================
          2. NATIVE DESKTOP VIEW (>= 768px): Task 6 Payment Records
          Automatically displays on laptops, monitors, and tablets
          ========================================================================= */}
      <div className="hidden md:block space-y-6">
        {/* Page Title & Action Controls */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-dark">
              Payment Records
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Manage and track all financial transactions for the estate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Export CSV button */}
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-dark shadow-sm hover:bg-slate-50 transition-colors"
            >
              <Download className="h-4 w-4 text-accent" />
              <span>Export CSV</span>
            </button>

            {/* Service Manager button (Task 18 link) */}
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover transition-colors"
            >
              <Briefcase className="h-4 w-4" />
              <span>Service Manager</span>
            </Link>
          </div>
        </div>

        {/* 4 Top Summary Metric Cards */}
        <PaymentSummaryCards metrics={metrics} />

        {/* Inline Search Bar */}
        <div className="relative w-full max-w-lg">
          <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-accent" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search transactions, residents, or receipt numbers..."
            className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs text-dark placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Filter Toolbar (Month, Year, Service, Status) */}
        <PaymentFilterToolbar
          filters={filters}
          onChange={setFilters}
          onClear={handleClearFilters}
        />

        {/* Paginated Payment Records Data Table */}
        <PaymentRecordsTable
          records={pageRecords}
          onSelectRecord={(r) => router.push(`/payments/receipt/${r.receiptNumber.replace('#', '')}`)}
        />

        {/* Pagination Footer */}
        <PaymentPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={filteredRecords.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />

        {/* Bottom Copyright Notice matching Figma */}
        <footer className="pt-6 pb-2 text-center text-xs font-medium text-slate-400 border-t border-slate-100">
          © 2024 LincolnEstate Finance Management. All rights reserved. System V2.4.1
        </footer>
      </div>
    </>
  );
}

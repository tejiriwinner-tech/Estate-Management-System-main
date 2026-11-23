"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, CreditCard, Mail, CheckCircle2 } from "lucide-react";
import { ResidentProfileCard } from "@/components/resident-finance/ResidentProfileCard";
import { ResidentKpiGrid } from "@/components/resident-finance/ResidentKpiGrid";
import { PaymentTimelineCard } from "@/components/resident-finance/PaymentTimelineCard";
import { OutstandingBillsCard } from "@/components/resident-finance/OutstandingBillsCard";
import { BillingPreferencesRow } from "@/components/resident-finance/BillingPreferencesRow";
import {
  ResidentFinanceSummaryData,
  OutstandingBillItem,
} from "@/types/residentFinance";

interface ResidentFinanceSummaryViewProps {
  data: ResidentFinanceSummaryData;
}

export function ResidentFinanceSummaryView({
  data,
}: ResidentFinanceSummaryViewProps) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleRecordPayment = () => {
    router.push("/payments/checkout");
  };

  const handleSendReminder = () => {
    showToast(`Payment reminder email & SMS sent to ${data.profile.name}.`);
  };

  const handlePayNow = (bill: OutstandingBillItem) => {
    showToast(
      `Redirecting to Paystack Checkout for ${bill.title} — ₦${bill.amount.toLocaleString("en-US")}`
    );
    router.push("/payments/checkout");
  };

  const handleDownloadLease = () => {
    showToast(`Downloading ${data.preferences.documentName}...`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Breadcrumb & Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-400 mb-1.5"
          >
            <Link
              href="/finance"
              className="hover:text-primary transition-colors"
            >
              Finance
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link
              href="/outstanding"
              className="hover:text-primary transition-colors"
            >
              Residents
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="font-bold text-primary">Resident Profile</span>
          </nav>

          {/* Resident Name Heading */}
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">
            {data.profile.name}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRecordPayment}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>Record Payment</span>
          </button>

          <button
            type="button"
            onClick={handleSendReminder}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-dark shadow-xs transition-colors cursor-pointer"
          >
            <Mail className="h-4 w-4 text-accent" />
            <span>Send Reminder</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {toastMessage && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-xs font-bold text-dark shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 2. Top Grid: Resident Profile Card (4 cols) + 2x2 KPI Cards (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-4">
          <ResidentProfileCard profile={data.profile} />
        </div>
        <div className="lg:col-span-8">
          <ResidentKpiGrid kpis={data.kpis} />
        </div>
      </div>

      {/* 3. Middle Grid: Payment Timeline (8 cols) + Outstanding Bills (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8">
          <PaymentTimelineCard items={data.paymentTimeline} />
        </div>
        <div className="lg:col-span-4">
          <OutstandingBillsCard
            bills={data.outstandingBills}
            nextBillingNotice={data.nextBillingNotice}
            onPayNow={handlePayNow}
          />
        </div>
      </div>

      {/* 4. Bottom Row: 4 Billing Preference & Document Mini-Cards */}
      <BillingPreferencesRow
        preferences={data.preferences}
        onDownloadDocument={handleDownloadLease}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  Landmark,
  Calendar,
  FileText,
  Download,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { BillingPreferences } from "@/types/residentFinance";

interface BillingPreferencesRowProps {
  preferences: BillingPreferences;
  onDownloadDocument?: () => void;
}

export function BillingPreferencesRow({
  preferences,
  onDownloadDocument,
}: BillingPreferencesRowProps) {
  const [autoPay, setAutoPay] = useState(
    preferences.autoPayStatus === "Enabled"
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Preferred Method */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-medium text-slate-400 mb-2">
          Preferred Method
        </p>
        <div className="flex items-center gap-2.5">
          <Landmark className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-xs font-extrabold text-dark">
            {preferences.preferredMethod}
          </span>
        </div>
      </div>

      {/* 2. Billing Frequency */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-medium text-slate-400 mb-2">
          Billing Frequency
        </p>
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4 w-4 text-accent flex-shrink-0" />
          <span className="text-xs font-extrabold text-dark">
            {preferences.billingFrequency}
          </span>
        </div>
      </div>

      {/* 3. Auto-Pay Status */}
      <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <p className="text-[11px] font-medium text-slate-400 mb-2">
          Auto-Pay Status
        </p>
        <button
          type="button"
          onClick={() => setAutoPay(!autoPay)}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {autoPay ? (
            <ToggleRight className="h-5 w-5 text-emerald-600 transition-transform group-hover:scale-105" />
          ) : (
            <ToggleLeft className="h-5 w-5 text-primary transition-transform group-hover:scale-105" />
          )}
          <span className="text-xs font-extrabold text-dark">
            {autoPay ? "Enabled" : "Disabled"}
          </span>
        </button>
      </div>

      {/* 4. Documents */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
        <div className="min-w-0 pr-2">
          <p className="text-[11px] font-medium text-slate-400 mb-2">
            Documents
          </p>
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
            <span className="text-xs font-extrabold text-dark truncate">
              {preferences.documentName}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onDownloadDocument}
          title="Download Lease Agreement"
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

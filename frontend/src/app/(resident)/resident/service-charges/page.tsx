"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";
import { ResidentServiceChargePanel } from "@/components/resident/ResidentServiceChargePanel";

export default function ResidentServiceChargesPage() {
  return (
    <div className="space-y-6 pb-10">
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
          <ShieldCheck className="w-4 h-4" />
          <span>Unit Assessment &amp; Estate Upkeep</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
          My Service Charges
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View and clear official estate service charges (security, sanitation, street lighting, and utilities) billed to your residence.
        </p>
      </div>

      <ResidentServiceChargePanel scope="resident" />
    </div>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { Smartphone, Monitor } from "lucide-react";
import { MobileHeader } from "@/components/mobile/MobileHeader";
import { PaymentRecordsMobileView } from "@/components/payments/mobile/PaymentRecordsMobileView";
import { PaymentMobileBottomNav } from "@/components/payments/mobile/PaymentMobileBottomNav";

export default function PaymentRecordsMobilePage() {
  return (
    <div className="min-h-screen bg-slate-100/70 py-4 sm:py-8 flex flex-col items-center justify-start">
      {/* Top Desktop Helper Switcher */}
      <div className="mb-4 flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm border border-slate-200">
        <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
          <Smartphone className="h-4 w-4" />
          Payment Records Mobile (Task 7)
        </span>
        <span className="text-slate-300">|</span>
        <Link
          href="/payments"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors"
        >
          <Monitor className="h-4 w-4" />
          Switch to Desktop View
        </Link>
      </div>

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[390px] overflow-hidden rounded-[36px] border-[6px] border-slate-900 bg-white shadow-2xl">
        {/* Device Speaker Notch */}
        <div className="flex h-6 w-full items-center justify-center bg-white pt-2">
          <div className="h-1.5 w-20 rounded-full bg-slate-200" />
        </div>

        {/* Mobile Header */}
        <MobileHeader />

        {/* Scrollable Content */}
        <main className="space-y-5 px-5 py-5 bg-[#F8FAFC]">
          <PaymentRecordsMobileView />
        </main>

        {/* Bottom Navigation with Center FAB (+) */}
        <PaymentMobileBottomNav />
      </div>
    </div>
  );
}

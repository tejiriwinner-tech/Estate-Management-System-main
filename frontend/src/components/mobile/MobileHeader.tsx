"use client";

import React from "react";
import { Bell } from "lucide-react";

export function MobileHeader() {
  return (
    <header className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
      {/* Brand Logo */}
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white font-bold text-xl shadow-sm">
          <span className="italic font-serif">LE</span>
        </div>
        <div>
          <div className="flex items-center leading-none">
            <span className="text-base font-bold text-emerald-600">Lincoln</span>
            <span className="text-base font-bold text-slate-800">Estate</span>
          </div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
            ADMIN DASHBOARD
          </p>
        </div>
      </div>

      {/* Right: Notifications & Profile */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-1.5 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        </button>

        <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-emerald-500/20 bg-slate-800 flex items-center justify-center text-white font-semibold text-xs">
          EM
        </div>
      </div>
    </header>
  );
}

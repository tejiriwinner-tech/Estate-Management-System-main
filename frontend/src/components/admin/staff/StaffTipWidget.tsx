"use client";

import React from "react";
import { Sparkles } from "lucide-react";

export function StaffTipWidget() {
  return (
    <div className="bg-accent-light/50 rounded-2xl p-5 sm:p-6 border border-accent/20 shadow-xs">
      <div className="flex items-center gap-2 text-accent">
        <Sparkles className="w-4 h-4 stroke-[2.5]" />
        <span className="text-xs font-bold uppercase tracking-wider text-accent">
          STAFF TIP
        </span>
      </div>

      <p className="mt-3 text-xs sm:text-[13px] text-dark/90 font-medium leading-relaxed">
        Staff members with <span className="font-bold text-primary">&ldquo;Active&rdquo;</span> status can access the mobile portal for real-time site inspections.
      </p>
    </div>
  );
}

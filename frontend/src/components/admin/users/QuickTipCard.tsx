"use client";

import React from "react";
import { Lightbulb } from "lucide-react";

export function QuickTipCard() {
  return (
    <div className="bg-accent-light/50 rounded-2xl p-6 border border-accent/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white shadow-sm shrink-0">
          <Lightbulb className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
        <h3 className="font-extrabold text-base text-dark tracking-tight">
          Quick Tip
        </h3>
      </div>

      <p className="mt-4 text-xs sm:text-sm text-dark/90 font-medium leading-relaxed">
        You can set up <span className="font-bold text-primary">&ldquo;Auto-Billing&rdquo;</span> for utilities to reduce manual intervention. Automated invoices are sent 5 days before the frequency deadline.
      </p>
    </div>
  );
}

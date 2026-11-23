"use client";

import React from "react";
import Link from "next/link";
import { TrendingUp, Lightbulb } from "lucide-react";

interface ServiceInsightsRowProps {
  forecastText: string;
  quickTipText: string;
}

export function ServiceInsightsRow({
  forecastText,
  quickTipText,
}: ServiceInsightsRowProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left (6 cols): Revenue Forecast Solid Brand Card */}
      <div className="lg:col-span-6 relative overflow-hidden flex flex-col justify-between rounded-2xl bg-gradient-to-br from-primary via-primary to-primary-dark p-6 sm:p-7 text-white shadow-md">
        {/* Decorative background circle matching Figma */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full bg-white/10" />

        <div className="relative z-10">
          <h3 className="text-lg font-extrabold tracking-tight text-white">
            Revenue Forecast
          </h3>
          <p className="text-xs sm:text-sm text-white/85 leading-relaxed mt-2.5 max-w-lg">
            {forecastText}
          </p>
        </div>

        <div className="relative z-10 pt-6">
          <Link
            href="/analytics"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-accent hover:text-white transition-colors"
          >
            <span>View detailed analytics</span>
            <TrendingUp className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Right (6 cols): Quick Tip Soft Tinted Card */}
      <div className="lg:col-span-6 flex items-start gap-4 rounded-2xl border border-accent/30 bg-accent/10 p-6 sm:p-7 shadow-xs">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-sm shadow-primary/20 mt-0.5">
          <Lightbulb className="h-5 w-5 text-accent" />
        </div>

        <div>
          <h3 className="text-base font-extrabold tracking-tight text-primary">
            Quick Tip
          </h3>
          <p className="text-xs sm:text-sm font-medium text-dark/80 leading-relaxed mt-2">
            {quickTipText}
          </p>
        </div>
      </div>
    </div>
  );
}

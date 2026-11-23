"use client";

import React from "react";
import Link from "next/link";
import { CollectionStatusData } from "@/types/analytics";

interface CollectionStatusCardProps {
  status: CollectionStatusData;
}

export function CollectionStatusCard({ status }: CollectionStatusCardProps) {
  // Semi-circle SVG arc calculation (180 degrees)
  const radius = 64;
  const circumference = Math.PI * radius;
  const strokeDashoffset =
    circumference - (status.collectionPercentage / 100) * circumference;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-base font-extrabold tracking-tight text-dark">
          Collection Status
        </h2>
        <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 border border-emerald-200/60">
          {status.statusLabel}
        </span>
      </div>

      {/* Main Content: Semi-Circle Gauge (Left) + Paid/Outstanding Bars & CTA (Right) */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center my-auto py-2">
        {/* Left: Semi-Circle Gauge */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-44 h-28 flex items-end justify-center overflow-hidden">
            <svg
              viewBox="0 0 160 90"
              className="w-full h-full overflow-visible"
            >
              {/* Background Track Arc */}
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="12"
                strokeLinecap="round"
              />
              {/* Foreground Active Arc */}
              <path
                d="M 16 80 A 64 64 0 0 1 144 80"
                fill="none"
                stroke="#B22222"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>

            {/* Center Percentage & Label */}
            <div className="absolute bottom-1 flex flex-col items-center text-center">
              <span className="text-2xl font-black tracking-tight text-dark">
                {status.collectionPercentage}%
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                PAID
              </span>
            </div>
          </div>
        </div>

        {/* Right: Progress Bars & View Defaulters List CTA */}
        <div className="sm:col-span-7 space-y-4">
          {/* 1. Paid Amount Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-dark">Paid Amount</span>
              <span className="font-extrabold text-emerald-700 font-mono">
                {status.paidAmount}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                style={{ width: `${status.paidPercentage}%` }}
              />
            </div>
          </div>

          {/* 2. Outstanding Bar */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-bold text-dark">Outstanding</span>
              <span className="font-extrabold text-primary font-mono">
                {status.outstandingAmount}
              </span>
            </div>
            <div className="relative h-2 w-full rounded-full bg-slate-100 flex items-center">
              <div
                className="h-full rounded-full bg-primary"
                style={{ width: `${Math.max(status.outstandingPercentage, 6)}%` }}
              />
            </div>
          </div>

          {/* 3. View Defaulters List Button */}
          <div className="pt-2">
            <Link
              href="/outstanding"
              className="flex w-full items-center justify-center rounded-xl border border-primary/40 bg-white hover:bg-primary hover:text-white px-4 py-2.5 text-xs font-extrabold text-primary transition-all shadow-xs"
            >
              View Defaulters List
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

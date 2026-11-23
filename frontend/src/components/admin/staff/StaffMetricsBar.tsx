"use client";

import React from "react";
import { Users, ShieldCheck, Ban, UserPlus } from "lucide-react";
import { StaffMetrics } from "@/types/admin/staff";

interface StaffMetricsBarProps {
  metrics: StaffMetrics;
}

export function StaffMetricsBar({ metrics }: StaffMetricsBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
      {/* 1. TOTAL STAFF */}
      <div className="bg-surface-card rounded-2xl p-4 sm:p-6 border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent-light text-accent flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          {metrics.total_trend && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-accent-light text-accent">
            {metrics.total_trend}
          </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider block">
            TOTAL STAFF
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-dark mt-1 tracking-tight">
            {metrics.total_staff}
          </div>
        </div>
      </div>

      {/* 2. ACTIVE */}
      <div className="bg-surface-card rounded-2xl p-4 sm:p-6 border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-subtle text-dark flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-dark" />
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-accent-light text-accent">
            {metrics.active_pct}
          </span>
        </div>
        <div className="mt-4">
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider block">
            ACTIVE
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-dark mt-1 tracking-tight">
            {metrics.active}
          </div>
        </div>
      </div>

      {/* 3. SUSPENDED */}
      <div className="bg-surface-card rounded-2xl p-4 sm:p-6 border border-border/80 border-l-4 border-l-primary shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-light text-primary flex items-center justify-center">
            <Ban className="w-5 h-5" />
          </div>
          {metrics.suspended_diff && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary-light text-primary">
            {metrics.suspended_diff}
          </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider block">
            SUSPENDED
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary mt-1 tracking-tight">
            {metrics.suspended}
          </div>
        </div>
      </div>

      {/* 4. NEW JOINING */}
      <div className="bg-surface-card rounded-2xl p-4 sm:p-6 border border-border/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-accent-light text-accent flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          {metrics.new_joining_badge && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-accent-light text-accent">
            {metrics.new_joining_badge}
          </span>
          )}
        </div>
        <div className="mt-4">
          <span className="text-[10px] sm:text-xs font-bold text-muted uppercase tracking-wider block">
            NEW JOINING
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-dark mt-1 tracking-tight">
            {metrics.new_joining}
          </div>
        </div>
      </div>
    </div>
  );
}

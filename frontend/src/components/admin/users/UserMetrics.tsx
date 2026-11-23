"use client";

import React from "react";
import { Users, CalendarClock, Ban, UserCheck } from "lucide-react";
import { UserStats } from "@/types/admin/user";

interface UserMetricsProps {
  stats: UserStats;
}

export function UserMetrics({ stats }: UserMetricsProps) {
  return (
    <div>
      {/* ================= DESKTOP METRICS (md and above) ================= */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {/* Total Users */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted tracking-wide uppercase">
              Total Users
            </span>
            <div className="text-3xl font-extrabold text-dark mt-2 tracking-tight">
              {stats.total_users.toLocaleString()}
            </div>
          </div>
          <div className="w-13 h-13 rounded-full bg-accent-light flex items-center justify-center text-accent">
            <Users className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-muted tracking-wide uppercase">
              Pending Approval
            </span>
            <div className="text-3xl font-extrabold text-dark mt-2 tracking-tight">
              {stats.pending_approval}
            </div>
          </div>
          <div className="w-13 h-13 rounded-full bg-accent-light flex items-center justify-center text-accent">
            <CalendarClock className="w-6 h-6 text-accent" />
          </div>
        </div>

        {/* Blocked Accounts (with Primary Crimson accent border) */}
        <div className="bg-surface-card rounded-2xl p-6 border border-border border-l-4 border-l-primary shadow-card flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-primary tracking-wide uppercase">
              Blocked Accounts
            </span>
            <div className="text-3xl font-extrabold text-primary mt-2 tracking-tight">
              {stats.blocked_accounts}
            </div>
          </div>
          <div className="w-13 h-13 rounded-full bg-primary-light flex items-center justify-center text-primary">
            <Ban className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* ================= MOBILE METRICS (stacked full-width cards) ================= */}
      <div className="md:hidden space-y-3.5">
        {/* TOTAL USERS */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted tracking-wider uppercase">
              TOTAL USERS
            </span>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-2xl font-extrabold text-dark">
                {stats.total_users.toLocaleString()}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent-light text-accent">
                {stats.total_users_trend}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-muted/60">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* ACTIVE STAFF */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-muted tracking-wider uppercase">
              ACTIVE STAFF
            </span>
            <div className="flex items-center gap-2.5 mt-1.5">
              <span className="text-2xl font-extrabold text-dark">
                {stats.active_staff}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-accent-light text-accent">
                {stats.active_staff_trend}
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-subtle flex items-center justify-center text-muted/60">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* PENDING APPROVALS */}
        <div className="bg-surface-card rounded-2xl p-5 border border-border/80 border-l-4 border-l-primary shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-primary tracking-wider uppercase">
              PENDING APPROVALS
            </span>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-2xl font-extrabold text-primary">
                {stats.pending_approval}
              </span>
              <span className="text-sm font-semibold text-primary/90">
                Requires action
              </span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary/70">
            <CalendarClock className="w-5 h-5 text-primary" />
          </div>
        </div>
      </div>
    </div>
  );
}

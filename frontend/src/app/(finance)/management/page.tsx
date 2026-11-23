"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Search,
  Filter,
  UserPlus,
  FileText,
  Wallet,
  Ban,
  Megaphone,
  User,
  Users,
  ShieldAlert,
  UserCheck,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { ManagementBottomNav } from "@/components/management/ManagementBottomNav";

export default function ManagementDashboardPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const systemMetrics = [
    {
      id: "total-residents",
      label: "Total Residents",
      value: "1248",
      icon: User,
    },
    {
      id: "active-users",
      label: "Active Users",
      value: "1,102",
      icon: Users,
    },
    {
      id: "pending-approvals",
      label: "Pending Approvals",
      value: "24",
      icon: UserCheck,
    },
    {
      id: "active-blacklist",
      label: "Active Blacklist",
      value: "7",
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 py-4 sm:py-8 flex flex-col items-center justify-start">
      {/* Top Helper Banner for Desktop Preview */}
      <div className="mb-4 flex items-center gap-3 rounded-full bg-white px-4 py-2 text-xs font-semibold text-dark shadow-sm border border-slate-200">
        <span className="flex items-center gap-1.5 text-primary font-bold">
          <Smartphone className="h-4 w-4 text-accent" />
          Management Dashboard (Task 4)
        </span>
        <span className="text-slate-300">|</span>
        <Link
          href="/finance"
          className="flex items-center gap-1.5 text-slate-500 hover:text-primary transition-colors"
        >
          <span>Go to Finance Subsystem</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Mobile Device Frame Container */}
      <div className="w-full max-w-[390px] overflow-hidden rounded-[36px] border-[6px] border-dark bg-white shadow-2xl">
        {/* Device Speaker Notch */}
        <div className="flex h-6 w-full items-center justify-center bg-white pt-2">
          <div className="h-1.5 w-20 rounded-full bg-slate-200" />
        </div>

        {/* 1. Management App Header */}
        <header className="flex items-center justify-between bg-white px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white font-bold text-xl shadow-sm shadow-primary/20">
              <span className="italic font-serif">LE</span>
            </div>
            <div>
              <div className="flex items-center leading-none">
                <span className="text-base font-bold text-primary">Lincoln</span>
                <span className="text-base font-bold text-dark">Estate</span>
              </div>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
                MANAGEMENT APP
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative rounded-full p-1.5 text-dark hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-white" />
            </button>

            <div className="relative h-9 w-9 overflow-hidden rounded-full ring-2 ring-accent bg-dark flex items-center justify-center text-white font-semibold text-xs">
              M
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="space-y-6 px-5 py-5 bg-[#F8FAFC]">
          {/* 2. Search & Filter Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-accent" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search residents..."
                className="w-full rounded-2xl border border-slate-200/80 bg-white py-2.5 pl-10 pr-4 text-xs text-dark placeholder-slate-400 shadow-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200/80 bg-white text-primary shadow-xs hover:bg-slate-50 transition-colors"
              aria-label="Filter"
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>

          {/* 3. Quick Access (Highlights the Finance Nav Icon) */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Quick Access
            </h2>

            <div className="grid grid-cols-3 gap-3">
              {/* Tile 1: User Approve */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs hover:shadow-sm transition-all text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent-dark mb-2">
                  <UserPlus className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[11px] font-medium text-dark leading-tight">
                  User Approve
                </span>
              </div>

              {/* Tile 2: Reports */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs hover:shadow-sm transition-all text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent-dark mb-2">
                  <FileText className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[11px] font-medium text-dark leading-tight">
                  Reports
                </span>
              </div>

              {/* Tile 3: FINANCE (Task 4 Core Nav Icon) */}
              <Link
                href="/finance"
                className="group flex flex-col items-center justify-center rounded-2xl border-2 border-primary/30 bg-white p-3.5 shadow-xs hover:border-primary hover:shadow-md transition-all text-center cursor-pointer ring-4 ring-primary/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-sm shadow-primary/30 mb-2 group-hover:scale-105 transition-transform">
                  <Wallet className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-bold text-primary leading-tight">
                  Finance
                </span>
              </Link>

              {/* Tile 4: Blacklist */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs hover:shadow-sm transition-all text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-2">
                  <Ban className="h-5 w-5" />
                </div>
                <span className="text-[11px] font-medium text-dark leading-tight">
                  Blacklist
                </span>
              </div>

              {/* Tile 5: Announcements */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-3.5 shadow-xs hover:shadow-sm transition-all text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/15 text-accent-dark mb-2">
                  <Megaphone className="h-5 w-5 text-accent" />
                </div>
                <span className="text-[11px] font-medium text-dark leading-tight">
                  Announcements
                </span>
              </div>
            </div>
          </div>

          {/* 4. System Overview Metrics */}
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              System Overview
            </h2>

            <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm divide-y divide-slate-50">
              {systemMetrics.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 first:pt-1 last:pb-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {item.label}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-900">
                      {item.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </main>

        {/* 5. Management Bottom Navigation Bar (Finance icon) */}
        <ManagementBottomNav activeTab="home" />
      </div>
    </div>
  );
}

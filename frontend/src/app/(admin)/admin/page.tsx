"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  LayoutDashboard,
  Car,
  PlaneTakeoff,
  Users,
} from "lucide-react";
import { SummaryCard } from "@/components/admin/dashboard/SummaryCard";
import { RemindersWidget } from "@/components/admin/dashboard/RemindersWidget";
import { EstateUpdatesWidget } from "@/components/admin/dashboard/EstateUpdatesWidget";
import { CheckInOutDashboardView } from "@/components/admin/access/CheckInOutDashboardView";
import { VehicleManagementView } from "@/components/admin/vehicles/VehicleManagementView";
import { AwayNotificationView } from "@/components/admin/away/AwayNotificationView";
import { EstateMembersView } from "@/components/admin/members/EstateMembersView";
import { MetricCardData } from "@/types/admin/dashboard";
import { cn } from "@/lib/admin/utils";

const metrics: MetricCardData[] = [
  {
    id: "residents",
    label: "TOTAL RESIDENTS",
    value: "1,248",
    trend: "+24",
    trendType: "positive",
    iconType: "residents",
  },
  {
    id: "houses",
    label: "OCCUPIED HOUSES",
    value: "356",
    badge: "94%",
    iconType: "houses",
  },
  {
    id: "revenue",
    label: "MONTHLY REVENUE",
    value: "₦15.2M",
    trend: "+8.4%",
    trendType: "positive",
    iconType: "revenue",
  },
  {
    id: "requests",
    label: "PENDING REQUESTS",
    value: "18",
    iconType: "requests",
  },
];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<
    "members" | "away" | "vehicles" | "checkin" | "overview"
  >("members");

  return (
    <div className="space-y-6">
      {/* Top Dashboard Section Switcher (Single Responsive Pages — No Duplicate Mobile Tabs) */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface-card border border-border/70 rounded-2xl w-fit shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab("members")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "members"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-dark hover:bg-surface-subtle"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Members of Estate</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("away")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "away"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-dark hover:bg-surface-subtle"
          )}
        >
          <PlaneTakeoff className="w-4 h-4" />
          <span>Away Notification</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("vehicles")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "vehicles"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-dark hover:bg-surface-subtle"
          )}
        >
          <Car className="w-4 h-4" />
          <span>Vehicle Management</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("checkin")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "checkin"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-dark hover:bg-surface-subtle"
          )}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Check-In / Check-Out</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={cn(
            "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
            activeTab === "overview"
              ? "bg-primary text-white shadow-xs"
              : "text-muted hover:text-dark hover:bg-surface-subtle"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Executive Overview</span>
        </button>
      </div>

      {activeTab === "members" ? (
        <EstateMembersView />
      ) : activeTab === "away" ? (
        <AwayNotificationView />
      ) : activeTab === "vehicles" ? (
        <VehicleManagementView />
      ) : activeTab === "checkin" ? (
        <CheckInOutDashboardView />
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                Welcome back, Administrator
              </h1>
              <p className="text-sm sm:text-base text-muted mt-1 font-medium">
                Here&apos;s an overview of everything happening across
                LincolnEstate today.
              </p>
            </div>
          </div>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {metrics.map((metric) => (
              <SummaryCard key={metric.id} data={metric} />
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
            <RemindersWidget />
            <EstateUpdatesWidget />
          </section>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import IntelStatCards from "@/components/security/intelligence/IntelStatCards";
import IntelFeedGrid, { type FeedItem } from "@/components/security/intelligence/IntelFeedGrid";
import { cn } from "@/lib/security/utils";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

type FilterTab = "All Activities" | "Suspicious Activity" | "Perimeter Breach" | "Vehicle Tracking";
const FILTER_TABS: FilterTab[] = ["All Activities", "Suspicious Activity", "Perimeter Breach", "Vehicle Tracking"];

export default function IntelligenceFeedPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Activities");
  const [urgency, setUrgency] = useState("All Levels");
  const { data, error, reload } = useSecurityData<{
    items: FeedItem[];
    stats: { urgentReports: number; resolvedToday: number; pendingReview: number };
  }>("/security/intelligence", { items: [], stats: { urgentReports: 0, resolvedToday: 0, pendingReview: 0 } });
  const items = data?.items ?? [];
  const stats = data?.stats ?? { urgentReports: 0, resolvedToday: 0, pendingReview: 0 };

  const filtered = items.filter((item) => {
    if (urgency !== "All Levels" && (urgency === "Urgent") !== (item.status === "URGENT")) return false;
    if (activeFilter === "Suspicious Activity") return item.category === "SUSPICIOUS_ACTIVITY";
    if (activeFilter === "Perimeter Breach") return item.category === "PERIMETER_BREACH";
    if (activeFilter === "Vehicle Tracking") return item.category === "VEHICLE_TRACKING";
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <SecurityError message={error} />

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Intelligence Feed</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time situational awareness, perimeter observations, and resident reports.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B22222] text-white text-xs font-extrabold hover:bg-[#991B1B] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <IntelStatCards
        urgentReports={stats.urgentReports}
        resolvedToday={stats.resolvedToday}
        pendingReview={stats.pendingReview}
      />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 rounded-2xl p-1.5 shadow-2xs">
          <span className="text-xs text-slate-500 px-2.5 font-semibold whitespace-nowrap">Filter:</span>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap",
                activeFilter === tab
                  ? "bg-[#B22222] text-white shadow-2xs"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Urgency:</span>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
          >
            {["All Levels", "Urgent", "High", "Medium", "Low"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed grid */}
      <IntelFeedGrid items={filtered} />
    </div>
  );
}

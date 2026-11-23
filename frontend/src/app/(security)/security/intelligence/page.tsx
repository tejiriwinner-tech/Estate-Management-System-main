"use client";

import { useState } from "react";
import { Download, ChevronDown, RefreshCw } from "lucide-react";
import IntelStatCards from "@/components/security/intelligence/IntelStatCards";
import IntelFeedGrid, { type FeedItem } from "@/components/security/intelligence/IntelFeedGrid";
import { cn } from "@/lib/security/utils";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

type FilterTab = "All Activities" | "Suspicious Activity" | "Perimeter Breach" | "Vehicle Tracking";
const FILTER_TABS: FilterTab[] = ["All Activities", "Suspicious Activity", "Perimeter Breach", "Vehicle Tracking"];
// ──────────────────────────────────────────────────────────────────────────

export default function IntelligenceFeedPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>("All Activities");
  const [urgency, setUrgency] = useState("All Levels");
  const { data, error, reload } = useSecurityData<{
    items: FeedItem[];
    stats: { urgentReports: number; resolvedToday: number; pendingReview: number };
  }>("/security/intelligence", { items: [], stats: { urgentReports: 0, resolvedToday: 0, pendingReview: 0 } });
  const items = data.items;

  const filtered = items.filter((item) => {
    if (urgency !== "All Levels" && (urgency === "Urgent") !== (item.status === "URGENT")) return false;
    if (activeFilter === "Suspicious Activity") return item.category === "SUSPICIOUS_ACTIVITY";
    if (activeFilter === "Perimeter Breach")    return item.category === "PERIMETER_BREACH";
    if (activeFilter === "Vehicle Tracking")    return item.category === "VEHICLE_TRACKING";
    return true;
  });

  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error} />
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[--color-text]">Intelligence Feed</h2>
          <p className="text-sm text-[--color-text-muted] mt-0.5">Real-time situational awareness and resident reports.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white text-xs font-bold hover:bg-[--color-primary-dark] transition-colors">
            <Download className="w-3.5 h-3.5" /> Export Report
          </button>
        </div>
      </div>

      {/* Stats */}
      <IntelStatCards urgentReports={data.stats.urgentReports} resolvedToday={data.stats.resolvedToday} pendingReview={data.stats.pendingReview} />

      {/* Filter bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1 bg-white border border-[--color-border] rounded-xl p-1">
          <span className="text-xs text-[--color-text-muted] px-2 font-medium whitespace-nowrap">Filter by:</span>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveFilter(tab)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap",
                activeFilter === tab
                  ? "bg-[--color-primary] text-white"
                  : "text-[--color-text-muted] hover:bg-gray-50"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-white border border-[--color-border] rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
          <span className="text-xs text-[--color-text-muted] font-medium">Urgency:</span>
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="text-xs font-semibold text-[--color-text] bg-transparent outline-none cursor-pointer"
          >
            {["All Levels", "Urgent", "High", "Medium", "Low"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Feed grid */}
      <IntelFeedGrid items={filtered} />

      {/* Load older */}
      <div className="flex justify-center">
        <button onClick={() => void reload()} className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-[--color-border] text-sm font-semibold text-[--color-text-muted] hover:bg-white hover:text-[--color-primary] transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>
    </div>
  );
}

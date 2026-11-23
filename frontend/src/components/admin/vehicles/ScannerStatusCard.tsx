"use client";

import React, { useState } from "react";
import { Video, Home, VideoOff, Info, RefreshCw } from "lucide-react";
import { ScannerFeed } from "@/types/admin/vehicle";
import { cn } from "@/lib/admin/utils";

interface ScannerStatusCardProps {
  feeds: ScannerFeed[];
  onRefresh: () => Promise<void>;
  onToggle: (id: string, enabled: boolean) => Promise<void>;
}

export function ScannerStatusCard({ feeds, onRefresh, onToggle }: ScannerStatusCardProps) {
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagMessage, setDiagMessage] = useState<string | null>(null);

  // Re-checks every scanner's last report. A scanner is online only if it pinged in the last 5 minutes.
  const handleRunDiagnostics = async () => {
    setIsRunningDiag(true);
    setDiagMessage(null);
    await onRefresh();
    setIsRunningDiag(false);
    const online = feeds.filter((f) => f.status === "online").length;
    setDiagMessage(feeds.length === 0 ? "No scanners registered yet." : `${online} of ${feeds.length} scanners reporting.`);
  };

  const handleToggleFeedStatus = (id: string) => {
    const feed = feeds.find((f) => f.id === id);
    if (feed) void onToggle(id, feed.offline_label === "DISABLED");
  };

  return (
    <div className="space-y-5">
      {/* ================= CARD 1: SCANNER STATUS (LIVE ANPR FEEDS) ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/70 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-accent-light/70 text-primary flex items-center justify-center shrink-0">
            <Video className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-dark leading-tight">
              Scanner Status
            </h2>
            <p className="text-xs text-muted font-medium mt-0.5">
              Live ANPR Feeds
            </p>
          </div>
        </div>

        {/* 3 ANPR Gate Scanner Cards */}
        <div className="space-y-3">
          {feeds.map((feed) => {
            const isOnline = feed.status === "online";
            return (
              <div
                key={feed.id}
                onClick={() => handleToggleFeedStatus(feed.id)}
                title="Click to toggle scanner status"
                className={cn(
                  "rounded-2xl p-4 border transition-all cursor-pointer flex items-center justify-between gap-3",
                  isOnline
                    ? "bg-[#FAFBFD] border-border/70 hover:border-border"
                    : "bg-primary-light/40 border-primary/30 hover:bg-primary-light/55"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {isOnline ? (
                    <Home className="w-4 h-4 text-primary shrink-0 stroke-[2.2]" />
                  ) : (
                    <VideoOff className="w-4 h-4 text-primary shrink-0 stroke-[2.2]" />
                  )}

                  <div className="min-w-0">
                    <div
                      className={cn(
                        "text-xs sm:text-sm font-extrabold leading-snug",
                        isOnline ? "text-dark" : "text-primary"
                      )}
                    >
                      {feed.name}
                    </div>
                    <div
                      className={cn(
                        "text-[11px] font-medium mt-0.5 truncate",
                        isOnline ? "text-muted" : "text-primary/85"
                      )}
                    >
                      {isOnline
                        ? `IP: ${feed.ip_address}`
                        : feed.offline_label || "OFFLINE - Check Conn."}
                    </div>
                  </div>
                </div>

                {/* Status Indicator Dot */}
                <span
                  className={cn(
                    "w-2.5 h-2.5 rounded-full shrink-0",
                    isOnline ? "bg-accent" : "bg-primary animate-pulse"
                  )}
                />
              </div>
            );
          })}
        </div>

        {diagMessage && (
          <div className="px-3 py-2 rounded-xl bg-accent-light/70 text-dark text-[11px] font-bold text-center">
            {diagMessage}
          </div>
        )}

        {/* Run Diagnostics Button */}
        <button
          type="button"
          onClick={handleRunDiagnostics}
          disabled={isRunningDiag}
          className="w-full py-2.5 px-4 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-xs sm:text-sm font-extrabold text-dark shadow-2xs transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isRunningDiag && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          <span>{isRunningDiag ? "Running Diagnostics..." : "Run Diagnostics"}</span>
        </button>
      </div>

      {/* ================= CARD 2: AUTOMATED ACCESS NOTICE ================= */}
      <div className="bg-[#E6ECEB] rounded-2xl border border-border/80 p-5 flex items-start gap-3">
        <Info className="w-5 h-5 text-primary shrink-0 mt-0.5 stroke-[2.2]" />
        <div className="space-y-1.5">
          <h3 className="text-xs sm:text-sm font-extrabold text-dark">
            Automated Access
          </h3>
          <p className="text-xs text-dark/80 font-medium leading-relaxed">
            Vehicles marked as &lsquo;Active&rsquo; will automatically open the
            boom barrier upon ANPR detection. &lsquo;Pending&rsquo; vehicles
            require manual guard verification.
          </p>
        </div>
      </div>
    </div>
  );
}

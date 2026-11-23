"use client";

import { AlertTriangle, Flag } from "lucide-react";

interface TrafficBar {
  height: number; // 0-100
  active?: boolean;
}

interface Props {
  failedTime: string;
  failureReason: string;
  failureDetail: string;
  flaggedSubject: string;
  trafficBars: TrafficBar[];
  totalEntries: number;
  onReview?: () => void;
}

export default function AccessAlertPanel({
  failedTime,
  failureReason,
  failureDetail,
  flaggedSubject,
  trafficBars,
  totalEntries,
  onReview,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] p-4 flex flex-col gap-4">
      {/* Failed alert */}
      <div className="flex items-start gap-3 p-3 rounded-lg bg-[--color-danger-light] border border-[--color-danger]">
        <AlertTriangle className="w-4 h-4 text-[--color-danger] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-[--color-danger] uppercase">Failed {failedTime}</span>
          </div>
          <p className="text-xs font-semibold text-[--color-text] mt-0.5">{failureReason}</p>
          <p className="text-[10px] text-[--color-text-muted] mt-0.5 leading-relaxed">{failureDetail}</p>
        </div>
      </div>

      {/* Flagged subject */}
      <div className="flex items-center justify-between p-3 rounded-lg border border-[--color-border] bg-gray-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <Flag className="w-4 h-4 text-[--color-warning]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[--color-text]">{flaggedSubject}</p>
            <p className="text-[10px] text-[--color-warning] font-semibold">Unregistered</p>
          </div>
        </div>
        <button
          onClick={onReview}
          className="px-3 py-1.5 rounded-lg bg-[--color-primary] text-white text-xs font-semibold hover:bg-[--color-primary-dark] transition-colors"
        >
          Review
        </button>
      </div>

      {/* Traffic volume */}
      <div>
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-xs font-semibold text-[--color-text]">Traffic Volume</p>
            <p className="text-[10px] text-[--color-text-muted]">Today&apos;s hourly flow</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-black text-[--color-text] tabular-nums">{totalEntries.toLocaleString()}</p>
            <p className="text-[10px] text-[--color-text-muted]">Total entries</p>
          </div>
        </div>
        {/* Bar chart */}
        <div className="flex items-end gap-1 h-10">
          {trafficBars.map((bar, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all ${bar.active ? "bg-[--color-primary]" : "bg-[--color-primary-light]"}`}
              style={{ height: `${bar.height}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { CalendarClock, Check, X, MapPin } from "lucide-react";
import { Listing, PortalViewing } from "@/types/agentPortal";
import { dayLabel, formatTime, todayIso } from "./portalUtils";

interface ViewingsSectionProps {
  viewings: PortalViewing[];
  listings: Listing[];
  onComplete: (viewingId: string) => void;
  onCancel: (viewingId: string) => void;
}

export function ViewingsSection({ viewings, listings, onComplete, onCancel }: ViewingsSectionProps) {
  const byId = new Map(listings.map((l) => [l.id, l]));
  const sortAsc = (a: PortalViewing, b: PortalViewing) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`);

  const upcoming = viewings.filter((v) => v.status === "Scheduled").sort(sortAsc);
  const past = viewings
    .filter((v) => v.status !== "Scheduled")
    .sort((a, b) => sortAsc(b, a))
    .slice(0, 4);
  const today = todayIso();

  return (
    <section id="viewings" className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center gap-2 pb-5">
        <CalendarClock className="h-4 w-4 text-primary" />
        <h2 className="text-base font-bold text-slate-800">Viewings</h2>
        <span className="ml-auto rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          {upcoming.length} upcoming
        </span>
      </div>

      {upcoming.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs font-medium text-slate-400">
          No viewings booked. Open a client request and book one from the matches.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {upcoming.map((v) => {
            const l = byId.get(v.listingId);
            const isToday = v.date === today;
            return (
              <li key={v.id} className={`flex items-center gap-3 rounded-xl border p-3 ${isToday ? "border-primary/30 bg-primary-light/50" : "border-slate-100"}`}>
                <div className="flex h-12 w-14 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-100">
                  <span className="text-[9px] font-bold uppercase text-primary">{dayLabel(v.date).split(",")[0]}</span>
                  <span className="text-xs font-extrabold text-slate-800">{formatTime(v.time)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{l?.title ?? v.listingId}</p>
                  <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-400">
                    <MapPin className="h-3 w-3 flex-shrink-0" />
                    {v.clientName}{l ? ` · ${l.address}` : ""}
                  </p>
                </div>
                <div className="flex flex-shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => onComplete(v.id)}
                    aria-label={`Mark viewing with ${v.clientName} as done`}
                    title="Mark as done"
                    className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onCancel(v.id)}
                    aria-label={`Cancel viewing with ${v.clientName}`}
                    title="Cancel viewing"
                    className="rounded-lg p-2 text-slate-400 hover:bg-primary-light hover:text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {past.length > 0 && (
        <div className="mt-5 border-t border-slate-100 pt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Recent</p>
          <ul className="space-y-1.5">
            {past.map((v) => (
              <li key={v.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate font-medium text-slate-600">
                  {v.clientName} · {byId.get(v.listingId)?.title ?? v.listingId}
                </span>
                <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${v.status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {v.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

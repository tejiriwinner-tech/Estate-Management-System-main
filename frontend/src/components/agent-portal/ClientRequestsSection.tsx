"use client";

import React, { useMemo, useState } from "react";
import { Phone, CalendarDays, Sparkles, Check } from "lucide-react";
import { ClientRequest, Listing, RequestStatus } from "@/types/agentPortal";
import { initialsFor } from "@/components/agents/initials";
import { dayLabel, formatDate, matchListings, requestSummary } from "./portalUtils";

interface ClientRequestsSectionProps {
  requests: ClientRequest[];
  listings: Listing[];
  onFindMatches: (request: ClientRequest) => void;
  onMarkContacted: (requestId: string) => void;
}

const statusStyle: Record<RequestStatus, string> = {
  New: "bg-primary-light text-primary",
  Contacted: "bg-blue-50 text-blue-700",
  "Viewing Booked": "bg-amber-50 text-amber-700",
  Negotiation: "bg-purple-50 text-purple-700",
  Closed: "bg-slate-100 text-slate-500",
};

export function ClientRequestsSection({
  requests,
  listings,
  onFindMatches,
  onMarkContacted,
}: ClientRequestsSectionProps) {
  const [showClosed, setShowClosed] = useState(false);

  const shown = useMemo(
    () =>
      requests
        .filter((r) => showClosed || r.status !== "Closed")
        .sort((a, b) => b.receivedOn.localeCompare(a.receivedOn)),
    [requests, showClosed]
  );
  const closedCount = requests.filter((r) => r.status === "Closed").length;

  return (
    <section id="requests" className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between gap-3 pb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800">Client Requests</h2>
          <p className="text-xs font-medium text-slate-400">
            People looking for a home to rent
          </p>
        </div>
        {closedCount > 0 && (
          <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-slate-500">
            <input
              type="checkbox"
              checked={showClosed}
              onChange={(e) => setShowClosed(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 accent-[#B22222]"
            />
            Show closed ({closedCount})
          </label>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs font-medium text-slate-400">
          No open client requests right now.
        </p>
      ) : (
        <ul className="space-y-3">
          {shown.map((r) => {
            const matches = r.status === "Closed" ? 0 : matchListings(r, listings).length;
            return (
              <li key={r.id} className="rounded-xl border border-slate-100 p-4 transition-colors hover:bg-slate-50/60">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {initialsFor(r.clientName.replace(/\b(Mr|Mrs|Dr)\.?\s*|&\s*/g, ""))}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-slate-800">{r.clientName}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400">
                        {r.id} · {dayLabel(r.receivedOn)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-semibold text-slate-700">{requestSummary(r)}</p>
                    <p className="mt-1 text-xs text-slate-500">{r.note}</p>
                    <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <CalendarDays className="h-3 w-3" />
                      Wants to move in by {formatDate(r.moveInBy)}
                    </p>
                  </div>
                </div>

                {r.status !== "Closed" && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => onFindMatches(r)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-hover"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      {matches > 0 ? `View ${matches} match${matches === 1 ? "" : "es"}` : "Find matches"}
                    </button>
                    <a
                      href={`tel:${r.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-dark hover:bg-slate-50"
                    >
                      <Phone className="h-3.5 w-3.5 text-accent" />
                      Call
                    </a>
                    {r.status === "New" && (
                      <button
                        type="button"
                        onClick={() => onMarkContacted(r.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-dark hover:bg-slate-50"
                      >
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Mark contacted
                      </button>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

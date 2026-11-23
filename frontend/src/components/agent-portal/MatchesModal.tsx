"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Sparkles, BedDouble, Bath, MapPin, CalendarPlus, ArrowLeft } from "lucide-react";
import { ClientRequest, Listing } from "@/types/agentPortal";
import { useOverlay } from "@/components/agents/useOverlay";
import { formatNaira, matchListings, requestSummary, todayIso } from "./portalUtils";

interface MatchesModalProps {
  request: ClientRequest | null;
  listings: Listing[];
  onClose: () => void;
  onBook: (input: { request: ClientRequest; listing: Listing; date: string; time: string }) => Promise<string | null> | string | null;
}

const TIMES = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30"];
const label = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export function MatchesModal({ request, listings, onClose, onBook }: MatchesModalProps) {
  const [picked, setPicked] = useState<Listing | null>(null);
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState(TIMES[1]);
  const [error, setError] = useState<string | null>(null);

  useOverlay(!!request, onClose);

  useEffect(() => {
    setPicked(null);
    setDate(todayIso());
    setTime(TIMES[1]);
    setError(null);
  }, [request]);

  const matches = useMemo(() => (request ? matchListings(request, listings) : []), [request, listings]);

  if (!request) return null;

  const confirm = () => {
    if (!picked) return;
    if (!date || date < todayIso()) {
      setError("Pick today or a future date.");
      return;
    }
    void Promise.resolve(onBook({ request, listing: picked, date, time })).then((problem) => {
      if (problem) setError(problem);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="matches-title" className="my-auto w-full max-w-[560px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 id="matches-title" className="text-base font-bold text-slate-800">
                {picked ? "Book a viewing" : `Matches for ${request.clientName}`}
              </h3>
              <p className="text-xs font-medium text-slate-500">{requestSummary(request)}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {!picked ? (
            matches.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                <p className="text-sm font-bold text-slate-700">No available listing fits yet</p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Nothing is in {request.zone === "Any" ? "any zone" : request.zone} within {formatNaira(request.maxBudget)}/yr with {request.minBeds}+ bedrooms.
                  Add a new listing and it will appear here.
                </p>
              </div>
            ) : (
              <ul className="space-y-3">
                {matches.map((l) => (
                  <li key={l.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 sm:p-4">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-800">{l.title}</p>
                      <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-400">
                        <MapPin className="h-3 w-3 flex-shrink-0" />{l.address} · {l.zone}
                      </p>
                      <p className="mt-1.5 flex items-center gap-3 text-xs font-semibold text-slate-600">
                        <span className="font-extrabold text-primary">{formatNaira(l.rentPerYear)}/yr</span>
                        <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-accent" />{l.beds}</span>
                        <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-accent" />{l.baths}</span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPicked(l)}
                      className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary-hover"
                    >
                      <CalendarPlus className="h-3.5 w-3.5" />
                      Book
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="space-y-5">
              <button type="button" onClick={() => setPicked(null)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to matches
              </button>

              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-800">{picked.title}</p>
                <p className="text-xs font-medium text-slate-400">{picked.address} · {picked.zone}</p>
              </div>

              <div>
                <label htmlFor="v-date" className="mb-1.5 block text-xs font-semibold text-slate-600">Date</label>
                <input
                  id="v-date"
                  type="date"
                  min={todayIso()}
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setError(null); }}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                />
                {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
              </div>

              <div>
                <p className="mb-1.5 text-xs font-semibold text-slate-600">Time</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIMES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => { setTime(t); setError(null); }}
                      aria-pressed={time === t}
                      className={`rounded-lg border px-2 py-2 text-xs font-bold transition-colors ${
                        time === t ? "border-primary bg-primary-light text-primary" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {label(t)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-dark hover:bg-slate-50">
                  Cancel
                </button>
                <button type="button" onClick={confirm} className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover">
                  Confirm Viewing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

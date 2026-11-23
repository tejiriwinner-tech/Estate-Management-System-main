"use client";

import React, { useMemo, useState } from "react";
import { BedDouble, Bath, MapPin, Eye, MessageCircle, Plus, Search, Home } from "lucide-react";
import { LISTING_STATUSES, Listing, ListingStatus } from "@/types/agentPortal";
import { formatDate, formatNaira } from "./portalUtils";

interface ListingsSectionProps {
  listings: Listing[];
  onStatusChange: (listingId: string, status: ListingStatus) => void;
  onAdd: () => void;
}

const statusPill: Record<ListingStatus, string> = {
  Available: "bg-emerald-500 text-white",
  "Under Offer": "bg-accent text-white",
  Rented: "bg-slate-700 text-white",
};

// Photo placeholders: one warm tone per listing until real photos are uploaded
const TONES = [
  "from-rose-200 to-red-300",
  "from-amber-100 to-orange-200",
  "from-stone-200 to-stone-300",
  "from-red-100 to-rose-200",
  "from-yellow-100 to-amber-200",
];

const FILTERS: Array<ListingStatus | "All"> = ["All", ...LISTING_STATUSES];

export function ListingsSection({ listings, onStatusChange, onAdd }: ListingsSectionProps) {
  const [filter, setFilter] = useState<ListingStatus | "All">("All");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: listings.length };
    listings.forEach((l) => (c[l.status] = (c[l.status] ?? 0) + 1));
    return c;
  }, [listings]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return listings.filter(
      (l) =>
        (filter === "All" || l.status === filter) &&
        (!q ||
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.zone.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q))
    );
  }, [listings, filter, query]);

  return (
    <section id="listings" className="scroll-mt-28 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 pb-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-800">My Listings</h2>
            <p className="text-xs font-medium text-slate-400">
              {shown.length} of {listings.length} properties
            </p>
          </div>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-colors hover:bg-primary-hover"
          >
            <Plus className="h-4 w-4" />
            Add Listing
          </button>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filter === f ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-dark"
                }`}
              >
                {f}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    filter === f ? "bg-primary-light text-primary" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {counts[f] ?? 0}
                </span>
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings..."
              aria-label="Search listings"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10 sm:w-60"
            />
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Home className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-700">No listings here</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Try another filter, or add a new property.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {shown.map((l, i) => (
            <li
              key={l.id}
              className="flex flex-col overflow-hidden rounded-xl border border-slate-100 transition-shadow hover:shadow-md"
            >
              <div className={`relative flex h-28 items-center justify-center bg-gradient-to-br ${TONES[i % TONES.length]}`}>
                <Home className="h-10 w-10 text-white/80" strokeWidth={1.5} />
                {l.approval && l.approval !== "approved" && (
                  <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${l.approval === "pending" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
                    {l.approval === "pending" ? "Awaiting approval" : "Rejected"}
                  </span>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${statusPill[l.status]}`}>
                  {l.status}
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                  {l.type}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="text-sm font-bold text-slate-800">{l.title}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-slate-400">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{l.address} · {l.zone}</span>
                </p>

                <p className="mt-3 text-lg font-extrabold text-primary">
                  {formatNaira(l.rentPerYear)}
                  <span className="text-xs font-semibold text-slate-400"> / year</span>
                </p>

                <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1"><BedDouble className="h-3.5 w-3.5 text-accent" />{l.beds} bed</span>
                  <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-accent" />{l.baths} bath</span>
                  <span className="flex items-center gap-1 text-slate-400"><Eye className="h-3.5 w-3.5" />{l.views}</span>
                  <span className="flex items-center gap-1 text-slate-400"><MessageCircle className="h-3.5 w-3.5" />{l.inquiries}</span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                  <span className="text-[11px] font-medium text-slate-400">
                    {l.id} · listed {formatDate(l.listedOn, { day: "numeric", month: "short" })}
                  </span>
                  <select
                    value={l.status}
                    onChange={(e) => onStatusChange(l.id, e.target.value as ListingStatus)}
                    aria-label={`Status of ${l.title}`}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
                  >
                    {LISTING_STATUSES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

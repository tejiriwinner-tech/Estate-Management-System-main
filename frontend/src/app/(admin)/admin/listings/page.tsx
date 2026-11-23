"use client";

// KAN-66: admin approval queue. A listing only appears on the public landing page once approved here.
import React, { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { ApiListing, approveListing, fetchApprovalQueue, rejectListing } from "@/services/listingsApi";

type Tab = "pending" | "approved" | "rejected";
const TABS: Tab[] = ["pending", "approved", "rejected"];

export default function ListingApprovalPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [items, setItems] = useState<ApiListing[]>([]);
  const [counts, setCounts] = useState<Record<Tab, number>>({ pending: 0, approved: 0, rejected: 0 });
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<ApiListing | null>(null);
  const [reason, setReason] = useState("");

  const load = useCallback(async (t: Tab) => {
    try {
      const r = await fetchApprovalQueue(t);
      setItems(r.data);
      setCounts(r.counts);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load listings.");
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const approve = async (l: ApiListing) => {
    try { await approveListing(l.id); await load(tab); } catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  };
  const confirmReject = async () => {
    if (!rejecting) return;
    try { await rejectListing(rejecting.id, reason); setRejecting(null); setReason(""); await load(tab); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed."); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-dark">Listing approvals</h1>
        <p className="text-sm text-muted">Listings from estate agents appear on the public landing page only after you approve them.</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-xl px-4 py-2 text-xs font-bold capitalize ${tab === t ? "bg-primary text-white" : "bg-white text-dark border border-border"}`}>
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      {items.length === 0 && !error ? (
        <p className="rounded-2xl border border-dashed border-border bg-white py-12 text-center text-sm text-muted">Nothing {tab} right now.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((l) => (
            <li key={l.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-white p-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-bold text-dark">{l.title}</p>
                <p className="text-xs text-muted">
                  {l.listing_type} · {l.property_type} · {l.address}, {l.zone} · ₦{l.price.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-muted">Agent: {l.agent?.name ?? "—"} {l.agent?.phone ? `· ${l.agent.phone}` : ""}</p>
                {l.rejection_reason && <p className="mt-1 text-xs font-medium text-red-700">Reason: {l.rejection_reason}</p>}
              </div>
              {l.approval_status !== "approved" && (
                <div className="flex shrink-0 gap-2">
                  <button onClick={() => approve(l)} className="inline-flex items-center gap-1 rounded-xl bg-brand-green px-4 py-2 text-xs font-bold text-white hover:bg-brand-green-hover"><Check className="h-4 w-4" />Approve</button>
                  {l.approval_status === "pending" && (
                    <button onClick={() => setRejecting(l)} className="inline-flex items-center gap-1 rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-dark hover:bg-surface-subtle"><X className="h-4 w-4" />Reject</button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {rejecting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onMouseDown={(e) => e.target === e.currentTarget && setRejecting(null)}>
          <div role="dialog" aria-modal="true" className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-elevated">
            <h2 className="font-bold text-dark">Reject “{rejecting.title}”</h2>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Tell the agent what to fix (min. 5 characters)" className="w-full rounded-xl border border-border px-3 py-2.5 text-sm" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejecting(null)} className="rounded-xl border border-border px-4 py-2 text-xs font-bold">Cancel</button>
              <button disabled={reason.trim().length < 5} onClick={confirmReject} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Reject listing</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

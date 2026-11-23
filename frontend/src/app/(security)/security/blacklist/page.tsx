"use client";

import { useCallback, useEffect, useState } from "react";
import { securityFetch } from "@/lib/security/api";
import { Search, Filter, Plus, UserX } from "lucide-react";
import BlacklistStatCards from "@/components/security/blacklist/BlacklistStatCards";
import BlacklistTable, { type BlacklistEntry } from "@/components/security/blacklist/BlacklistTable";
import WatchlistAccounts, { type WatchlistAccount } from "@/components/security/blacklist/WatchlistAccounts";
import AddToBlacklistDrawer from "@/components/security/blacklist/AddToBlacklistDrawer";

interface BlacklistData {
  entries: BlacklistEntry[];
  watchlist: (BlacklistEntry & { entityType: string })[];
  stats: { totalBlacklisted: number; highRiskAlerts: number; watchlistEntries: number; clearedRemoved: number };
}

const RISK_LABEL: Record<string, string> = {
  EXTREME: "Level 5 (Red)", HIGH: "Level 4 (Orange)", ELEVATED: "Level 3 (Amber)", MEDIUM: "Level 2 (Yellow)", LOW: "Level 1 (Grey)",
};
const WATCH_ACTION: Record<string, string> = { organisation: "Review Ledger", network: "Isolate Port", vehicle: "Track Movement", person: "Review Profile" };

function toWatchlist(e: BlacklistData["watchlist"][number]): WatchlistAccount {
  return {
    id: e.id,
    name: e.name,
    subtitle: e.reason,
    type: e.entityType as WatchlistAccount["type"],
    riskLevel: (RISK_LABEL[e.riskLevel] ?? "Level 3 (Amber)") as WatchlistAccount["riskLevel"],
    riskFactor: RISK_LABEL[e.riskLevel] ?? e.riskLevel,
    action: (WATCH_ACTION[e.entityType] ?? "Review Profile") as WatchlistAccount["action"],
  };
}

export default function BlacklistPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [data, setData] = useState<BlacklistData>({ entries: [], watchlist: [], stats: { totalBlacklisted: 0, highRiskAlerts: 0, watchlistEntries: 0, clearedRemoved: 0 } });
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const entries = data.entries;

  const load = useCallback(async () => {
    try { setData(await securityFetch<BlacklistData>("/security/blacklist")); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load the blacklist."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = entries.filter(
    (e) =>
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.entityId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[--color-text]">Blacklist &amp; Watchlist</h2>
          <p className="text-sm text-[--color-text-muted] mt-0.5">
            Manage restricted personnel and monitor high-risk entities within the estate perimeter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors">
            <Filter className="w-3.5 h-3.5" /> Filter List
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-danger] text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            <UserX className="w-3.5 h-3.5" /> Add to Blacklist
          </button>
        </div>
      </div>

      {/* Stats */}
      <BlacklistStatCards {...data.stats} />

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[--color-border] rounded-lg px-3 py-2.5 w-full max-w-sm">
        <Search className="w-4 h-4 text-[--color-text-subtle] shrink-0" />
        <input
          type="search"
          placeholder="Search blacklist by name or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-sm text-[--color-text] placeholder:text-[--color-text-subtle] outline-none w-full"
        />
      </div>

      {/* Table */}
      <BlacklistTable entries={filtered} onViewProfile={() => {}} />

      {/* Watchlist */}
      <WatchlistAccounts accounts={data.watchlist.map(toWatchlist)} />

      {/* FAB */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-[--color-primary] text-white shadow-lg flex items-center justify-center hover:bg-[--color-primary-dark] transition-colors z-20"
        aria-label="Add to blacklist"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Add drawer */}
      <AddToBlacklistDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={async (f) => {
          try {
            await securityFetch("/security/blacklist", {
              method: "POST",
              body: JSON.stringify({
                name: f.name, entity_ref: f.entityId || undefined, reason: f.reason, details: f.details || undefined,
                risk_level: f.riskLevel, notify_officers: f.notifyOfficers,
              }),
            });
            await load();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not add the entry.");
          }
        }}
      />
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { securityFetch } from "@/lib/security/api";
import { Plus, X } from "lucide-react";
import LiveVerificationCard from "@/components/security/access/LiveVerificationCard";
import AccessAlertPanel from "@/components/security/access/AccessAlertPanel";
import GuestPassesPanel, { type GuestPass } from "@/components/security/access/GuestPassesPanel";
import AccessLogsTable, { type AccessLogRow } from "@/components/security/access/AccessLogsTable";

interface AccessData {
  logs: AccessLogRow[];
  total: number;
  trafficBars: { height: number; active?: boolean }[];
  entriesLast12h: number;
  latestVerified: { name: string; role: string; verificationType: string; gate: string; time: string } | null;
  latestDenied: { name: string; time: string; reason: string; gate: string } | null;
  passes: GuestPass[];
}

export default function AccessControlPage() {
  const [data, setData] = useState<AccessData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pass, setPass] = useState({ name: "", invited_by: "", minutes: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try { setData(await securityFetch<AccessData>("/security/access")); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load access data."); }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  async function createPass(e: React.FormEvent) {
    e.preventDefault();
    if (!pass.name.trim()) return;
    setSaving(true);
    try {
      await securityFetch("/security/access/passes", {
        method: "POST",
        body: JSON.stringify({
          name: pass.name.trim(),
          invited_by: pass.invited_by.trim() || undefined,
          expires_in_minutes: pass.minutes ? Number(pass.minutes) : undefined,
        }),
      });
      setPass({ name: "", invited_by: "", minutes: "" });
      setDrawerOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the pass.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 relative">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-bold text-[--color-text]">Access Control Monitoring</h2>
          <p className="text-sm text-[--color-text-muted] mt-0.5">Live surveillance and entry authorisation management.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors">
            Filters
          </button>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[--color-primary] text-white text-xs font-bold hover:bg-[--color-primary-dark] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Temporary Pass
          </button>
        </div>
      </div>

      {/* Top 3-col grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.latestVerified ? (
          <LiveVerificationCard
            personName={data.latestVerified.name}
            personRole={data.latestVerified.role}
            verificationType={data.latestVerified.verificationType}
            gateLocation={data.latestVerified.gate}
            verified={true}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[--color-border] p-4 text-sm text-[--color-text-muted]">No verified entries recorded yet.</div>
        )}
        {data?.latestDenied ? (
          <AccessAlertPanel
            failedTime={data.latestDenied.time}
            failureReason={data.latestDenied.reason}
            failureDetail={`Recorded at ${data.latestDenied.gate}.`}
            flaggedSubject={data.latestDenied.name}
            trafficBars={data.trafficBars}
            totalEntries={data.entriesLast12h}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[--color-border] p-4 text-sm text-[--color-text-muted]">
            No failed verifications. {data ? `${data.entriesLast12h} entries in the last 12 hours.` : ""}
          </div>
        )}
        <GuestPassesPanel passes={data?.passes ?? []} onNewPass={() => setDrawerOpen(true)} />
      </div>

      {/* Logs table */}
      <AccessLogsTable rows={data?.logs ?? []} total={data?.total ?? 0} />

      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setDrawerOpen(false)}>
          <form onSubmit={createPass} onClick={(e) => e.stopPropagation()} className="w-full max-w-sm space-y-3 rounded-xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[--color-text]">New Temporary Pass</h3>
              <button type="button" aria-label="Close" onClick={() => setDrawerOpen(false)}><X className="h-4 w-4" /></button>
            </div>
            <input required value={pass.name} onChange={(e) => setPass({ ...pass, name: e.target.value })} placeholder="Guest name" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <input value={pass.invited_by} onChange={(e) => setPass({ ...pass, invited_by: e.target.value })} placeholder="Invited by (unit or resident)" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <input type="number" min={5} max={10080} value={pass.minutes} onChange={(e) => setPass({ ...pass, minutes: e.target.value })} placeholder="Expires in (minutes) - blank for one-time" className="w-full rounded-lg border border-[--color-border] px-3 py-2 text-sm" />
            <button disabled={saving} className="w-full rounded-lg bg-[--color-primary] py-2.5 text-sm font-bold text-white disabled:opacity-60">Create pass</button>
          </form>
        </div>
      )}
    </div>
  );
}

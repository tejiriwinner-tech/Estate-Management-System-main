"use client";

// Figma "activity page": Family Check in and Out Activity (Name, Out, Out With, In, In With).
import React, { useState } from "react";
import { Card, GreenButton, StateMsg } from "@/components/resident/ui";
import { Activity, fmtTime, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

export default function ActivityPage() {
  const { data, error, loading, reload } = useResident<Activity[]>("/activity");
  const [name, setName] = useState("");
  const [outWith, setOutWith] = useState("Alone");
  const [msg, setMsg] = useState<string | null>(null);

  const checkOut = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await send("/activity/check-out", "POST", { name, out_with: outWith }); setName(""); setMsg(null); await reload(); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Could not record."); }
  };
  const checkIn = async (id: number) => {
    const with_ = window.prompt("Came back with? (e.g. Alone, Wife)", "Alone");
    if (with_ === null) return;
    try { await send(`/activity/${id}/check-in`, "POST", { in_with: with_ }); await reload(); }
    catch (err) { setMsg(err instanceof Error ? err.message : "Could not record."); }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={checkOut} className="flex flex-wrap items-end gap-3">
        <label className="text-sm font-semibold">Who is going out<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block rounded-md border border-muted/50 px-3 py-2" /></label>
        <label className="text-sm font-semibold">Out with<input value={outWith} onChange={(e) => setOutWith(e.target.value)} className="mt-1 block rounded-md border border-muted/50 px-3 py-2" /></label>
        <GreenButton type="submit">Check out</GreenButton>
      </form>
      {msg && <p role="alert" className="text-sm text-alert">{msg}</p>}
      <Card className="overflow-hidden">
        <h1 className="bg-head px-5 py-4 text-xl">Family Check in and Out Activity</h1>
        <StateMsg loading={loading} error={error} />
        {data && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead><tr className="border-b border-head"><th className="px-5 py-3 font-normal">Name</th><th className="px-5 py-3 font-normal">Out</th><th className="px-5 py-3 font-normal">Out With</th><th className="px-5 py-3 font-normal">In</th><th className="px-5 py-3 font-normal">In With</th></tr></thead>
              <tbody>
                {data.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No activity recorded yet.</td></tr>}
                {data.map((a, i) => (
                  <tr key={a.id} className={i % 2 ? "bg-head" : "bg-white"}>
                    <td className="px-5 py-3">{a.name}</td><td className="px-5 py-3">{fmtTime(a.out_at)}</td><td className="px-5 py-3">{a.out_with ?? "-"}</td>
                    <td className="px-5 py-3">{a.in_at ? fmtTime(a.in_at) : <button onClick={() => checkIn(a.id)} className="rounded bg-brand px-3 py-1 text-sm text-white">Check in</button>}</td>
                    <td className="px-5 py-3">{a.in_with ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";

// Figma "dashboard": three summary cards, Reminder list, "Update From Estate Admin".
import React from "react";
import { Check, Users, Wallet, DoorOpen } from "lucide-react";
import { Card, StateMsg } from "@/components/resident/ui";
import { DashboardData, naira } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

function Stat({ icon: Icon, value, label }: { icon: React.ElementType; value: string | number; label: string }) {
  return (
    <Card className="flex items-center gap-5 p-6">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded bg-mint text-brand"><Icon className="h-9 w-9" /></span>
      <div><p className="text-3xl font-semibold">{value}</p><p className="text-lg font-semibold text-black/45">{label}</p></div>
    </Card>
  );
}

export default function ResidentDashboard() {
  const { data, error, loading } = useResident<DashboardData>("/dashboard");
  if (!data) return <StateMsg loading={loading} error={error} />;
  const u = data.estate_update;
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Stat icon={Users} value={data.neighbors} label="Neighbors" />
        <Stat icon={Wallet} value={naira(data.total_paid)} label="Total Payment Made" />
        <Stat icon={DoorOpen} value={data.family_activities} label="Family Activities" />
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card className="p-5">
          <h2 className="text-center text-xl font-bold text-brand">Reminder</h2>
          <ul className="mt-5 space-y-5">
            {data.reminders.length === 0 && <li className="text-center text-sm text-muted">No reminders.</li>}
            {data.reminders.map((r) => (
              <li key={r.id} className="flex items-start gap-3">
                <span className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-brand ${r.is_completed ? "bg-brand text-white" : "text-transparent"}`}><Check className="h-5 w-5" /></span>
                <p className="flex-1 font-bold">{r.text}</p>
                <span className="shrink-0 text-sm font-bold text-muted">{r.due_time}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          {u ? (<>
            {u.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={u.image_url} alt="" className="h-64 w-full rounded-md bg-row object-cover" />}
            <div className="mt-4 flex items-baseline justify-between">
              <h2 className="text-xl font-semibold">{u.headline_prefix}<span className="text-brand">{u.headline_highlight}</span></h2>
              <span className="text-sm text-muted">{u.published_at ? new Date(u.published_at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }) : ""}</span>
            </div>
            <p className="mt-2 font-semibold text-muted">{u.lead_paragraph}</p>
            <p className="mt-3 font-semibold text-muted">{u.body_paragraph}</p>
          </>) : <p className="py-10 text-center text-sm text-muted">No updates from the estate admin yet.</p>}
        </Card>
      </div>
    </div>
  );
}

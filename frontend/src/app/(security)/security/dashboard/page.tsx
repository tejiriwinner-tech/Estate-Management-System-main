"use client";

import { useState } from "react";
import { Brain, AlertTriangle, Activity } from "lucide-react";
import StatCard from "@/components/security/dashboard/StatCard";
import ThreatAlertBanner from "@/components/security/dashboard/ThreatAlertBanner";
import ReminderPanel from "@/components/security/dashboard/ReminderPanel";
import EstateUpdateCard from "@/components/security/dashboard/EstateUpdateCard";
import type { Reminder } from "@/components/security/dashboard/ReminderPanel";
import { securityFetch } from "@/lib/security/api";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

interface DashboardData {
  stats: { intelligence: number; threats: number; activities: number };
  openThreats: number;
  reminders: Reminder[];
  update: { author: string; role: string; timestamp: string; body: string; imageUrl?: string | null } | null;
}

export default function DashboardPage() {
  const [threatVisible, setThreatVisible] = useState(true);
  const { data, error, reload } = useSecurityData<DashboardData>("/security/dashboard", {
    stats: { intelligence: 0, threats: 0, activities: 0 }, openThreats: 0, reminders: [], update: null,
  });
  const STATS = [
    { label: "Intelligent Reports",  value: data.stats.intelligence, icon: Brain },
    { label: "Under Threat Reports", value: data.stats.threats,      icon: AlertTriangle },
    { label: "Estate Activities",    value: data.stats.activities,   icon: Activity },
  ];

  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error} />
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {STATS.map((s) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
          />
        ))}
      </div>

      {/* Threat banner */}
      {threatVisible && data.openThreats > 0 && (
        <ThreatAlertBanner
          count={data.openThreats}
          onDismiss={() => setThreatVisible(false)}
          onView={() => {}}
        />
      )}

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left – reminders */}
        <ReminderPanel
          reminders={data.reminders}
          onAdd={async () => {
            const text = window.prompt("New reminder:");
            if (!text?.trim()) return;
            try {
              await securityFetch("/security/reminders", { method: "POST", body: JSON.stringify({ text: text.trim() }) });
              await reload();
            } catch (e) {
              window.alert(e instanceof Error ? e.message : "Could not save the reminder.");
            }
          }}
        />

        {/* Right – estate update */}
        {data.update ? (
          <EstateUpdateCard
            author={data.update.author}
            role={data.update.role}
            timestamp={data.update.timestamp}
            body={data.update.body}
            imageUrl={data.update.imageUrl ?? undefined}
          />
        ) : (
          <div className="bg-white rounded-xl border border-[--color-border] p-5 text-sm text-[--color-text-muted]">
            No estate updates have been published yet.
          </div>
        )}
      </div>
    </div>
  );
}

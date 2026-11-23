"use client";

import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Home,
  UserPlus,
  Handshake,
  Star,
  CalendarClock,
} from "lucide-react";
import { AGENT_STATUSES, Agent, AgentStatus, UpcomingViewing } from "@/types/agent";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { formatDate, formatNaira } from "./agentUtils";
import { useOverlay } from "./useOverlay";

interface AgentDetailDrawerProps {
  agent: Agent | null;
  viewings: UpcomingViewing[];
  onClose: () => void;
  onStatusChange: (agentId: string, status: AgentStatus) => void;
}

export function AgentDetailDrawer({
  agent,
  viewings,
  onClose,
  onStatusChange,
}: AgentDetailDrawerProps) {
  useOverlay(!!agent, onClose);

  if (!agent) return null;

  const agentViewings = viewings.filter((v) => v.agentId === agent.id);
  const targetColor =
    agent.targetProgress >= 75
      ? "bg-emerald-500"
      : agent.targetProgress >= 50
      ? "bg-accent"
      : "bg-primary";

  const stats = [
    { label: "Listings", value: agent.activeListings, icon: Home, color: "text-purple-600 bg-purple-50" },
    { label: "Open leads", value: agent.openLeads, icon: UserPlus, color: "text-amber-600 bg-amber-50" },
    { label: "Deals (YTD)", value: agent.dealsClosed, icon: Handshake, color: "text-emerald-600 bg-emerald-50" },
    {
      label: `Rating (${agent.reviews})`,
      value: agent.reviews ? agent.rating.toFixed(1) : "—",
      icon: Star,
      color: "text-accent bg-yellow-50",
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="agent-drawer-title"
        className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary to-primary-dark px-6 pb-6 pt-5 text-white">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close agent profile"
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            Agent Profile · {agent.id}
          </p>
          <div className="mt-4 flex items-center gap-4">
            <div
              className={`flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full text-lg font-extrabold ring-4 ring-white/20 ${agent.avatarBg}`}
            >
              {agent.initials}
            </div>
            <div className="min-w-0">
              <h3 id="agent-drawer-title" className="truncate text-xl font-extrabold">
                {agent.name}
              </h3>
              <div className="mt-1.5">
                <AgentStatusBadge status={agent.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 p-6">
          {/* Contact */}
          <section className="space-y-2.5 text-sm">
            <InfoRow icon={Mail}>
              <a href={`mailto:${agent.email}`} className="hover:text-primary hover:underline">
                {agent.email}
              </a>
            </InfoRow>
            <InfoRow icon={Phone}>
              <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="hover:text-primary hover:underline">
                {agent.phone}
              </a>
            </InfoRow>
            <InfoRow icon={MapPin}>{agent.zone}</InfoRow>
            <InfoRow icon={CalendarDays}>Joined {formatDate(agent.joinedOn)}</InfoRow>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-100 p-3">
                <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${s.color}`}>
                  <s.icon className="h-4 w-4" />
                </div>
                <p className="text-lg font-extrabold text-slate-900">{s.value}</p>
                <p className="text-[11px] font-semibold text-slate-400">{s.label}</p>
              </div>
            ))}
          </section>

          {/* Commission & target */}
          <section className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Commission earned (YTD)
                </p>
                <p className="mt-1 text-xl font-extrabold text-emerald-600">
                  {formatNaira(agent.commission)}
                </p>
              </div>
              <p className="text-xs font-bold text-slate-600">{agent.targetProgress}% of Q4 target</p>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div className={`h-full rounded-full ${targetColor}`} style={{ width: `${agent.targetProgress}%` }} />
            </div>
          </section>

          {/* Viewings */}
          <section>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-800">
              <CalendarClock className="h-4 w-4 text-primary" />
              Upcoming viewings
            </h4>
            {agentViewings.length ? (
              <ul className="space-y-2">
                {agentViewings.map((v) => (
                  <li key={v.id} className="rounded-xl border border-slate-100 p-3">
                    <p className="text-sm font-semibold text-slate-800">{v.property}</p>
                    <p className="text-xs font-medium text-slate-400">
                      {formatDate(v.date, { weekday: "short", day: "numeric", month: "short" })} · {v.time} · {v.client}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs font-medium text-slate-400">
                No viewings scheduled.
              </p>
            )}
          </section>

          {/* Status management */}
          <section>
            <h4 className="mb-3 text-sm font-bold text-slate-800">Change status</h4>
            <div className="grid grid-cols-3 gap-2">
              {AGENT_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={agent.status === s}
                  onClick={() => onStatusChange(agent.id, s)}
                  className={`rounded-xl border px-2 py-2 text-xs font-bold transition-colors ${
                    agent.status === s
                      ? "cursor-default border-primary bg-primary-light text-primary"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 grid grid-cols-2 gap-3 border-t border-slate-100 bg-white p-4">
          <a
            href={`tel:${agent.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-dark hover:bg-slate-50"
          >
            <Phone className="h-4 w-4 text-accent" /> Call
          </a>
          <a
            href={`mailto:${agent.email}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover"
          >
            <Mail className="h-4 w-4" /> Send Email
          </a>
        </div>
      </aside>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <Icon className="h-4 w-4 flex-shrink-0 text-slate-400" />
      <span className="truncate font-medium">{children}</span>
    </div>
  );
}

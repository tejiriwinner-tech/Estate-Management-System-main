"use client";

import React from "react";
import { Trophy, ChevronRight } from "lucide-react";
import { Agent } from "@/types/agent";

interface TopAgentsCardProps {
  agents: Agent[];
  onView: (agent: Agent) => void;
}

const medal = [
  "bg-accent text-white",
  "bg-slate-300 text-slate-800",
  "bg-amber-700/80 text-white",
];

export function TopAgentsCard({ agents, onView }: TopAgentsCardProps) {
  const top = [...agents]
    .filter((a) => a.status !== "Inactive")
    .sort((a, b) => b.commission - a.commission)
    .slice(0, 5);
  const best = top[0]?.commission || 1;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-accent" />
          <h2 className="text-base font-bold text-slate-800">Top Performers</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          By commission · YTD
        </span>
      </div>

      <ul className="-mx-2 space-y-1">
        {top.map((agent, i) => (
          <li key={agent.id}>
            <button
              type="button"
              onClick={() => onView(agent)}
              className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-50"
            >
              <span
                className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  medal[i] ?? "bg-slate-100 text-slate-500"
                }`}
              >
                {i + 1}
              </span>
              <div
                className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${agent.avatarBg}`}
              >
                {agent.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-800">{agent.name}</p>
                  <p className="flex-shrink-0 text-sm font-bold text-slate-800">
                    ₦{(agent.commission / 1_000_000).toFixed(2)}M
                  </p>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-primary/80"
                      style={{ width: `${(agent.commission / best) * 100}%` }}
                    />
                  </div>
                  <span className="w-24 flex-shrink-0 text-right text-[11px] font-medium text-slate-400">
                    {agent.dealsClosed} deals · ★ {agent.rating.toFixed(1)}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300 group-hover:text-slate-500" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

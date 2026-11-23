"use client";

import React from "react";
import { CalendarClock, Clock } from "lucide-react";
import { Agent, UpcomingViewing } from "@/types/agent";

interface UpcomingViewingsCardProps {
  viewings: UpcomingViewing[];
  agents: Agent[];
  onViewAgent: (agent: Agent) => void;
}

const statusStyle: Record<UpcomingViewing["status"], string> = {
  Confirmed: "bg-emerald-50 text-emerald-700",
  Pending: "bg-amber-50 text-amber-700",
  Rescheduled: "bg-blue-50 text-blue-700",
};

export function UpcomingViewingsCard({ viewings, agents, onViewAgent }: UpcomingViewingsCardProps) {
  const byId = new Map(agents.map((a) => [a.id, a]));
  const sorted = [...viewings].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-primary" />
          <h2 className="text-base font-bold text-slate-800">Upcoming Viewings</h2>
        </div>
        <span className="rounded-full bg-primary-light px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
          {viewings.length} this week
        </span>
      </div>

      {sorted.length === 0 ? (
        <p className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-xs font-medium text-slate-400">
          No viewings scheduled this week.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {sorted.map((v) => {
            const d = new Date(`${v.date}T00:00:00`);
            const agent = byId.get(v.agentId);
            return (
              <li
                key={v.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex h-11 w-11 flex-shrink-0 flex-col items-center justify-center rounded-lg bg-primary-light">
                  <span className="text-[9px] font-bold uppercase text-primary">
                    {d.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span className="text-sm font-extrabold leading-none text-primary">
                    {d.getDate()}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{v.property}</p>
                  <p className="flex items-center gap-1 truncate text-xs font-medium text-slate-400">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    {v.time} · {v.client}
                    {agent && (
                      <>
                        {" · "}
                        <button
                          type="button"
                          onClick={() => onViewAgent(agent)}
                          className="truncate font-semibold text-slate-500 hover:text-primary hover:underline"
                        >
                          {agent.name}
                        </button>
                      </>
                    )}
                  </p>
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[v.status]}`}
                >
                  {v.status}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

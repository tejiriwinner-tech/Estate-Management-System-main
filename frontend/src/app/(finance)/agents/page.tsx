"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Download, UserPlus, CalendarDays } from "lucide-react";
import { AgentKpiCards } from "@/components/agents/AgentKpiCards";
import { AgentPerformanceChart } from "@/components/agents/AgentPerformanceChart";
import { LeadPipelineCard } from "@/components/agents/LeadPipelineCard";
import { TopAgentsCard } from "@/components/agents/TopAgentsCard";
import { UpcomingViewingsCard } from "@/components/agents/UpcomingViewingsCard";
import { AgentsTable } from "@/components/agents/AgentsTable";
import { AddAgentModal } from "@/components/agents/AddAgentModal";
import { AgentDetailDrawer } from "@/components/agents/AgentDetailDrawer";
import { AgentToast } from "@/components/agents/AgentToast";
import { agentsFetch } from "@/lib/agents/api";
import {
  agentsToCsv,
  buildAgentKpis,
  downloadTextFile,
} from "@/components/agents/agentUtils";
import { Agent, AgentDashboardData, AgentStatus, NewAgentInput } from "@/types/agent";

const EMPTY: AgentDashboardData = { performance: [], pipeline: [], agents: [], viewings: [] };

export default function AgentDashboardPage() {
  const [dash, setDash] = useState<AgentDashboardData>(EMPTY);
  const [loadError, setLoadError] = useState<string | null>(null);
  const agents = dash.agents;
  const [visibleAgents, setVisibleAgents] = useState<Agent[]>([]);
  useEffect(() => setVisibleAgents(dash.agents), [dash.agents]);

  const load = useCallback(async () => {
    try {
      setDash((await agentsFetch<{ data: AgentDashboardData }>("/admin/agents")).data);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load agents.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const kpis = useMemo(() => buildAgentKpis(agents), [agents]);
  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  // Rendered on the client only to avoid server/browser timezone hydration mismatches
  const [today, setToday] = useState("");
  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    );
  }, []);

  const openAgent = useCallback((agent: Agent) => setSelectedId(agent.id), []);
  const closeDrawer = useCallback(() => setSelectedId(null), []);
  const closeAdd = useCallback(() => setIsAddOpen(false), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const handleCreate = async (input: NewAgentInput) => {
    try {
      const res = await agentsFetch<{ data: { id: string }; temporary_password: string }>("/admin/agents", {
        method: "POST",
        body: JSON.stringify(input),
      });
      setIsAddOpen(false);
      setToast(`${input.name} was added as ${res.data.id}. Temporary password: ${res.temporary_password} (shown once).`);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not add the agent.");
    }
  };

  const handleStatusChange = async (agentId: string, status: AgentStatus) => {
    const agent = agents.find((a) => a.id === agentId);
    try {
      await agentsFetch(`/admin/agents/${agentId}`, { method: "PATCH", body: JSON.stringify({ status }) });
      if (agent) setToast(`${agent.name} is now ${status}.`);
      await load();
    } catch (e) {
      setToast(e instanceof Error ? e.message : "Could not change the status.");
    }
  };

  const handleExport = () => {
    const stamp = new Date().toISOString().slice(0, 10);
    downloadTextFile(`lincoln-agents-${stamp}.csv`, agentsToCsv(visibleAgents));
    setToast(
      `Exported ${visibleAgents.length} agent${visibleAgents.length === 1 ? "" : "s"} to CSV.`
    );
  };

  return (
    <>
    <div className="space-y-6">
      {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{loadError}</div>}
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 flex h-4 items-center gap-1.5 text-xs font-semibold text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            {today}
          </p>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-dark">
            Agent Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Monitor agent performance, listings, leads and viewings.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <button
            type="button"
            onClick={handleExport}
            disabled={visibleAgents.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-dark shadow-sm hover:bg-slate-50 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="h-4 w-4 text-accent" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Agent</span>
          </button>
        </div>
      </div>

      {/* KPIs (derived from the roster) */}
      <AgentKpiCards kpis={kpis} />

      {/* Performance chart + Lead pipeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <AgentPerformanceChart data={dash.performance} />
        </div>
        <div className="lg:col-span-4">
          <LeadPipelineCard pipeline={dash.pipeline} />
        </div>
      </div>

      {/* Top performers + Upcoming viewings */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TopAgentsCard agents={agents} onView={openAgent} />
        <UpcomingViewingsCard
          viewings={dash.viewings}
          agents={agents}
          onViewAgent={openAgent}
        />
      </div>

      {/* Agent directory */}
      <AgentsTable agents={agents} onView={openAgent} onFilteredChange={setVisibleAgents} />

    </div>

      {/* Overlays (outside the space-y container so they get no stray top margin) */}
      <AddAgentModal
        isOpen={isAddOpen}
        existingAgents={agents}
        onClose={closeAdd}
        onCreate={handleCreate}
      />
      <AgentDetailDrawer
        agent={selectedAgent}
        viewings={dash.viewings}
        onClose={closeDrawer}
        onStatusChange={handleStatusChange}
      />
      <AgentToast message={toast} onDismiss={dismissToast} />
    </>
  );
}

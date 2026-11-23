"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Eye,
  Phone,
  Mail,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Users,
} from "lucide-react";
import { AGENT_ZONES, Agent, AgentStatus } from "@/types/agent";
import { AgentStatusBadge } from "./AgentStatusBadge";
import { formatNaira } from "./agentUtils";

interface AgentsTableProps {
  agents: Agent[];
  onView: (agent: Agent) => void;
  onFilteredChange?: (agents: Agent[]) => void;
}

type SortKey = "name" | "activeListings" | "dealsClosed" | "commission" | "targetProgress";
type SortDir = "asc" | "desc";

const STATUS_FILTERS: Array<AgentStatus | "All"> = ["All", "Active", "On Leave", "Inactive"];
const PAGE_SIZE = 8;

export function AgentsTable({ agents, onView, onFilteredChange }: AgentsTableProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<AgentStatus | "All">("All");
  const [zone, setZone] = useState<string>("All zones");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: "commission",
    dir: "desc",
  });
  const [page, setPage] = useState(1);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: agents.length };
    agents.forEach((a) => (c[a.status] = (c[a.status] ?? 0) + 1));
    return c;
  }, [agents]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = agents.filter((a) => {
      if (status !== "All" && a.status !== status) return false;
      if (zone !== "All zones" && a.zone !== zone) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q)
      );
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * dir;
      return ((av as number) - (bv as number)) * dir;
    });
  }, [agents, query, status, zone, sort]);

  useEffect(() => {
    onFilteredChange?.(filtered);
  }, [filtered, onFilteredChange]);

  // Reset to first page whenever the result set changes shape
  useEffect(() => setPage(1), [query, status, zone, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRows = filtered.slice(start, start + PAGE_SIZE);

  const toggleSort = (key: SortKey) =>
    setSort((s) =>
      s.key === key
        ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "name" ? "asc" : "desc" }
    );

  const clearFilters = () => {
    setQuery("");
    setStatus("All");
    setZone("All zones");
  };

  const SortHeader = ({
    label,
    k,
    align = "left",
  }: {
    label: string;
    k: SortKey;
    align?: "left" | "center";
  }) => {
    const active = sort.key === k;
    const Icon = !active ? ChevronsUpDown : sort.dir === "asc" ? ChevronUp : ChevronDown;
    return (
      <th
        className={`pb-3 font-semibold ${align === "center" ? "text-center" : ""}`}
        aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}
      >
        <button
          type="button"
          onClick={() => toggleSort(k)}
          className={`inline-flex items-center gap-1 uppercase tracking-wider hover:text-slate-600 ${
            active ? "text-slate-700" : ""
          }`}
        >
          {label}
          <Icon className="h-3 w-3" />
        </button>
      </th>
    );
  };

  const targetColor = (p: number) =>
    p >= 75 ? "bg-emerald-500" : p >= 50 ? "bg-accent" : "bg-primary";

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 sm:p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Agent Directory</h2>
            <p className="text-xs font-medium text-slate-400">
              {filtered.length} of {agents.length} agents
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatus(f)}
                className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  status === f ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-dark"
                }`}
              >
                {f}
                <span
                  className={`rounded-full px-1.5 text-[10px] font-bold ${
                    status === f ? "bg-primary-light text-primary" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {counts[f] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              aria-label="Filter by zone"
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
            >
              <option>All zones</option>
              {AGENT_ZONES.map((z) => (
                <option key={z}>{z}</option>
              ))}
            </select>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, ID or email..."
                aria-label="Search agents"
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder:text-slate-400 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/10"
              />
            </div>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-14 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-sm font-bold text-slate-700">No agents found</p>
          <p className="mt-1 text-xs font-medium text-slate-400">
            Try a different search term or clear the filters.
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="mt-4 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary-light"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <ul className="space-y-3 md:hidden">
            {pageRows.map((agent) => (
              <li key={agent.id}>
                <button
                  type="button"
                  onClick={() => onView(agent)}
                  className="w-full rounded-xl border border-slate-100 p-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${agent.avatarBg}`}>
                      {agent.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">{agent.name}</p>
                      <p className="truncate text-xs font-medium text-slate-400">{agent.zone}</p>
                    </div>
                    <AgentStatusBadge status={agent.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                    <MiniStat label="Listings" value={agent.activeListings} />
                    <MiniStat label="Deals" value={agent.dealsClosed} />
                    <MiniStat label="Commission" value={`₦${(agent.commission / 1_000_000).toFixed(2)}M`} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${targetColor(agent.targetProgress)}`} style={{ width: `${agent.targetProgress}%` }} />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{agent.targetProgress}% target</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <SortHeader label="Agent" k="name" />
                  <th className="pb-3 font-semibold">Zone</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <SortHeader label="Listings" k="activeListings" align="center" />
                  <SortHeader label="Deals" k="dealsClosed" align="center" />
                  <SortHeader label="Commission" k="commission" />
                  <SortHeader label="Q4 Target" k="targetProgress" />
                  <th className="pb-3 text-center font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {pageRows.map((agent) => (
                  <tr
                    key={agent.id}
                    onClick={() => onView(agent)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/70"
                  >
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${agent.avatarBg}`}>
                          {agent.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{agent.name}</p>
                          <p className="text-xs font-medium text-slate-400">{agent.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-xs font-medium text-slate-600">{agent.zone}</td>
                    <td className="py-3.5"><AgentStatusBadge status={agent.status} /></td>
                    <td className="py-3.5 text-center font-bold text-slate-800">{agent.activeListings}</td>
                    <td className="py-3.5 text-center font-bold text-slate-800">{agent.dealsClosed}</td>
                    <td className="py-3.5 font-bold text-emerald-600">{formatNaira(agent.commission)}</td>
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${targetColor(agent.targetProgress)}`} style={{ width: `${agent.targetProgress}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-slate-600">{agent.targetProgress}%</span>
                      </div>
                    </td>
                    <td className="py-3.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <a
                          href={`tel:${agent.phone.replace(/\s/g, "")}`}
                          aria-label={`Call ${agent.name}`}
                          title="Call"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        <a
                          href={`mailto:${agent.email}`}
                          aria-label={`Email ${agent.name}`}
                          title="Email"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                        >
                          <Mail className="h-4 w-4" />
                        </a>
                        <button
                          type="button"
                          onClick={() => onView(agent)}
                          aria-label={`View ${agent.name}`}
                          title="View profile"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-primary-light hover:text-primary transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-5 flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:flex-row">
            <p className="text-xs font-medium text-slate-500">
              Showing <span className="font-bold text-slate-700">{start + 1}–{start + pageRows.length}</span> of{" "}
              <span className="font-bold text-slate-700">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              <PageButton label="Previous page" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>
                <ChevronLeft className="h-4 w-4" />
              </PageButton>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === safePage ? "page" : undefined}
                  className={`h-8 min-w-[32px] rounded-lg px-2 text-xs font-bold transition-colors ${
                    n === safePage ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {n}
                </button>
              ))}
              <PageButton label="Next page" disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>
                <ChevronRight className="h-4 w-4" />
              </PageButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-slate-50 py-2">
      <p className="text-sm font-extrabold text-slate-800">{value}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function PageButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

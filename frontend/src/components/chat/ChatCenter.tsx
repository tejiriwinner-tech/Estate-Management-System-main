"use client";

// Unified Executive Messages & Notices Hub across Resident, Admin, Security, Store Owner, Agent & Finance portals.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bell,
  Megaphone,
  MessageSquare,
  Plus,
  Search,
  Send,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  Pin,
  Hash,
  Users,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { readSession } from "@/components/auth/session";
import {
  chatApi,
  fmtClock,
  type EstateAlert,
  type MeetingReport,
  type Message,
  type Room,
  type UserBrief,
} from "@/lib/chat/api";
import { Avatar } from "./Avatar";

type Tab = "MEETING" | "ALERTS" | "CHAT";
const BRAND_CRIMSON = "#B22222";

function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    try {
      setData(await fn());
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load updates.");
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { data, error, loading, reload };
}

function roleBadgeStyle(role?: string) {
  const r = (role || "").toLowerCase();
  if (r.includes("admin") || r.includes("manager")) return "bg-red-50 text-[#B22222] border-[#B22222]/20";
  if (r.includes("security")) return "bg-slate-900 text-[#C9A227] border-slate-700";
  if (r.includes("agent")) return "bg-amber-50 text-amber-800 border-amber-200";
  if (r.includes("store")) return "bg-purple-50 text-purple-700 border-purple-200";
  return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function formatRoleLabel(role?: string) {
  const r = (role || "resident").toLowerCase();
  if (r.includes("admin")) return "Management";
  if (r.includes("security")) return "Security";
  if (r.includes("agent")) return "Estate Agent";
  if (r.includes("store")) return "Merchant";
  return "Resident";
}

export function ChatCenter({ initialTab = "CHAT", onChanged }: { initialTab?: Tab; onChanged?: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "CHAT", label: "Channels & Direct Chat", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "MEETING", label: "Estate Notices & Bulletins", icon: <Megaphone className="w-4 h-4" /> },
    { key: "ALERTS", label: "Security & Safety Alerts", icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
            <Bell className="w-3.5 h-3.5" />
            <span>Lincoln Estate Unified Communications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Messages, Official Notices &amp; Dispatches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Direct messaging across residents, management, security, letting agents, and merchants — plus official estate notices.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 self-start lg:self-auto">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-[#B22222] text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Card */}
      <section className="flex h-[calc(100vh-14.5rem)] min-h-[560px] w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        {tab === "MEETING" && <NoticeBoard />}
        {tab === "ALERTS" && <AlertCenter onChanged={onChanged} />}
        {tab === "CHAT" && <SplitChatWorkspace onChanged={onChanged} />}
      </section>
    </div>
  );
}

function State({ loading, error, empty, text }: { loading: boolean; error: string; empty: boolean; text: string }) {
  if (loading) return <div className="p-12 text-center text-xs font-semibold text-slate-400">Loading communications…</div>;
  if (error) return <div className="p-8 text-center text-xs font-semibold text-red-600">{error}</div>;
  if (empty) return <div className="p-12 text-center text-xs font-semibold text-slate-400">{text}</div>;
  return null;
}

// ============================================================================
// 1. OFFICIAL ESTATE NOTICES & BULLETINS
// ============================================================================
const NOTICE_CATEGORIES = [
  { key: "all", label: "All Notices" },
  { key: "directive", label: "Executive Directives" },
  { key: "maintenance", label: "Maintenance & Utilities" },
  { key: "security", label: "Security Advisories" },
  { key: "minutes", label: "Meeting Minutes" },
] as const;

const CATEGORY_BADGES: Record<string, { label: string; style: string }> = {
  directive: { label: "Executive Directive", style: "bg-[#FEF2F2] text-[#B22222] border-[#B22222]/25" },
  maintenance: { label: "Maintenance & Power", style: "bg-amber-50 text-amber-800 border-amber-200" },
  security: { label: "Security Advisory", style: "bg-slate-900 text-[#C9A227] border-slate-700" },
  minutes: { label: "Council Minutes", style: "bg-blue-50 text-blue-800 border-blue-200" },
};

function NoticeBoard() {
  const { data, error, loading, reload } = useLoad(() => chatApi.meetings());
  const [adding, setAdding] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const role = readSession()?.role;
  const canManage = role === "Admin" || role === "Security";

  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "directive",
    priority: "normal",
  });
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((m) => {
      const cat = m.category || "directive";
      const matchCat = categoryFilter === "all" || cat === categoryFilter;
      const q = search.trim().toLowerCase();
      const matchSearch = !q || m.title.toLowerCase().includes(q) || m.body.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [data, categoryFilter, search]);

  const publish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      await chatApi.createMeeting(form);
      setForm({ title: "", body: "", category: "directive", priority: "normal" });
      setAdding(false);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Remove this notice from the estate bulletin board?")) return;
    await chatApi.deleteMeeting(id).catch(() => {});
    await reload();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-slate-50/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Official Estate Notices &amp; Bulletins</h2>
          <p className="text-xs text-slate-500">
            Verified announcements, scheduled maintenance advisories, and council resolutions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices…"
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
            />
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>{adding ? "Close Editor" : "Publish Notice"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Strip */}
      <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center gap-1.5 overflow-x-auto">
        {NOTICE_CATEGORIES.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setCategoryFilter(c.key)}
            className={`px-3 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors ${
              categoryFilter === c.key
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Notice Publisher Form (Admin & Security) */}
      {adding && (
        <form onSubmit={publish} className="p-5 border-b border-slate-200 bg-[#FEF2F2]/40 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-[#B22222]">
            Publish Official Estate Notice
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Notice Headline (e.g. Phase 1-5 Generator Maintenance Schedule)"
              className="sm:col-span-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B22222]"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
              >
                <option value="directive">Directive</option>
                <option value="maintenance">Maintenance</option>
                <option value="security">Security</option>
                <option value="minutes">Minutes</option>
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold"
              >
                <option value="normal">Standard</option>
                <option value="urgent">Urgent Pin</option>
              </select>
            </div>
          </div>
          <textarea
            required
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write full notice details, affected zones (Army Estate Phase 1-5), and action items..."
            rows={3}
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B22222]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl px-5 py-2 text-xs font-bold text-white disabled:opacity-60 shadow-xs"
              style={{ background: BRAND_CRIMSON }}
            >
              {busy ? "Publishing…" : "Broadcast Notice"}
            </button>
          </div>
        </form>
      )}

      {/* Notices Feed */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/30">
        <State
          loading={loading}
          error={error}
          empty={!loading && filtered.length === 0}
          text="No notices match this filter."
        />
        {filtered.map((m: MeetingReport) => {
          const badge = CATEGORY_BADGES[m.category || "directive"] || CATEGORY_BADGES.directive;
          return (
            <article
              key={m.id}
              className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:border-[#B22222]/30 transition-all"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${badge.style}`}>
                      {badge.label}
                    </span>
                    {m.priority === "urgent" && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white">
                        <Pin className="w-2.5 h-2.5" /> Urgent
                      </span>
                    )}
                    {m.author && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        By {m.author}
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900">{m.title}</h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <time className="text-xs font-semibold text-slate-400">{fmtClock(m.held_at)}</time>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => void remove(m.id)}
                      title="Delete notice"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {m.body}
              </p>
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// 2. SECURITY & SAFETY ALERTS CENTER
// ============================================================================
function AlertCenter({ onChanged }: { onChanged?: () => void }) {
  const { data, error, loading, reload } = useLoad(() => chatApi.alerts());
  const session = readSession();
  const isStaff = ["Admin", "Security"].includes(session?.role ?? "");
  const [reporting, setReporting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<{
    category: EstateAlert["category"];
    message: string;
    location: string;
  }>({
    category: "intelligence",
    message: "",
    location: "",
  });

  useEffect(() => {
    chatApi.readAll("alert").then(() => onChanged?.()).catch(() => {});
  }, [onChanged]);

  const submitAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setBusy(true);
    try {
      await chatApi.createAlert({
        category: form.category,
        message: form.message.trim(),
        location: form.location.trim() || "Lincoln Estate",
      });
      setForm({ category: "intelligence", message: "", location: "" });
      setReporting(false);
      await reload();
      onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const groups: { key: EstateAlert["category"]; label: string; badge: string }[] = [
    { key: "life_threat", label: "Emergency & Safety Dispatches", badge: "bg-red-100 text-red-800 border-red-200" },
    { key: "intelligence", label: "Patrol & Security Advisories", badge: "bg-amber-50 text-amber-900 border-amber-200" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-slate-200/80 bg-slate-50/60">
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Security &amp; Emergency Dispatches</h2>
          <p className="text-xs text-slate-500">
            Real-time incident reports and gate security dispatches across Army Estate Phases 1–5
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void reload()}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900"
            title="Refresh alerts"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setReporting((r) => !r)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-xs"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{reporting ? "Cancel" : "Report Incident / Alert"}</span>
          </button>
        </div>
      </div>

      {reporting && (
        <form onSubmit={submitAlert} className="p-5 border-b border-slate-200 bg-red-50/40 space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-[#B22222]">
            Dispatch Security or Safety Report
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as EstateAlert["category"] })}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800"
            >
              <option value="intelligence">Patrol / Suspicious Activity Notice</option>
              <option value="life_threat">Urgent Safety / Medical / Fire Emergency</option>
            </select>
            <input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location / Unit (e.g. Villa A-402, Army Estate Phase 2)"
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium"
            />
          </div>
          <input
            required
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Describe the incident or security observation clearly…"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold disabled:opacity-50"
            >
              {busy ? "Dispatching…" : "Send to Security Command"}
            </button>
          </div>
        </form>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No active alerts. All estate sectors clear." />
        {data &&
          groups.map((g) => {
            const rows = data.filter((a) => a.category === g.key);
            if (!rows.length) return null;
            return (
              <div key={g.key} className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase border ${g.badge}`}>
                    {g.label}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">({rows.length})</span>
                </div>
                <div className="space-y-2.5">
                  {rows.map((a) => (
                    <div
                      key={a.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-200/80 bg-white hover:border-[#B22222]/30 transition-all shadow-2xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={a.sender?.name ?? "Security"} src={a.sender?.avatar_url} size={40} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                              {a.message}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            <strong className="text-slate-700">{a.sender?.name ?? "Security Command"}</strong>
                            {a.location ? ` • ${a.location}` : ""} • {fmtClock(a.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                        {a.status === "resolved" ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Resolved</span>
                          </span>
                        ) : isStaff ? (
                          <button
                            type="button"
                            onClick={async () => {
                              await chatApi.resolveAlert(a.id);
                              await reload();
                              onChanged?.();
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#B22222] hover:bg-[#8F1A1A] transition-all shadow-2xs"
                          >
                            Mark Resolved
                          </button>
                        ) : (
                          <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
                            Active Dispatch
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ============================================================================
// 3. SPLIT-PANE CHANNELS & DIRECT MESSAGING WORKSPACE
// ============================================================================
function SplitChatWorkspace({ onChanged }: { onChanged?: () => void }) {
  const { data: rooms, error, loading, reload } = useLoad(() => chatApi.rooms());
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [picking, setPicking] = useState(false);

  // Auto-select first room on desktop once rooms load
  useEffect(() => {
    if (rooms && rooms.length > 0 && selectedRoomId === null) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [rooms, selectedRoomId]);

  useEffect(() => {
    const t = setInterval(() => void reload(), 15000);
    return () => clearInterval(t);
  }, [reload]);

  const activeRoom = useMemo(
    () => rooms?.find((r) => r.id === selectedRoomId) || null,
    [rooms, selectedRoomId]
  );

  const openRoom = (id: number) => {
    setSelectedRoomId(id);
    setMobileShowThread(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
      {/* Left Pane: Channels & Direct Conversations */}
      <div
        className={`lg:col-span-4 border-r border-slate-200/80 flex flex-col h-full overflow-hidden bg-slate-50/40 ${
          mobileShowThread ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-200/80 bg-white">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Channels &amp; Direct Chats</h2>
            <p className="text-[11px] text-slate-500">Select a channel or message a member</p>
          </div>
          <button
            type="button"
            onClick={() => setPicking((p) => !p)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{picking ? "Close" : "Direct"}</span>
          </button>
        </div>

        {picking && (
          <DirectoryPicker
            onPick={async (u) => {
              const r = await chatApi.openDirect(u.id);
              setPicking(false);
              await reload();
              openRoom(r.id);
            }}
          />
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          <State loading={loading} error={error} empty={!!rooms && rooms.length === 0} text="No channels available." />
          {rooms?.map((r: Room) => {
            const isSelected = r.id === selectedRoomId;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => openRoom(r.id)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors ${
                  isSelected
                    ? "bg-[#FEF2F2] border-l-4 border-l-[#B22222]"
                    : "bg-white hover:bg-slate-50"
                }`}
              >
                {r.type === "direct" ? (
                  <Avatar name={r.name} src={r.avatar_url} size={40} />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      r.type === "security"
                        ? "bg-slate-900 text-[#C9A227]"
                        : "bg-[#B22222]/10 text-[#B22222]"
                    }`}
                  >
                    <Hash className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="block truncate text-xs font-extrabold text-slate-900">{r.name}</span>
                    {r.last_message && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {fmtClock(r.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <p className="block truncate text-[11px] text-slate-500 mt-0.5">
                    {r.last_message?.body ?? r.subtitle ?? "Start conversation"}
                  </p>
                </div>
                {r.unread > 0 && (
                  <span className="rounded-full bg-[#B22222] px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                    {r.unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Pane: Active Conversation Thread */}
      <div
        className={`lg:col-span-8 flex flex-col h-full overflow-hidden bg-white ${
          mobileShowThread ? "flex" : "hidden lg:flex"
        }`}
      >
        {selectedRoomId !== null ? (
          <ConversationThread
            roomId={selectedRoomId}
            roomName={activeRoom?.name || "Conversation"}
            roomSubtitle={activeRoom?.subtitle || "Lincoln Estate Official Channel"}
            onBack={() => setMobileShowThread(false)}
            onSent={() => {
              void reload();
              onChanged?.();
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
            <Users className="w-10 h-10 mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-600">Select a Channel or Resident</p>
            <p className="text-xs mt-0.5">Choose a conversation on the left to read or send messages.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DirectoryPicker({ onPick }: { onPick: (u: UserBrief) => void }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserBrief[]>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      chatApi.directory(q).then(setUsers).catch(() => setUsers([]));
    }, 200);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="p-3 bg-slate-100/80 border-b border-slate-200 space-y-2">
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Find resident, officer, agent, or admin…"
          className="w-full rounded-xl border border-slate-200 bg-white pl-8 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
        />
      </div>
      <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 bg-white rounded-xl border border-slate-200">
        {users.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => onPick(u)}
            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar name={u.name} src={u.avatar_url} size={30} />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">{u.name}</div>
                {u.unit_number && <div className="text-[10px] text-slate-500">{u.unit_number}</div>}
              </div>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${roleBadgeStyle(u.role)}`}>
              {formatRoleLabel(u.role)}
            </span>
          </button>
        ))}
        {users.length === 0 && <p className="py-4 text-center text-xs text-slate-400">No directory match.</p>}
      </div>
    </div>
  );
}

function ConversationThread({
  roomId,
  roomName,
  roomSubtitle,
  onBack,
  onSent,
}: {
  roomId: number;
  roomName: string;
  roomSubtitle: string;
  onBack: () => void;
  onSent: () => void;
}) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);

  const pull = useCallback(async () => {
    try {
      const fresh = await chatApi.messages(roomId, lastId.current);
      if (fresh.length > 0) {
        lastId.current = Math.max(lastId.current, ...fresh.map((f) => f.id));
        setMsgs((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          const uniqueNew = fresh.filter((f) => !seen.has(f.id));
          return uniqueNew.length ? [...prev, ...uniqueNew] : prev;
        });
        chatApi.markRead(roomId).catch(() => {});
      }
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load messages");
    }
  }, [roomId]);

  useEffect(() => {
    lastId.current = 0;
    setMsgs([]);
    void pull();
    const t = setInterval(() => void pull(), 4500);
    return () => clearInterval(t);
  }, [pull]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try {
      const created = await chatApi.send(roomId, body);
      setText("");
      lastId.current = Math.max(lastId.current, created.id);
      setMsgs((prev) => (prev.some((p) => p.id === created.id) ? prev : [...prev, created]));
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Thread Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-200/80 bg-slate-50/50">
        <button
          type="button"
          aria-label="Back to channels"
          onClick={onBack}
          className="lg:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <h3 className="text-sm font-extrabold text-slate-900 truncate">{roomName}</h3>
          <p className="text-[11px] text-slate-500 truncate">{roomSubtitle}</p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
        {error && <p className="text-center text-xs text-red-600 font-semibold">{error}</p>}
        {msgs.length === 0 && !error && (
          <div className="py-16 text-center text-xs text-slate-400">
            No messages in <strong>{roomName}</strong> yet. Send the first message below.
          </div>
        )}
        {msgs.map((m) => (
          <Bubble key={m.id} m={m} mine={m.mine} />
        ))}
        <div ref={bottom} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="flex gap-2 p-3 sm:p-4 border-t border-slate-200/80 bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Message ${roomName}…`}
          maxLength={2000}
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B22222] focus:bg-white transition-all"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          aria-label="Send message"
          className="flex items-center justify-center gap-1.5 px-4 h-10 rounded-xl text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-xs"
          style={{ background: BRAND_CRIMSON }}
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

function Bubble({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <div className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
      <Avatar name={m.user.name} src={m.user.avatar_url} size={32} />
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs ${
          mine
            ? "bg-[#B22222] text-white shadow-xs"
            : "bg-white text-slate-900 border border-slate-200/80 shadow-2xs"
        }`}
      >
        <div className={`flex items-center gap-2 mb-1 ${mine ? "justify-end" : ""}`}>
          <span className={`text-[11px] font-bold ${mine ? "text-white/95" : "text-[#B22222]"}`}>
            {mine ? "You" : m.user.name}
          </span>
          <span
            className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase ${
              mine ? "bg-white/20 text-white" : roleBadgeStyle(m.user.role)
            }`}
          >
            {formatRoleLabel(m.user.role)}
          </span>
        </div>
        <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
        <div className={`mt-1 text-[10px] ${mine ? "text-white/75 text-right" : "text-slate-400"}`}>
          {fmtClock(m.created_at)}
        </div>
      </div>
    </div>
  );
}

"use client";

// The MEETING / ALERTS / CHAT panel - unified luxury design system for Lincoln Estate.
// Used on /resident/messages, /admin/messages, and /security/messages.
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Bell, Calendar, MessageSquare, Plus, Search, Send, ShieldAlert, CheckCircle2 } from "lucide-react";
import { readSession } from "@/components/auth/session";
import { chatApi, fmtClock, type EstateAlert, type MeetingReport, type Message, type Room, type UserBrief } from "@/lib/chat/api";
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
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}

export function ChatCenter({ initialTab = "CHAT", onChanged }: { initialTab?: Tab; onChanged?: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [roomId, setRoomId] = useState<number | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "CHAT", label: "Direct Messages", icon: <MessageSquare className="w-4 h-4" /> },
    { key: "ALERTS", label: "Security & Estate Alerts", icon: <ShieldAlert className="w-4 h-4" /> },
    { key: "MEETING", label: "Bulletins & Minutes", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-border/80 shadow-xs p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#C9A227]">
            <Bell className="w-3.5 h-3.5" />
            <span>Lincoln Estate Communications</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-dark tracking-tight mt-1">
            Messages &amp; Estate Notices
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-0.5">
            Real-time resident messaging, security dispatches, and executive council bulletins.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 self-start sm:self-auto">
          {tabs.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setRoomId(null); }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? "bg-[#B22222] text-white shadow-xs"
                    : "text-slate-600 hover:text-dark hover:bg-white/60"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Container */}
      <section className="flex h-[calc(100vh-14rem)] min-h-[540px] w-full flex-col overflow-hidden rounded-2xl border border-border/80 bg-white shadow-sm">
        {tab === "MEETING" && <MeetingList />}
        {tab === "ALERTS" && <AlertList onChanged={onChanged} />}
        {tab === "CHAT" && (roomId === null
          ? <RoomList onOpen={setRoomId} />
          : <Thread roomId={roomId} onBack={() => { setRoomId(null); onChanged?.(); }} />)}
      </section>
    </div>
  );
}

function State({ loading, error, empty, text }: { loading: boolean; error: string; empty: boolean; text: string }) {
  if (loading) return <div className="p-12 text-center text-sm font-semibold text-muted">Loading updates…</div>;
  if (error) return <div className="p-8 text-center text-sm font-semibold text-red-600">{error}</div>;
  if (empty) return <div className="p-12 text-center text-sm font-semibold text-muted">{text}</div>;
  return null;
}

// ---------------- MEETING & BULLETINS ----------------
function MeetingList() {
  const { data, error, loading, reload } = useLoad(() => chatApi.meetings());
  const [adding, setAdding] = useState(false);
  const role = readSession()?.role;
  const canAdd = role === "Admin" || role === "Security";
  const [form, setForm] = useState({ title: "", body: "" });
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setBusy(true);
    try {
      await chatApi.createMeeting(form);
      setForm({ title: "", body: "" });
      setAdding(false);
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/60">
        <div>
          <h2 className="text-base font-bold text-dark">Council Minutes &amp; Bulletins</h2>
          <p className="text-xs text-muted">Official resolutions and community notices published for residents</p>
        </div>
        {canAdd && (
          <button
            onClick={() => setAdding((a) => !a)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{adding ? "Cancel" : "Publish Bulletin"}</span>
          </button>
        )}
      </div>

      {adding && (
        <div className="p-5 border-b border-border bg-amber-50/40 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B22222]">Draft New Executive Bulletin</div>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Bulletin Title (e.g. Q4 Estate Security & Infrastructure Report)"
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
          />
          <textarea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Detailed resolutions, announcements, or meeting summary..."
            rows={4}
            className="w-full rounded-xl border border-border bg-white px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
          />
          <div className="flex justify-end gap-2">
            <button
              disabled={busy}
              onClick={save}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60 transition-colors shadow-xs"
              style={{ background: BRAND_CRIMSON }}
            >
              {busy ? "Publishing…" : "Publish Bulletin"}
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No estate bulletins published yet." />
        {data?.map((m: MeetingReport) => (
          <article key={m.id} className="p-6 hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-accent-light/80 text-[#856404] mb-2">
                  Official Notice
                </span>
                <h3 className="text-base font-bold text-dark">{m.title}</h3>
              </div>
              <time className="text-xs font-semibold text-muted shrink-0">{fmtClock(m.held_at)}</time>
            </div>
            <p className="mt-2 text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">{m.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

// ---------------- ALERTS ----------------
function AlertList({ onChanged }: { onChanged?: () => void }) {
  const { data, error, loading, reload } = useLoad(() => chatApi.alerts());
  const isStaff = ["Admin", "Security"].includes(readSession()?.role ?? "");
  useEffect(() => {
    chatApi.readAll("alert").then(() => onChanged?.()).catch(() => {});
  }, [onChanged]);

  const groups: { key: EstateAlert["category"]; label: string; badge: string }[] = [
    { key: "life_threat", label: "Priority & Safety Dispatches", badge: "bg-red-100 text-red-800" },
    { key: "intelligence", label: "Patrol & Intelligence Notices", badge: "bg-blue-100 text-blue-800" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/60">
        <div>
          <h2 className="text-base font-bold text-dark">Security &amp; Emergency Alerts</h2>
          <p className="text-xs text-muted">Live dispatch notifications from estate security control</p>
        </div>
        <button
          onClick={() => reload()}
          className="text-xs font-bold text-[#B22222] hover:underline"
        >
          Refresh Feed
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No active alerts. All sectors secure." />
        {data && groups.map((g) => {
          const rows = data.filter((a) => a.category === g.key);
          if (!rows.length) return null;
          return (
            <div key={g.key} className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${g.badge}`}>
                  {g.label}
                </span>
                <span className="text-xs text-muted">({rows.length})</span>
              </div>
              <div className="space-y-2.5">
                {rows.map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-white hover:border-[#B22222]/30 transition-all shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={a.sender?.name ?? "Security"} src={a.sender?.avatar_url} size={40} />
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-bold text-dark truncate">
                          {a.sender?.name ?? "Command Dispatch"}
                        </div>
                        <div className="text-xs text-muted truncate">
                          {a.location ? `${a.location} • ` : ""}{a.message}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                      {a.status === "resolved" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      ) : isStaff ? (
                        <button
                          onClick={async () => {
                            await chatApi.resolveAlert(a.id);
                            reload();
                          }}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-[#B22222] hover:bg-[#8F1A1A] transition-all shadow-2xs"
                        >
                          Mark Resolved
                        </button>
                      ) : (
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
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

// ---------------- CHAT ROOMS & MESSAGES ----------------
function RoomList({ onOpen }: { onOpen: (id: number) => void }) {
  const { data, error, loading, reload } = useLoad(() => chatApi.rooms());
  const [picking, setPicking] = useState(false);

  useEffect(() => {
    const t = setInterval(reload, 15000);
    return () => clearInterval(t);
  }, [reload]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-slate-50/60">
        <div>
          <h2 className="text-base font-bold text-dark">Resident &amp; Staff Conversations</h2>
          <p className="text-xs text-muted">Direct messaging with neighbors, security gate, and facility management</p>
        </div>
        <button
          onClick={() => setPicking((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B22222] text-white text-xs font-bold hover:bg-[#8F1A1A] transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{picking ? "Close" : "New Chat"}</span>
        </button>
      </div>

      {picking && (
        <Picker
          onPick={async (u) => {
            const r = await chatApi.openDirect(u.id);
            setPicking(false);
            onOpen(r.id);
          }}
        />
      )}

      <div className="flex-1 overflow-y-auto divide-y divide-border/60">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No conversation threads yet. Start a new chat!" />
        {data?.map((r: Room) => (
          <button
            key={r.id}
            onClick={() => onOpen(r.id)}
            className="flex w-full items-center gap-4 px-6 py-3.5 text-left hover:bg-slate-50 transition-colors"
          >
            <Avatar name={r.name} src={r.avatar_url} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="block truncate text-xs sm:text-sm font-bold text-dark">{r.name}</span>
                {r.last_message && (
                  <span className="text-[11px] text-muted shrink-0">{fmtClock(r.last_message.created_at)}</span>
                )}
              </div>
              <p className="block truncate text-xs text-muted mt-0.5">
                {r.last_message?.body ?? r.subtitle ?? "No messages yet"}
              </p>
            </div>
            {r.unread > 0 && (
              <span className="rounded-full bg-[#B22222] px-2 py-0.5 text-[10px] font-bold text-white shrink-0">
                {r.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Picker({ onPick }: { onPick: (u: UserBrief) => void }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserBrief[]>([]);
  useEffect(() => {
    const t = setTimeout(() => {
      chatApi.directory(q).then(setUsers).catch(() => setUsers([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="p-4 bg-slate-50 border-b border-border space-y-2">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search residents by name or unit number…"
          className="w-full rounded-xl border border-border bg-white pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222]"
        />
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-border/60 bg-white rounded-xl border border-border/80">
        {users.map((u) => (
          <button
            key={u.id}
            onClick={() => onPick(u)}
            className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 transition-colors"
          >
            <Avatar name={u.name} src={u.avatar_url} size={32} />
            <div className="text-xs">
              <span className="font-bold text-dark">{u.name}</span>
              {u.unit_number && <span className="ml-2 text-muted font-medium">House {u.unit_number}</span>}
            </div>
          </button>
        ))}
        {users.length === 0 && <p className="py-4 text-center text-xs text-muted">No estate members found.</p>}
      </div>
    </div>
  );
}

function Thread({ roomId, onBack }: { roomId: number; onBack: () => void }) {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const lastId = useRef(0);
  const bottom = useRef<HTMLDivElement>(null);

  const pull = useCallback(async () => {
    try {
      const fresh = await chatApi.messages(roomId, lastId.current);
      if (fresh.length) {
        lastId.current = fresh[fresh.length - 1].id;
        setMsgs((m) => [...m, ...fresh]);
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
    pull();
    const t = setInterval(pull, 4000);
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
      await chatApi.send(roomId, body);
      setText("");
      await pull();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-border bg-slate-50/60">
        <button
          aria-label="Back to chat list"
          onClick={onBack}
          className="p-1.5 rounded-lg text-muted hover:text-dark hover:bg-slate-200/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="text-sm font-bold text-dark">Active Conversation</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-6 bg-slate-50/30">
        {error && <p className="text-center text-xs text-red-600 font-semibold">{error}</p>}
        {msgs.length === 0 && (
          <div className="py-12 text-center text-xs text-muted">
            Send a message to start this conversation.
          </div>
        )}
        {msgs.map((m) => <Bubble key={m.id} m={m} mine={m.mine} />)}
        <div ref={bottom} />
      </div>

      <form onSubmit={submit} className="flex gap-2 p-3 sm:p-4 border-t border-border bg-white">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type an official message or inquiry…"
          maxLength={2000}
          className="flex-1 rounded-xl border border-border bg-slate-50/70 px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#B22222] focus:bg-white transition-all"
        />
        <button
          disabled={sending || !text.trim()}
          aria-label="Send"
          className="flex items-center justify-center w-10 h-10 rounded-xl text-white disabled:opacity-40 transition-colors shadow-xs"
          style={{ background: BRAND_CRIMSON }}
        >
          <Send className="w-4 h-4" />
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
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-xs ${
          mine
            ? "bg-[#B22222] text-white shadow-xs"
            : "bg-white text-dark border border-border shadow-2xs"
        }`}
      >
        {!mine && <div className="text-[11px] font-bold text-[#B22222] mb-0.5">{m.user.name}</div>}
        <div className="whitespace-pre-wrap break-words leading-relaxed">{m.body}</div>
        <div className={`mt-1 text-[10px] ${mine ? "text-white/80" : "text-muted"}`}>
          {fmtClock(m.created_at)}
        </div>
      </div>
    </div>
  );
}

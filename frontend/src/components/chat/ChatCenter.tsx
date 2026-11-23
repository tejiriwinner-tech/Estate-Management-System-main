"use client";

// The MEETING / ALERTS / CHAT panel from the overlay frames (1:4130, 1:4194, 1:4037), plus the
// conversation view and new-message picker. Used on /resident/messages and reusable by other roles.
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Plus, Send } from "lucide-react";
import { readSession } from "@/components/auth/session";
import { chatApi, fmtClock, type EstateAlert, type MeetingReport, type Message, type Room, type UserBrief } from "@/lib/chat/api";
import { Avatar } from "./Avatar";

type Tab = "MEETING" | "ALERTS" | "CHAT";
const GREEN = "#0ca348";

function useLoad<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(async () => {
    try { setData(await fn()); setError(""); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); } finally { setLoading(false); }
  }, deps);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, loading, reload };
}

export function ChatCenter({ initialTab = "CHAT", onChanged }: { initialTab?: Tab; onChanged?: () => void }) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [roomId, setRoomId] = useState<number | null>(null);

  return (
    <section className="mx-auto flex h-[calc(100vh-7rem)] min-h-[480px] w-full max-w-[558px] flex-col overflow-hidden bg-[#d9d9d9]">
      <div className="bg-[#cafad5]">
        <div className="flex justify-between px-6 py-3 text-2xl font-semibold" style={{ color: GREEN }}>
          {(["MEETING", "ALERTS", "CHAT"] as Tab[]).map((t) => (
            <button key={t} onClick={() => { setTab(t); setRoomId(null); }} aria-current={tab === t}
              className={`relative pb-1 ${tab === t ? "" : "opacity-90"}`}>
              {t}
              {tab === t && <span className="absolute inset-x-0 -bottom-3 h-1" style={{ background: GREEN }} />}
            </button>
          ))}
        </div>
      </div>
      {tab === "MEETING" && <MeetingList />}
      {tab === "ALERTS" && <AlertList onChanged={onChanged} />}
      {tab === "CHAT" && (roomId === null
        ? <RoomList onOpen={setRoomId} />
        : <Thread roomId={roomId} onBack={() => { setRoomId(null); onChanged?.(); }} />)}
    </section>
  );
}

function SubHeader({ title, hint, action }: { title: string; hint: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between bg-white px-5 py-3" style={{ color: GREEN }}>
      <div className="mx-auto text-center">
        <div className="text-2xl font-medium leading-tight">{title}</div>
        <div className="text-base font-medium">{hint}</div>
      </div>
      {action}
    </div>
  );
}

function State({ loading, error, empty, text }: { loading: boolean; error: string; empty: boolean; text: string }) {
  if (loading) return <p className="p-6 text-center text-sm text-[#9f9c9c]">Loading…</p>;
  if (error) return <p className="p-6 text-center text-sm text-[#ea4335]">{error}</p>;
  if (empty) return <p className="p-6 text-center text-sm text-[#9f9c9c]">{text}</p>;
  return null;
}

// ---------------- MEETING ----------------
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
    try { await chatApi.createMeeting(form); setForm({ title: "", body: "" }); setAdding(false); await reload(); } finally { setBusy(false); }
  };

  return (
    <>
      <SubHeader title="Meeting Reports" hint={canAdd ? "Add New Report" : "Latest reports"}
        action={canAdd ? <button aria-label="Add report" onClick={() => setAdding((a) => !a)} className="rounded bg-[#d9d9d9] p-1"><Plus className="h-5 w-5" /></button> : undefined} />
      {adding && (
        <div className="space-y-2 bg-white p-4">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border px-3 py-2 text-sm" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Report" rows={4} className="w-full border px-3 py-2 text-sm" />
          <button disabled={busy} onClick={save} className="rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60" style={{ background: GREEN }}>Save report</button>
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No meeting reports yet." />
        {data?.map((m: MeetingReport) => (
          <article key={m.id} className="border-b border-black bg-white px-6 py-4">
            <h3 className="text-base font-bold text-black">{m.title}</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-black">{m.body}</p>
            <time className="mt-2 block text-sm font-bold text-[#9f9c9c]">{fmtClock(m.held_at)}</time>
          </article>
        ))}
      </div>
    </>
  );
}

// ---------------- ALERTS ----------------
function AlertList({ onChanged }: { onChanged?: () => void }) {
  const { data, error, loading, reload } = useLoad(() => chatApi.alerts());
  const isStaff = ["Admin", "Security"].includes(readSession()?.role ?? "");
  useEffect(() => { chatApi.readAll("alert").then(() => onChanged?.()).catch(() => {}); }, [onChanged]);

  const groups: { key: EstateAlert["category"]; label: string }[] = [
    { key: "life_threat", label: "Life Threaten Alart" },
    { key: "intelligence", label: "Intelligent Report" },
  ];
  return (
    <>
      <SubHeader title="Alart List" hint="Show All" />
      <div className="flex-1 overflow-y-auto">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No alerts. All clear." />
        {data && groups.map((g) => {
          const rows = data.filter((a) => a.category === g.key);
          if (!rows.length) return null;
          return (
            <div key={g.key}>
              <h3 className="px-5 py-2 text-base font-medium text-black">{g.label}</h3>
              {rows.map((a) => (
                <div key={a.id} className="flex items-center gap-3 border-y border-black/25 bg-white px-4 py-3">
                  <Avatar name={a.sender?.name ?? "?"} src={a.sender?.avatar_url} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-medium text-black">{a.sender?.name ?? "Unknown"}</div>
                    <div className="truncate text-[13px] font-medium text-black/50">{a.location || a.message}</div>
                  </div>
                  {a.status === "resolved"
                    ? <span className="text-xs font-semibold text-[#9f9c9c]">Resolved</span>
                    : isStaff
                      ? <button onClick={async () => { await chatApi.resolveAlert(a.id); reload(); }} className="rounded-sm bg-[#f11] px-4 py-0.5 text-base font-bold text-white">View</button>
                      : <span className="text-xs font-semibold text-[#ea4335]">Open</span>}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------- CHAT ----------------
function RoomList({ onOpen }: { onOpen: (id: number) => void }) {
  const { data, error, loading, reload } = useLoad(() => chatApi.rooms());
  const [picking, setPicking] = useState(false);

  useEffect(() => { const t = setInterval(reload, 15000); return () => clearInterval(t); }, [reload]);

  return (
    <>
      <SubHeader title="Chat List" hint="Show All"
        action={<button aria-label="New message" onClick={() => setPicking((p) => !p)} className="rounded bg-[#d9d9d9] p-1"><Plus className="h-5 w-5" /></button>} />
      {picking && <Picker onPick={async (u) => { const r = await chatApi.openDirect(u.id); setPicking(false); onOpen(r.id); }} />}
      <div className="flex-1 overflow-y-auto">
        <State loading={loading} error={error} empty={!!data && data.length === 0} text="No conversations yet." />
        {data?.map((r: Room) => (
          <button key={r.id} onClick={() => onOpen(r.id)} className="flex w-full items-center gap-3 border-y border-black/25 bg-white px-4 py-3 text-left">
            <Avatar name={r.name} src={r.avatar_url} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-base font-medium text-black">{r.name}</span>
              <span className="block truncate text-[13px] font-medium text-black/50">{r.last_message?.body ?? r.subtitle ?? "No messages yet"}</span>
            </span>
            {r.unread > 0 && <span className="rounded-full bg-[#ea4335] px-2 text-xs font-semibold text-white">{r.unread}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

function Picker({ onPick }: { onPick: (u: UserBrief) => void }) {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserBrief[]>([]);
  useEffect(() => {
    const t = setTimeout(() => { chatApi.directory(q).then(setUsers).catch(() => setUsers([])); }, 250);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div className="max-h-56 overflow-y-auto bg-white p-3">
      <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search residents…" className="mb-2 w-full border px-3 py-2 text-sm" />
      {users.map((u) => (
        <button key={u.id} onClick={() => onPick(u)} className="flex w-full items-center gap-3 px-2 py-2 text-left hover:bg-[#f4fdf6]">
          <Avatar name={u.name} src={u.avatar_url} size={34} />
          <span className="text-sm font-medium text-black">{u.name}{u.unit_number ? <span className="ml-2 text-black/50">House {u.unit_number}</span> : null}</span>
        </button>
      ))}
      {users.length === 0 && <p className="py-2 text-center text-sm text-[#9f9c9c]">No one found.</p>}
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
    } catch (e) { setError(e instanceof Error ? e.message : "Could not load messages"); }
  }, [roomId]);

  useEffect(() => { lastId.current = 0; setMsgs([]); pull(); const t = setInterval(pull, 4000); return () => clearInterval(t); }, [pull]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    try { await chatApi.send(roomId, body); setText(""); await pull(); } catch (err) { setError(err instanceof Error ? err.message : "Send failed"); } finally { setSending(false); }
  };

  return (
    <>
      <div className="flex items-center gap-3 bg-white px-4 py-3" style={{ color: GREEN }}>
        <button aria-label="Back to chat list" onClick={onBack}><ArrowLeft className="h-6 w-6" /></button>
        <span className="text-lg font-medium">Conversation</span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {error && <p className="text-center text-sm text-[#ea4335]">{error}</p>}
        {msgs.map((m) => <Bubble key={m.id} m={m} mine={m.mine} />)}
        <div ref={bottom} />
      </div>
      <form onSubmit={submit} className="flex gap-2 bg-white p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" maxLength={2000} className="flex-1 border px-3 py-2 text-sm" />
        <button disabled={sending || !text.trim()} aria-label="Send" className="rounded px-4 text-white disabled:opacity-50" style={{ background: GREEN }}><Send className="h-5 w-5" /></button>
      </form>
    </>
  );
}

function Bubble({ m, mine }: { m: Message; mine: boolean }) {
  return (
    <div className={`flex gap-2 ${mine ? "flex-row-reverse" : ""}`}>
      <Avatar name={m.user.name} src={m.user.avatar_url} size={32} />
      <div className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${mine ? "bg-[#0ca348] text-white" : "bg-white text-black"}`}>
        {!mine && <div className="text-xs font-semibold" style={{ color: GREEN }}>{m.user.name}</div>}
        <div className="whitespace-pre-wrap break-words">{m.body}</div>
        <div className={`mt-1 text-[11px] ${mine ? "text-white/80" : "text-[#9f9c9c]"}`}>{fmtClock(m.created_at)}</div>
      </div>
    </div>
  );
}

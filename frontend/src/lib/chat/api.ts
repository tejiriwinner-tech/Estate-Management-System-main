import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readSession()?.token;
  const res = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const first = json?.errors ? Object.values<string[]>(json.errors)[0]?.[0] : undefined;
    throw new Error(first || json?.message || `Request failed (${res.status})`);
  }
  return (json.data ?? json) as T;
}
const post = <T,>(path: string, body?: unknown) => call<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

export interface UserBrief { id: number; name: string; unit_number: string | null; avatar_url: string | null; role: string }
export interface Room {
  id: number; type: "estate" | "security" | "direct"; name: string; subtitle: string | null; avatar_url: string | null;
  other_user_id: number | null; unread: number;
  last_message: { body: string; created_at: string; from: string | null } | null;
}
export interface Message { id: number; room_id: number; body: string; created_at: string; mine: boolean; user: UserBrief }
export interface AppNotification { id: number; type: string; title: string; body: string | null; data: Record<string, unknown> | null; read: boolean; created_at: string }
export interface Summary { unread_messages: number; unread_alerts: number; unread_total: number }
export interface EstateAlert { id: number; category: "life_threat" | "intelligence"; message: string; location: string | null; status: string; created_at: string; sender: UserBrief | null }
export interface MeetingReport { id: number; title: string; body: string; held_at: string | null }

export const chatApi = {
  rooms: () => call<Room[]>("/chat/rooms"),
  directory: (q = "") => call<UserBrief[]>(`/chat/directory?q=${encodeURIComponent(q)}`),
  openDirect: (user_id: number) => post<{ id: number }>("/chat/direct", { user_id }),
  messages: (roomId: number, afterId = 0) => call<Message[]>(`/chat/rooms/${roomId}/messages${afterId ? `?after_id=${afterId}` : ""}`),
  send: (roomId: number, body: string) => post<Message>(`/chat/rooms/${roomId}/messages`, { body }),
  markRead: (roomId: number) => post<{ ok: boolean }>(`/chat/rooms/${roomId}/read`),
  summary: () => call<Summary>("/notifications/summary"),
  notifications: () => call<{ unread_count: number; items: AppNotification[] }>("/notifications"),
  readNotification: (id: number) => post<{ ok: boolean }>(`/notifications/${id}/read`),
  readAll: (type?: string) => post<{ ok: boolean }>(`/notifications/read-all${type ? `?type=${type}` : ""}`),
  alerts: () => call<EstateAlert[]>("/alerts"),
  createAlert: (b: { category: EstateAlert["category"]; message: string; location?: string }) => post<{ id: number }>("/alerts", b),
  resolveAlert: (id: number) => post<{ ok: boolean }>(`/alerts/${id}/resolve`),
  meetings: () => call<MeetingReport[]>("/meetings"),
  createMeeting: (b: { title: string; body: string; held_at?: string }) => post<{ id: number }>("/meetings", b),
};

export const fmtClock = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }).toLowerCase() : "";

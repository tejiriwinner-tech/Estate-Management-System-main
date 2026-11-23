import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function residentFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readSession()?.token;
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  const res = await fetch(`${API}/resident${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(isForm ? {} : { "Content-Type": "application/json" }),
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

export const send = <T,>(path: string, method: "POST" | "PUT" | "DELETE", body?: unknown) =>
  residentFetch<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });

// ---- types (field names follow the Figma tables) ----
export interface Reminder { id: number; text: string; due_time: string | null; is_completed: boolean }
export interface EstateUpdate { headline_prefix: string; headline_highlight: string; image_url: string; lead_paragraph: string; body_paragraph: string; published_at: string | null }
export interface DashboardData { neighbors: number; total_paid: number; family_activities: number; reminders: Reminder[]; estate_update: EstateUpdate | null }
export interface Profile {
  id: number; name: string; email: string; phone: string | null; unit_number: string | null; avatar_url: string | null;
  resident_code: string; about: string | null;
  settings: { sms_notifications: boolean; email_notifications: boolean; members_can_chat: boolean };
}
export interface FamilyMember { id: number; name: string; role_in_family: string; age: number | null; gender: string | null }
export interface Property { id: number; type: string; name: string; property_number: string; sector: string | null; unit_type: string | null; ownership_status: string | null; colour: string | null; others: string | null; status: string }
export interface Activity { id: number; name: string; out_at: string | null; out_with: string | null; in_at: string | null; in_with: string | null }

export const fmtTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }).toLowerCase() : "-";
export const naira = (n: number) => "NGN " + n.toLocaleString("en-NG");

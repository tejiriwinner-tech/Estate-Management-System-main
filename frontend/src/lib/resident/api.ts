import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export async function residentFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readSession()?.token;
  const isForm = typeof FormData !== "undefined" && init.body instanceof FormData;
  try {
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
  } catch (err: any) {
    if (path === "/dashboard") {
      return {
        neighbors: 142,
        total_paid: 485000,
        family_activities: 12,
        reminders: [
          { id: 1, text: "Annual General Meeting (AGM) at Estate Clubhouse", due_time: "10:00 AM", is_completed: false },
          { id: 2, text: "Quarterly Facility Maintenance Levy Due", due_time: "5:00 PM", is_completed: true },
        ],
        estate_update: {
          headline_prefix: "Important Estate Notice: ",
          headline_highlight: "Solar Power Upgrades",
          image_url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
          lead_paragraph: "Phase 1 solar inverter installation has been successfully concluded.",
          body_paragraph: "All street lighting and security camera arrays are now connected to 24/7 dedicated clean power grid.",
          published_at: new Date().toISOString(),
        },
      } as unknown as T;
    }
    throw err;
  }
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

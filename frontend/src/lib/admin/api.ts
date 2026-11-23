import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface Paged<T> { data: T[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }

/** Admin API call. Sends the Sanctum token when signed in; throws Error with the server's message. */
export async function adminFetch<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
  const token = readSession()?.token;
  const res = await fetch(`${API}/admin${path}`, {
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
  return json as T;
}

export interface AdminUser {
  id: number; name: string; email: string; phone: string | null; role: string; status: string;
  unit_number: string | null; moved_in_at: string | null; created_at: string | null; avatar_url: string | null;
}

export const adminUsers = {
  list: (q: { search?: string; role?: string; status?: string; per_page?: number; page?: number } = {}) => {
    const qs = new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)]));
    return adminFetch<Paged<AdminUser>>(`/users?${qs}`);
  },
  stats: () =>
    adminFetch<{
      status: string;
      data: {
        total_users: number;
        pending_approval: number;
        blocked_accounts: number;
        active_staff: number;
      };
    }>("/users/stats"),
  create: (b: { name: string; email: string; role: string; unit_number?: string; moved_in_at?: string; phone?: string; job_title?: string; staff_id?: string }) =>
    adminFetch<{ data: AdminUser }>("/users", { method: "POST", body: JSON.stringify(b) }),
  update: (id: number, b: Partial<AdminUser>) =>
    adminFetch<{ data: AdminUser }>(`/users/${id}`, { method: "PUT", body: JSON.stringify(b) }),
  toggleStatus: (id: number) =>
    adminFetch<{ data: AdminUser }>(`/users/${id}/toggle-status`, { method: "PATCH" }),
  approve: (id: number) =>
    adminFetch<{ data: AdminUser }>(`/users/${id}/approve`, { method: "POST" }),
  reject: (id: number) =>
    adminFetch<{ data: AdminUser }>(`/users/${id}/reject`, { method: "POST" }),
  remove: (id: number) => adminFetch<unknown>(`/users/${id}`, { method: "DELETE" }),
};

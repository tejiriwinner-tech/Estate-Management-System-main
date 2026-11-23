import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Authenticated JSON call for the agent admin dashboard and the agent portal. Returns the full body. */
export async function agentsFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
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
  return json as T;
}

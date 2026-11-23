"use client";

import { useCallback, useEffect, useState } from "react";
import { readSession } from "@/components/auth/session";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

/** Finance API call. Sends the Sanctum token; throws Error with the server's message. */
export async function financeFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
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

/** Loads `path` once (and on reload). `pick` extracts the part of the JSON the page needs. */
export function useFinance<T, R = T>(path: string, empty: R, pick: (json: T) => R = (j) => (j as unknown as { data: R }).data) {
  const [data, setData] = useState<R>(empty);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reload = useCallback(async () => {
    try {
      setData(pick(await financeFetch<T>(path)));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{message}</div>;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { securityFetch } from "./api";

/** GET a security endpoint and keep the result, with a reload() for after writes. */
export function useSecurityData<T>(path: string, empty: T) {
  const emptyRef = useRef(empty);
  const [data, setData] = useState<T>(emptyRef.current);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      setData(await securityFetch<T>(path));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}

export function SecurityError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">
      {message}
    </div>
  );
}

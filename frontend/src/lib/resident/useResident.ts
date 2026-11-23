"use client";

import { useCallback, useEffect, useState } from "react";
import { residentFetch } from "./api";

/** Loads a resident endpoint. `reload()` refetches after a change. */
export function useResident<T>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await residentFetch<T>(path));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load.");
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => { void reload(); }, [reload]);
  return { data, error, loading, reload };
}

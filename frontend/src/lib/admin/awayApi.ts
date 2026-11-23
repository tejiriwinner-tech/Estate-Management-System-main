"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "./api";
import type {
  AwayMetricCard, AwayResidentRecord, AwaySavePayload, MobileActiveAwayLogItem, MobileAwayMetric,
  ResidentSelectOption, UpcomingReturnItem,
} from "@/types/admin/away";

export interface AwayOverview {
  metrics: AwayMetricCard[];
  residents: AwayResidentRecord[];
  upcoming: UpcomingReturnItem[];
  mobileMetrics: MobileAwayMetric[];
  mobileLogs: MobileActiveAwayLogItem[];
  options: ResidentSelectOption[];
}

const EMPTY: AwayOverview = { metrics: [], residents: [], upcoming: [], mobileMetrics: [], mobileLogs: [], options: [] };

export function useAway() {
  const [data, setData] = useState<AwayOverview>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData((await adminFetch<{ data: AwayOverview }>("/away")).data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load away notices.");
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  /** Create (no id) or update; refreshes afterwards. Throws so forms can show the server's message. */
  const save = useCallback(async (payload: AwaySavePayload, id?: number) => {
    await adminFetch(id ? `/away/${id}` : "/away", { method: id ? "PUT" : "POST", body: JSON.stringify(payload) });
    await load();
  }, [load]);

  const markReturned = useCallback(async (id: number) => {
    await adminFetch(`/away/${id}/returned`, { method: "POST" });
    await load();
  }, [load]);

  return { data, error, save, markReturned };
}

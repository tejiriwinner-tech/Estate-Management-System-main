"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "./api";
import type { AccessLogItem, AccessMetricCard, MobileAccessLogCardItem, SecuritySummaryData } from "@/types/admin/access";

export interface AccessOverview {
  metrics: AccessMetricCard[];
  logs: AccessLogItem[];
  summary: SecuritySummaryData;
  mobileLogs: MobileAccessLogCardItem[];
}

export const EMPTY_ACCESS: AccessOverview = {
  metrics: [
    { id: "total-checkins", label: "TOTAL CHECK-INS", value: "0", iconType: "checkin" },
    { id: "total-checkouts", label: "TOTAL CHECK-OUTS", value: "0", iconType: "checkout" },
    { id: "residents-inside", label: "RESIDENTS INSIDE", value: "0", iconType: "residents" },
    { id: "visitors-inside", label: "VISITORS INSIDE", value: "0", iconType: "visitors" },
  ],
  logs: [],
  summary: { vehicles_entered: 0, pedestrians: 0, alert_title: "No incidents", alert_description: "", incidents: [], active_personnel: [], extra_personnel_count: 0 },
  mobileLogs: [],
};

/** Loads the check-in/out overview for today | yesterday | week and refreshes every 20s. */
export function useAccessOverview(range: "today" | "yesterday" | "week") {
  const [data, setData] = useState<AccessOverview>(EMPTY_ACCESS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const res = await adminFetch<{ data: AccessOverview }>(`/access?range=${range}`);
      setData(res.data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load access data.");
    } finally {
      setLoading(false);
    }
  }, [range]);
  useEffect(() => {
    void load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [load]);
  return { data, error, loading };
}

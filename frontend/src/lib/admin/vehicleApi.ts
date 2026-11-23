"use client";

import { useCallback, useEffect, useState } from "react";
import { adminFetch } from "./api";
import type {
  MobileScannerItem, MobileVehicleDirectoryItem, MobileVehicleMetric, ScannerFeed, VehicleMetricItem, VehicleOwnerRole,
  VehicleRecord, VehicleStatus,
} from "@/types/admin/vehicle";

export interface VehicleOverview {
  metrics: VehicleMetricItem[];
  vehicles: VehicleRecord[];
  scanners: (ScannerFeed & { last_ping: string; online: boolean })[];
  mobileMetrics: MobileVehicleMetric[];
  mobileDirectory: MobileVehicleDirectoryItem[];
}

const EMPTY: VehicleOverview = { metrics: [], vehicles: [], scanners: [], mobileMetrics: [], mobileDirectory: [] };

export function useVehicles() {
  const [data, setData] = useState<VehicleOverview>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData((await adminFetch<{ data: VehicleOverview }>("/vehicles")).data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load vehicles.");
    }
  }, []);
  useEffect(() => {
    void load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  // Runs a change, refreshes, and reports failures through `error`.
  const run = useCallback(async (fn: () => Promise<unknown>) => {
    try { await fn(); await load(); } catch (e) { setError(e instanceof Error ? e.message : "That change failed."); }
  }, [load]);

  return {
    data, error, reload: load,
    add: (v: { owner_name: string; owner_role: VehicleOwnerRole; house_unit?: string; vehicle_type: string; plate_number: string; status: VehicleStatus }) =>
      run(() => adminFetch("/vehicles", { method: "POST", body: JSON.stringify(v) })),
    patch: (id: number, b: { status?: VehicleStatus; owner_role?: VehicleOwnerRole }) =>
      run(() => adminFetch(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(b) })),
    remove: (id: number) => run(() => adminFetch(`/vehicles/${id}`, { method: "DELETE" })),
    setScannerEnabled: (id: string, enabled: boolean) =>
      run(() => adminFetch(`/scanners/${id}`, { method: "PATCH", body: JSON.stringify({ enabled }) })),
  };
}

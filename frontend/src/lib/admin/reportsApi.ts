"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "./api";
import type {
  ReportKpiMetric, MonthlyRevenuePoint, ServiceRevenueShare, YearlyRevenueBar, CollectionStatusData,
  DefaulterItem, MobileReportKpiItem, MobileRevenueTrendBar, MobileRevenueCategoryItem,
  MobileGeneratedReportItem, LifeThreatAlertItem, IntelligenceReportItem,
} from "@/types/admin/reports";

export interface AdminReportsData {
  kpis: ReportKpiMetric[];
  monthlyRevenue: MonthlyRevenuePoint[];
  serviceShares: ServiceRevenueShare[];
  yearlyBars: YearlyRevenueBar[];
  collection: CollectionStatusData;
  defaulters: DefaulterItem[];
  mobileKpis: MobileReportKpiItem[];
  mobileTrendBars: MobileRevenueTrendBar[];
  mobileCategories: MobileRevenueCategoryItem[];
  generatedReports: MobileGeneratedReportItem[];
  lifeThreatAlerts: LifeThreatAlertItem[];
  lifeThreatTotal: number;
  intelligenceReports: IntelligenceReportItem[];
}

const EMPTY: AdminReportsData = {
  kpis: [], monthlyRevenue: [], serviceShares: [], yearlyBars: [],
  collection: { statusLabel: "NO DATA", paidPercentage: 0, paidAmountLabel: "₦0", outstandingAmountLabel: "₦0", outstandingPercentage: 0 },
  defaulters: [], mobileKpis: [], mobileTrendBars: [], mobileCategories: [], generatedReports: [],
  lifeThreatAlerts: [], lifeThreatTotal: 0, intelligenceReports: [],
};

export function useAdminReports() {
  const [data, setData] = useState<AdminReportsData>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let live = true;
    adminFetch<{ data: AdminReportsData }>("/reports")
      .then((r) => { if (live) { setData(r.data); setError(null); } })
      .catch((e) => { if (live) setError(e instanceof Error ? e.message : "Could not load reports."); });
    return () => { live = false; };
  }, []);
  return { data, error };
}

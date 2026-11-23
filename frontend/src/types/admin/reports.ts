export type ReportPeriod = "This Month" | "Last Month" | "This Year";

export interface ReportKpiMetric {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trendDirection: "up" | "stable" | "down";
  iconType: "collection" | "revenue" | "top_service" | "laggard";
}

export interface MonthlyRevenuePoint {
  month: string;
  valueM: number; // in Millions of Naira, e.g., 0.6 -> ₦0.6M
  showMarker?: boolean;
}

export interface ServiceRevenueShare {
  id: string;
  name: string;
  percentage: number;
  dotColorClass: string;
  strokeColor: string;
}

export interface YearlyRevenueBar {
  year: string;
  valueM: number; // in Millions of Naira, e.g., 15.4 -> ₦15.4M
}

export interface DefaulterItem {
  id: number;
  resident_name: string;
  unit: string;
  service: string;
  amount_due: string;
  days_overdue: number;
}

export interface CollectionStatusData {
  statusLabel: string;
  paidPercentage: number;
  paidAmountLabel: string;
  outstandingAmountLabel: string;
  outstandingPercentage: number;
}

export interface MobileReportKpiItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  subtextType: "growth" | "warning";
  iconType: "revenue" | "leased" | "dues";
}

export interface MobileRevenueTrendBar {
  month: string;
  heightPct: number;
  amountLabel: string;
  opacityClass: string;
}

export interface MobileRevenueCategoryItem {
  id: string;
  name: string;
  amountLabel: string;
  fillPct: number;
  barColorClass: string;
}

export interface MobileGeneratedReportItem {
  id: number;
  title: string;
  meta: string; // e.g., 'PDF • Jun 30, 2024'
  fileName: string;
}

export interface LifeThreatAlertItem {
  id: number;
  name: string;
  house_number: string;
  date: string;
}

export interface IntelligenceReportItem {
  id: number;
  name: string;
  house_number: string;
  date: string;
  summary: string;
}

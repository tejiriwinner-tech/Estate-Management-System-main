// ─── Payment Analytics Types (Task 16) ───────────────────────────────────────

export type AnalyticsIconType =
  | "collection"
  | "revenue"
  | "top_service"
  | "laggard";

export type AnalyticsTrendType = "up" | "down" | "neutral";

export interface AnalyticsKpiCard {
  id: string;
  label: string;
  value: string;
  subtext: string;
  trendType: AnalyticsTrendType;
  iconType: AnalyticsIconType;
}

export interface MonthlyRevenuePoint {
  month: string;
  amount: number; // in millions (e.g. 0.8 = ₦0.8M)
}

export interface ServiceBreakdownItem {
  name: string;
  percentage: number;
  color: string;
}

export interface YearlyRevenuePoint {
  year: string;
  amount: number; // in millions (e.g. 8.2 = ₦8.2M)
}

export interface CollectionStatusData {
  statusLabel: string;
  collectionPercentage: number;
  paidAmount: string;
  paidPercentage: number;
  outstandingAmount: string;
  outstandingPercentage: number;
}

export interface PaymentAnalyticsData {
  kpis: AnalyticsKpiCard[];
  monthlyRevenueTrend: MonthlyRevenuePoint[];
  revenueByService: ServiceBreakdownItem[];
  yearlyRevenueTrend: YearlyRevenuePoint[];
  collectionStatus: CollectionStatusData;
}

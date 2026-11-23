export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  subtitleType: "trend-up" | "trend-down" | "neutral" | "warning";
  icon: "wallet" | "calendar" | "chart" | "hourglass" | "check" | "alert";
  badgeBg: string;
  iconColor: string;
}

export interface RevenueHistoryPoint {
  month: string;
  amount: number;
}

export interface ServiceShare {
  name: string;
  value: number;
  color: string;
}

export interface RevenueBreakdownItem {
  id: string;
  serviceName: string;
  icon: "security" | "waste" | "electricity" | "water" | "maintenance";
  iconBg: string;
  iconColor: string;
  totalAmount: number;
  totalPayments: number;
  balanceDue: number;
  collectionRate: number;
}

export interface FinanceOverviewData {
  metrics: MetricCardData[];
  revenueHistory: RevenueHistoryPoint[];
  revenueByService: ServiceShare[];
  breakdowns: RevenueBreakdownItem[];
}

export interface MobileMetric {
  id: string;
  label: string;
  value: string;
  accentColor: "emerald" | "amber" | "rose";
  icon: "wallet" | "flag" | "briefcase";
  badgeType: "trend" | "radial" | "action";
  badgeValue?: string;
  badgeLabel?: string;
  actionText?: string;
}

export interface MobileTrendMonth {
  month: string;
  value: number;
  isSelected?: boolean;
}

export interface MobileTransaction {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  type: "income" | "expense";
  status: "PAID" | "PROCESSING" | "DEFAULT";
  icon: "home" | "wrench" | "building" | "user" | "car";
}

export interface MobileDashboardData {
  greetingName: string;
  metrics: MobileMetric[];
  trendMonths: MobileTrendMonth[];
  recentTransactions: MobileTransaction[];
}

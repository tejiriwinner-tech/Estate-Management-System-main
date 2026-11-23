// ─── Service Management Types (Task 18) ──────────────────────────────────────

export type ServiceFrequency = "Monthly" | "Quarterly" | "Yearly" | "One-Time";

export type ServiceStatus = "Active" | "Inactive";

export interface EstateServiceItem {
  id: string;
  name: string;
  category: string;
  fee: number;
  frequency: ServiceFrequency;
  status: ServiceStatus;
  dateCreated: string;
}

export interface ServiceSummaryKpis {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  expectedRevenue: string;
}

export interface ServiceManagementData {
  kpis: ServiceSummaryKpis;
  services: EstateServiceItem[];
  forecastText: string;
  quickTipText: string;
}

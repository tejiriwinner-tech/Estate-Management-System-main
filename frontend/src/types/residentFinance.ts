// ─── Resident Finance Summary Types (Task 15) ────────────────────────────────

export interface ResidentProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  unit: string;
  street: string;
  phone: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface ResidentKPIs {
  totalPaid: number;
  outstandingBalance: number;
  lastPaymentDate: string;
  activeServicesCount: number;
}

export type TimelineServiceIcon = "security" | "waste" | "utility";

export interface TimelinePaymentItem {
  id: string;
  serviceName: string;
  invoiceNumber: string;
  iconType: TimelineServiceIcon;
  amount: number;
  date: string;
  status: "PAID" | "PENDING";
}

export interface OutstandingBillItem {
  id: string;
  title: string;
  dueDate: string;
  amount: number;
  daysOverdue: number;
  status: "OVERDUE" | "DUE_SOON";
}

export interface BillingPreferences {
  preferredMethod: string;
  billingFrequency: string;
  autoPayStatus: "Enabled" | "Disabled";
  documentName: string;
  documentUrl: string;
}

export interface ResidentFinanceSummaryData {
  profile: ResidentProfile;
  kpis: ResidentKPIs;
  paymentTimeline: TimelinePaymentItem[];
  outstandingBills: OutstandingBillItem[];
  nextBillingNotice: string;
  preferences: BillingPreferences;
}

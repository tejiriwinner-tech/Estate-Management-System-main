// ─── Outstanding Payments Types ─────────────────────────────────────────────

export type OutstandingStatus = "overdue" | "pending" | "partial";

export interface OutstandingPayment {
  id: string;
  residentId?: string;
  residentName: string;
  residentAvatar?: string;
  propertyAddress: string;
  serviceType: string;
  amountDue: number;
  amountPaid: number;
  dueDate: string;
  daysOverdue: number; // 0 = pending (not yet overdue), >0 = days past due
  status: OutstandingStatus;
  invoiceNumber: string;
}

export interface OutstandingSummaryMetrics {
  totalOutstanding: number;
  overdueCount: number;
  pendingCount: number;
  partialCount: number;
}

export interface OutstandingFilterState {
  serviceType: string;
  status: string;
  sortBy: "dueDate" | "amount" | "daysOverdue" | "name";
}

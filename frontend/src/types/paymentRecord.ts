export type PaymentStatus = "Paid" | "Pending" | "Overdue";
export type PaymentMethod = "Bank Transfer" | "Credit Card" | "Cash" | "Paystack" | "USSD";

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // e.g. #REC-9021
  residentName: string;
  residentAvatar?: string;
  property: string; // e.g. House 42, Maple St.
  servicePaid: string; // e.g. Security Fee
  amount: number;
  date: string; // e.g. Oct 12, 2024
  method: PaymentMethod;
  status: PaymentStatus;
}

export interface PaymentSummaryMetrics {
  totalRevenue: number;
  paidItems: number;
  pendingItems: number;
  overdueItems: number;
}

export interface PaymentFilterState {
  month: string;
  year: string;
  service: string;
  status: string;
  search: string;
}

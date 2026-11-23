export interface PaystackServiceMetrics {
  planCode: string;
  totalSubscribers: number;
  paidCount: number;
  overdueCount: number;
  totalCollected: number;
  totalExpected: number;
  collectionRate: number; // percentage (0 - 100)
  lastSettlementDate: string;
  status: 'active' | 'synced' | 'pending';
}

export interface EstateServiceBillingItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  paymentSchedule: 'Monthly' | 'Weekly' | '3 Weeks' | 'Quarterly' | 'Yearly';
  subText?: string;
  paystack: PaystackServiceMetrics;
}

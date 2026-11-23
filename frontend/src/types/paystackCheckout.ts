// ─── Paystack Checkout & Payment Types (Task 19) ─────────────────────────────

export type PaymentTypeIcon = "trash" | "water" | "electricity" | "security";

export interface PaymentTypeItem {
  id: string;
  type: string;
  amount: number;
  schedule: "Monthly" | "Quarterly" | "Yearly";
  paid: number;
  balance: number;
  iconType: PaymentTypeIcon;
  receiptId: string;
}

export type PaystackChannel = "card" | "bank_transfer" | "ussd";

export interface PaystackTransactionPayload {
  paymentTypeId: string;
  paymentTypeName: string;
  email: string;
  residentName: string;
  amount: number;
  reference: string;
  channel: PaystackChannel;
}

export interface ReceiptLineItem {
  id: string;
  serviceDescription: string;
  subDescription?: string;
  billingPeriod: string;
  amount: number;
}

export interface PaymentReceiptData {
  receiptNumber: string; // e.g. RE-2023-88421
  status: "Payment Success" | "Pending" | "Failed";
  residentName: string;
  residentEmail: string;
  residentPhone?: string;
  propertyName: string;
  estatePhase: string;
  lineItems: ReceiptLineItem[];
  totalAmount: number;
  paymentMethod: string; // e.g. Visa ending in •••• 4492
  transactionDate: string; // e.g. October 14, 2023 | 09:42 AM
  generatedBy: string; // e.g. Fin-System v4.0 (Auth: LV)
  qrVerificationUrl: string;
  authorizationStampText: string; // e.g. LINCOLN APPROVED
  disclaimer: string;
}

import { PaymentTypeItem } from "@/types/paystackCheckout";

export const mockPaymentTypes: PaymentTypeItem[] = [
  {
    id: "PT-01",
    type: "Trash Disposal",
    amount: 5000,
    schedule: "Monthly",
    paid: 5000,
    balance: 0.0,
    iconType: "trash",
    receiptId: "RE-2024-5001",
  },
  {
    id: "PT-02",
    type: "Water Bill",
    amount: 5000,
    schedule: "Monthly",
    paid: 5000,
    balance: 0.0,
    iconType: "water",
    receiptId: "RE-2024-5002",
  },
  {
    id: "PT-03",
    type: "AEDC Bill",
    amount: 5000,
    schedule: "Monthly",
    paid: 5000,
    balance: 0.0,
    iconType: "electricity",
    receiptId: "RE-2024-5003",
  },
  {
    id: "PT-04",
    type: "Security Bill",
    amount: 5000,
    schedule: "Monthly",
    paid: 5000,
    balance: 0.0,
    iconType: "security",
    receiptId: "RE-2024-5004",
  },
];

export type PaymentChannel = 'card' | 'bank' | 'gtb_737' | 'mobile_money' | 'visa_qr';

export interface CardFormData {
  cardNumber: string;
  cardExpiry: string;
  cvv: string;
  pin?: string;
}

export interface BankFormData {
  selectedBank: string;
  accountNumber: string;
  bankName: string;
  expiresInMinutes: number;
}

export interface USSDFormData {
  bankCode: string;
  bankName: string;
  dialCode: string;
}

export interface MobileMoneyFormData {
  phoneNumber: string;
  provider: 'MTN MoMo' | 'Airtel Money';
}

export interface PaystackBillItem {
  id: string;
  serviceName: string;
  category: string;
  amount: number;
  residentEmail: string;
  residentUnit: string;
}

export interface TransactionReceipt {
  reference: string;
  amount: number;
  paidAt: string;
  channel: PaymentChannel;
  serviceName: string;
  residentEmail: string;
  residentUnit: string;
  status: 'success';
}

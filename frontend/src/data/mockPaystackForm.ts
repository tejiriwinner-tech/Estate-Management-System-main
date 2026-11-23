import { PaystackBillItem } from '@/types/paystackForm';

export const mockPaystackBills: PaystackBillItem[] = [
  {
    id: 'bill-sec-01',
    serviceName: 'Security Bill',
    category: 'Estate Security',
    amount: 5000,
    residentEmail: 'demo@paystack.com',
    residentUnit: 'LEHN125',
  },
  {
    id: 'bill-elec-02',
    serviceName: 'Electricity bill',
    category: 'Power & Utilities',
    amount: 5000,
    residentEmail: 'demo@paystack.com',
    residentUnit: 'LEHN125',
  },
  {
    id: 'bill-trsh-03',
    serviceName: 'Trash Disposal',
    category: 'Waste Management',
    amount: 5000,
    residentEmail: 'demo@paystack.com',
    residentUnit: 'LEHN125',
  },
  {
    id: 'bill-gas-04',
    serviceName: 'Gas',
    category: 'Piped Cooking Gas',
    amount: 6000,
    residentEmail: 'demo@paystack.com',
    residentUnit: 'LEHN125',
  },
  {
    id: 'bill-ins-05',
    serviceName: 'Weekly Security Tranche',
    category: 'Installment Plan',
    amount: 1250,
    residentEmail: 'demo@paystack.com',
    residentUnit: 'LEHN125',
  },
];

export const demoTestCards = [
  { label: 'Mastercard (Success)', number: '5399 8344 1234 5678', expiry: '12/28', cvv: '412', brand: 'mastercard' },
  { label: 'Visa (Success)', number: '4084 0840 8408 4084', expiry: '09/27', cvv: '123', brand: 'visa' },
  { label: 'Verve (Domestic)', number: '5061 0987 6543 2109', expiry: '11/26', cvv: '891', brand: 'verve' },
];

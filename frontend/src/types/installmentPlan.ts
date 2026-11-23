export type InstallmentStatus = 'paid' | 'processing' | 'default';
export type ComplianceTerm = 'utd' | 'nutd'; // utd = up to date, nutd = not up to date

export interface InstallmentMilestone {
  installmentNumber: number; // 1, 2, 3, 4
  amount: number; // 1250
  dueDate: string;
  status: 'settled' | 'pending' | 'overdue';
  paidDate?: string;
  transactionRef?: string;
}

export interface InstallmentPlanItem {
  id: string;
  unitCode: string; // e.g. "LEHN125" (Security Bill)
  residentName: string;
  billType: string; // "Security Bill"
  monthTerm: ComplianceTerm; // "utd" or "nutd"
  totalBill: number; // 5000
  totalPaid: number; // 5000 or 0
  installmentAmount: number; // 1250 (4 installments of 1250)
  status: InstallmentStatus; // 'paid' | 'processing' | 'default'
  milestones: InstallmentMilestone[];
  paystackPlanCode: string;
  lastPaymentDate?: string;
}

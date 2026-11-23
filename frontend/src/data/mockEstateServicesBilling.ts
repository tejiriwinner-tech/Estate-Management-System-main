import { EstateServiceBillingItem } from '@/types/estateServicesBilling';

export const mockEstateServicesBilling: EstateServiceBillingItem[] = [
  {
    id: 'esb-001',
    name: 'Trash Disposal',
    category: 'Waste Management',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: 'Residential general refuse collection',
    paystack: {
      planCode: 'PLN_trsh_8291a',
      totalSubscribers: 284,
      paidCount: 262,
      overdueCount: 22,
      totalCollected: 1310000,
      totalExpected: 1420000,
      collectionRate: 92.25,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-002',
    name: 'Electricity bill',
    category: 'Power & Utilities',
    cost: 5000,
    paymentSchedule: 'Weekly',
    subText: 'Generator fuel surcharge & grid supplement',
    paystack: {
      planCode: 'PLN_elec_7182b',
      totalSubscribers: 310,
      paidCount: 295,
      overdueCount: 15,
      totalCollected: 1475000,
      totalExpected: 1550000,
      collectionRate: 95.16,
      lastSettlementDate: '2024-11-08',
      status: 'active'
    }
  },
  {
    id: 'esb-003',
    name: 'Trash Disposal',
    category: 'Recycling & Sort',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: 'Plastic, metal & hazardous waste sorting',
    paystack: {
      planCode: 'PLN_trsh_9381c',
      totalSubscribers: 198,
      paidCount: 178,
      overdueCount: 20,
      totalCollected: 890000,
      totalExpected: 990000,
      collectionRate: 89.9,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-004',
    name: 'Security Bill',
    category: 'Estate Security',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: '24/7 Armed patrol, CCTV & biometric gate',
    paystack: {
      planCode: 'PLN_sec_4102d',
      totalSubscribers: 340,
      paidCount: 332,
      overdueCount: 8,
      totalCollected: 1660000,
      totalExpected: 1700000,
      collectionRate: 97.64,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-005',
    name: 'Trash Disposal',
    category: 'Green Waste & Lawn',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: 'Lawn clippings & tree branch disposal',
    paystack: {
      planCode: 'PLN_trsh_3392e',
      totalSubscribers: 142,
      paidCount: 128,
      overdueCount: 14,
      totalCollected: 640000,
      totalExpected: 710000,
      collectionRate: 90.14,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-006',
    name: 'Trash Disposal',
    category: 'Commercial Hub',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: 'Commercial strip & market plaza bin clearance',
    paystack: {
      planCode: 'PLN_trsh_5510f',
      totalSubscribers: 46,
      paidCount: 44,
      overdueCount: 2,
      totalCollected: 220000,
      totalExpected: 230000,
      collectionRate: 95.65,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-007',
    name: 'Trash Disposal',
    category: 'Zone B Cluster',
    cost: 5000,
    paymentSchedule: 'Monthly',
    subText: 'Outer boundary duplexes waste haulage',
    paystack: {
      planCode: 'PLN_trsh_6621g',
      totalSubscribers: 115,
      paidCount: 104,
      overdueCount: 11,
      totalCollected: 520000,
      totalExpected: 575000,
      collectionRate: 90.43,
      lastSettlementDate: '2024-11-01',
      status: 'active'
    }
  },
  {
    id: 'esb-008',
    name: 'Gas',
    category: 'Piped Cooking Gas',
    cost: 6000,
    paymentSchedule: '3 Weeks',
    subText: 'Centralized LPG pipeline metered replenishment',
    paystack: {
      planCode: 'PLN_gas_9901h',
      totalSubscribers: 220,
      paidCount: 198,
      overdueCount: 22,
      totalCollected: 1188000,
      totalExpected: 1320000,
      collectionRate: 90.0,
      lastSettlementDate: '2024-10-24',
      status: 'active'
    }
  }
];

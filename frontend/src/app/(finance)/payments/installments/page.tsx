'use client';

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import { InstallmentsTable } from '@/components/installments/InstallmentsTable';
import { InstallmentDetailModal } from '@/components/installments/InstallmentDetailModal';
import { PaystackPaymentTriggerModal } from '@/components/installments/PaystackPaymentTriggerModal';
import { mockInstallmentPlans } from '@/data/mockInstallmentPlans';
import { InstallmentPlanItem, InstallmentStatus, ComplianceTerm } from '@/types/installmentPlan';

export default function InstallmentPaymentsPage() {
  const [items, setItems] = useState<InstallmentPlanItem[]>(mockInstallmentPlans);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [termFilter, setTermFilter] = useState<string>('All');
  const [selectedDetailItem, setSelectedDetailItem] = useState<InstallmentPlanItem | null>(null);
  const [selectedTriggerItem, setSelectedTriggerItem] = useState<InstallmentPlanItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handlePaymentSuccess = (itemId: string) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === itemId) {
          return {
            ...it,
            totalPaid: it.totalBill,
            status: 'paid' as InstallmentStatus,
            monthTerm: 'utd' as ComplianceTerm,
            milestones: it.milestones.map((m) => ({
              ...m,
              status: 'settled',
              paidDate: new Date().toISOString().split('T')[0],
              transactionRef: `PST_MANUAL_${Math.floor(1000 + Math.random() * 9000)}`
            }))
          };
        }
        return it;
      })
    );
    showToast(`Payment verified for unit! Status updated to Paid.`);
  };

  // Filtered dataset
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = 
        item.unitCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.billType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'All' || 
        (statusFilter === 'Default' ? item.status === 'default' : item.status === statusFilter.toLowerCase());

      const matchesTerm = 
        termFilter === 'All' || item.monthTerm === termFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesTerm;
    });
  }, [items, searchQuery, statusFilter, termFilter]);

  // Aggregate stats
  const totalVolume = items.reduce((acc, it) => acc + it.totalPaid, 0);
  const paidCount = items.filter((it) => it.status === 'paid').length;
  const processingCount = items.filter((it) => it.status === 'processing').length;
  const defaultCount = items.filter((it) => it.status === 'default').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B22222] uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-[#C9A227]" />
            <span>Paystack Billing & Installment Tracker</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Security Bill Installment Ledger
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Monitor resident tranche schedules (₦1,250/tranche towards ₦5,000 bill), month compliance (UTD/NUTD), and Paystack settlement.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setItems(mockInstallmentPlans);
              showToast('Refreshed installment synchronization status with Paystack.');
            }}
            className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm hover:shadow transition-all flex items-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
            <span>Sync Paystack Webhooks</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Units */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gray-50 border border-gray-200/60 flex items-center justify-center flex-shrink-0 text-[#B22222]">
            <Layers className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Active Plans
            </span>
            <span className="text-xl sm:text-2xl font-bold text-gray-900">{items.length} Units</span>
            <span className="text-[10px] text-gray-400 block font-medium">₦1,250 weekly tranches</span>
          </div>
        </div>

        {/* Collected Volume */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
            <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Total Paid Inflow
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-800">
              ₦{totalVolume.toLocaleString()}
            </span>
            <span className="text-[10px] text-emerald-600 block font-medium">{paidCount} units fully settled</span>
          </div>
        </div>

        {/* In Processing */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Processing Gateway
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-700">{processingCount} Units</span>
            <span className="text-[10px] text-amber-600 block font-medium">Final tranche awaiting webhook</span>
          </div>
        </div>

        {/* Defaulted */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Defaulted (NUTD)
            </span>
            <span className="text-xl sm:text-2xl font-bold text-rose-700">{defaultCount} Unit</span>
            <span className="text-[10px] text-rose-600 block font-medium">Requires reminder dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Installment Plans Directory
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Breakdown of Security Bill collections, month compliance status, and Paystack settlement actions.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 bg-gray-100 text-gray-700 rounded-lg">
              Showing {filteredItems.length} of {items.length} units
            </span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by unit (e.g. LEHN125) or name..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#B22222]/20 focus:border-[#B22222] transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-gray-500 font-medium flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {['All', 'Paid', 'Processing', 'Default'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  statusFilter === tab
                    ? 'bg-[#B22222] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab}
              </button>
            ))}

            <span className="text-xs text-gray-300">|</span>

            {['All', 'UTD', 'NUTD'].map((t) => (
              <button
                key={t}
                onClick={() => setTermFilter(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  termFilter === t
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table & Mobile Cards */}
        <InstallmentsTable
          items={filteredItems}
          onViewDetails={(item) => setSelectedDetailItem(item)}
          onPaystackAction={(item) => setSelectedTriggerItem(item)}
        />
      </div>

      {/* Modals */}
      <InstallmentDetailModal
        item={selectedDetailItem}
        isOpen={!!selectedDetailItem}
        onClose={() => setSelectedDetailItem(null)}
      />

      <PaystackPaymentTriggerModal
        item={selectedTriggerItem}
        isOpen={!!selectedTriggerItem}
        onClose={() => setSelectedTriggerItem(null)}
        onPaymentSuccess={handlePaymentSuccess}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1A1A1A] text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center space-x-2 animate-fadeIn border border-[#C9A227]/30">
          <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

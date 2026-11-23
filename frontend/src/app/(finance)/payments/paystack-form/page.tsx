'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Sparkles, 
  Tag, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { PaystackCheckoutCard } from '@/components/paystack/PaystackCheckoutCard';
import { mockPaystackBills } from '@/data/mockPaystackForm';
import { PaystackBillItem, TransactionReceipt } from '@/types/paystackForm';

export default function PaystackCheckoutFormPage() {
  const [selectedBill, setSelectedBill] = useState<PaystackBillItem>(mockPaystackBills[0]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSuccess = (receipt: TransactionReceipt) => {
    showToast(`Payment of ₦${receipt.amount.toLocaleString()} confirmed via ${receipt.channel.toUpperCase()}!`);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#B22222] uppercase tracking-wider mb-1">
            <CreditCard className="w-4 h-4 text-[#C9A227]" />
            <span>Paystack Inline Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Paystack Checkout Form
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Multi-channel secure checkout supporting Cards, Bank Transfers, GTB 737 USSD, Mobile Money, and Visa QR.
          </p>
        </div>

        {/* Dynamic Fetch Notice for Group Repo */}
        <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200/60 rounded-xl text-xs text-blue-700">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span>Dynamic API ready for group repo merge</span>
        </div>
      </div>

      {/* Bill Preset Selector Chips */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#C9A227]" /> Select Bill to Test Checkout:
          </span>
          <span className="text-gray-400">Current Unit: <strong>{selectedBill.residentUnit}</strong></span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {mockPaystackBills.map((bill) => {
            const isSelected = selectedBill.id === bill.id;
            return (
              <button
                key={bill.id}
                type="button"
                onClick={() => setSelectedBill(bill)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#B22222] bg-[#B22222]/5 text-[#B22222] ring-2 ring-[#B22222]/20 shadow-xs'
                    : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                }`}
              >
                <span className="text-xs font-bold block truncate">{bill.serviceName}</span>
                <span className="text-[11px] text-gray-400 block">{bill.category}</span>
                <span className="text-sm font-extrabold text-gray-900 mt-1 block">
                  ₦{bill.amount.toLocaleString()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* The Iconic Paystack Checkout Card */}
      <PaystackCheckoutCard
        bill={selectedBill}
        onSuccess={handleSuccess}
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

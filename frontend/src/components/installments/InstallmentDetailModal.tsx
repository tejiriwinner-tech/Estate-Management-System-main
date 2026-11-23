'use client';

import React from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard, 
  Calendar, 
  Hash, 
  User 
} from 'lucide-react';
import { InstallmentPlanItem } from '@/types/installmentPlan';

interface InstallmentDetailModalProps {
  item: InstallmentPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InstallmentDetailModal: React.FC<InstallmentDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !item) return null;

  const settledCount = item.milestones.filter((m) => m.status === 'settled').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#B22222]/20 border border-[#B22222]/40 flex items-center justify-center text-[#C9A227]">
              <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">{item.unitCode}</h3>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                  item.status === 'paid'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : item.status === 'processing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}>
                  {item.status}
                </span>
              </div>
              <p className="text-xs text-gray-400">{item.billType} • {item.residentName}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold block">Total Bill</span>
              <span className="text-sm font-bold text-gray-900">₦{item.totalBill.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
              <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Total Paid</span>
              <span className="text-sm font-bold text-emerald-800">₦{item.totalPaid.toLocaleString()}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
              <span className="text-[10px] text-blue-700 uppercase font-semibold block">Installments</span>
              <span className="text-sm font-bold text-blue-800">{settledCount}/4 Paid</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1.5">
              <span>Installment Schedule Completion</span>
              <span className="font-bold text-gray-900">{((settledCount / 4) * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  item.status === 'paid' ? 'bg-emerald-500' : item.status === 'processing' ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${(settledCount / 4) * 100}%` }}
              />
            </div>
          </div>

          {/* 4 Installment Milestones List */}
          <div className="space-y-2.5">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
              4-Part Installment Milestones (₦{item.installmentAmount.toLocaleString()} / tranche)
            </span>

            {item.milestones.map((ms) => (
              <div 
                key={ms.installmentNumber}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  ms.status === 'settled'
                    ? 'bg-emerald-50/50 border-emerald-100'
                    : ms.status === 'pending'
                    ? 'bg-amber-50/50 border-amber-100'
                    : 'bg-rose-50/50 border-rose-100'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                    ms.status === 'settled'
                      ? 'bg-emerald-600 text-white'
                      : ms.status === 'pending'
                      ? 'bg-amber-500 text-white'
                      : 'bg-rose-600 text-white'
                  }`}>
                    {ms.installmentNumber}
                  </div>
                  <div>
                    <span className="font-semibold text-gray-900 block">
                      Tranche #{ms.installmentNumber}: ₦{ms.amount.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      Due: {ms.dueDate} {ms.paidDate && `• Paid: ${ms.paidDate}`}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                    ms.status === 'settled'
                      ? 'bg-emerald-100 text-emerald-800'
                      : ms.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {ms.status}
                  </span>
                  {ms.transactionRef && (
                    <span className="text-[10px] font-mono text-gray-400 block mt-0.5">
                      {ms.transactionRef}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Paystack Plan Meta */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center justify-between">
            <span>Paystack Recurring Plan:</span>
            <code className="font-mono font-bold text-gray-700 bg-gray-200/60 px-2 py-0.5 rounded">
              {item.paystackPlanCode}
            </code>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};

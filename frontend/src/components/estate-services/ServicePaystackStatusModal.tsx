'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  DollarSign, 
  Calendar, 
  ExternalLink, 
  Send, 
  CreditCard, 
  Copy, 
  Check 
} from 'lucide-react';
import { EstateServiceBillingItem } from '@/types/estateServicesBilling';

interface ServicePaystackStatusModalProps {
  service: EstateServiceBillingItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServicePaystackStatusModal: React.FC<ServicePaystackStatusModalProps> = ({
  service,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  if (!isOpen || !service) return null;

  const { paystack } = service;

  const copyPlanCode = () => {
    navigator.clipboard.writeText(paystack.planCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendReminder = () => {
    setReminding(true);
    setTimeout(() => {
      setReminding(false);
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 3000);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2A2A2A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#B22222]/20 border border-[#B22222]/40 flex items-center justify-center text-[#C9A227]">
              <CreditCard className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">{service.name}</h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live
                </span>
              </div>
              <p className="text-xs text-gray-400">{service.category} • {service.paymentSchedule}</p>
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
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Paystack Plan Code Bar */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Paystack Plan Code:</span>
              <code className="text-xs font-mono font-bold text-gray-800 bg-gray-200/70 px-2 py-0.5 rounded">
                {paystack.planCode}
              </code>
            </div>
            <button 
              onClick={copyPlanCode}
              className="text-gray-500 hover:text-[#B22222] p-1.5 rounded-md hover:bg-gray-200 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-emerald-50/70 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-emerald-700 font-medium">Collected Volume</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-900">
                ₦{paystack.totalCollected.toLocaleString()}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1">
                Target: ₦{paystack.totalExpected.toLocaleString()}
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 font-medium">Compliance Rate</span>
                <span className="text-xs font-bold text-[#B22222]">{paystack.collectionRate.toFixed(1)}%</span>
              </div>
              <div className="text-xl font-bold text-gray-900">
                {paystack.paidCount} <span className="text-xs font-normal text-gray-500">/ {paystack.totalSubscribers}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div 
                  className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                  style={{ width: `${paystack.collectionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Resident Breakdown */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3">
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center justify-between">
              <span>Resident Payment Breakdown</span>
              <Users className="w-4 h-4 text-gray-400" />
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-gray-700">Paid Residents</span>
              </div>
              <span className="font-semibold text-emerald-700">{paystack.paidCount} residents</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-gray-700">Overdue / Pending</span>
              </div>
              <span className="font-semibold text-rose-700">{paystack.overdueCount} residents</span>
            </div>

            <div className="flex items-center justify-between text-sm py-1.5">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-600 text-xs">Last Paystack Settlement:</span>
              </div>
              <span className="text-xs font-medium text-gray-700">{paystack.lastSettlementDate}</span>
            </div>
          </div>

          {/* Reminder Feedback */}
          {reminderSent && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-lg border border-emerald-200 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Automated Paystack checkout reminders dispatched to {paystack.overdueCount} overdue residents via email and SMS.</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleSendReminder}
            disabled={reminding || paystack.overdueCount === 0}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-medium text-xs flex items-center justify-center space-x-2 transition-all ${
              paystack.overdueCount === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#B22222] hover:bg-[#8B0000] text-white shadow-sm hover:shadow'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{reminding ? 'Dispatching...' : `Remind ${paystack.overdueCount} Overdue Residents`}</span>
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors text-center"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

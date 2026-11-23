'use client';

import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ExternalLink, 
  CheckCircle2, 
  Send, 
  Copy, 
  Check, 
  DollarSign, 
  ShieldCheck 
} from 'lucide-react';
import { InstallmentPlanItem } from '@/types/installmentPlan';

interface PaystackPaymentTriggerModalProps {
  item: InstallmentPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (itemId: string) => void;
}

export const PaystackPaymentTriggerModal: React.FC<PaystackPaymentTriggerModalProps> = ({
  item,
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  if (!isOpen || !item) return null;

  const checkoutUrl = `https://checkout.paystack.com/pay/${item.paystackPlanCode}?unit=${item.unitCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(checkoutUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        onPaymentSuccess(item.id);
        onClose();
        setPaymentDone(false);
      }, 1500);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#B22222] text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Paystack Checkout Action</h3>
              <p className="text-xs text-red-100">{item.unitCode} • {item.billType}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Resident Name:</span>
              <span className="font-bold text-gray-800">{item.residentName}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Installment Rate:</span>
              <span className="font-bold text-gray-800">₦{item.installmentAmount.toLocaleString()} / cycle</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Current Status:</span>
              <span className={`font-bold uppercase text-[11px] ${
                item.status === 'paid' ? 'text-emerald-600' : item.status === 'processing' ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {item.status}
              </span>
            </div>
          </div>

          {/* Checkout URL Box */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Direct Paystack Payment Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={checkoutUrl}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-600 truncate focus:outline-none"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-1 flex-shrink-0 transition-colors"
                title="Copy Payment Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Success Alert */}
          {paymentDone && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center space-x-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Installment payment verified via Paystack Webhook! Status updated to Paid.</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={handleSimulatePayment}
              disabled={isProcessing || paymentDone || item.status === 'paid'}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                item.status === 'paid'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>
                {item.status === 'paid'
                  ? 'Installment Already Fully Paid'
                  : isProcessing
                  ? 'Verifying Paystack Gateway...'
                  : `Simulate Paystack Settlement (₦${item.installmentAmount.toLocaleString()})`}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

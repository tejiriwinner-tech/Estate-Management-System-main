'use client';

import React from 'react';
import { CheckCircle2, Download, Printer, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { TransactionReceipt } from '@/types/paystackForm';

interface PaystackSuccessModalProps {
  receipt: TransactionReceipt | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaystackSuccessModal: React.FC<PaystackSuccessModalProps> = ({
  receipt,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !receipt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Banner */}
        <div className="bg-emerald-600 text-white p-6 text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3 border border-white/30 animate-scaleUp">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white">Payment Successful</h3>
          <p className="text-xs text-emerald-100 mt-1">Verified via Paystack Gateway</p>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-4">
          <div className="text-center py-2 border-b border-gray-100">
            <span className="text-xs text-gray-400 uppercase font-semibold">Total Amount Paid</span>
            <div className="text-3xl font-extrabold text-gray-900 mt-0.5">
              ₦{receipt.amount.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-gray-500">
              <span>Service:</span>
              <span className="font-bold text-gray-900">{receipt.serviceName}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Resident Unit:</span>
              <span className="font-bold text-gray-900">{receipt.residentUnit}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Email:</span>
              <span className="font-semibold text-gray-700">{receipt.residentEmail}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Transaction Ref:</span>
              <code className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-0.5 rounded">
                {receipt.reference}
              </code>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Channel:</span>
              <span className="font-semibold text-gray-700 uppercase">{receipt.channel}</span>
            </div>
            <div className="flex items-center justify-between text-gray-500">
              <span>Date & Time:</span>
              <span className="text-gray-700">{new Date(receipt.paidAt).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-xs font-semibold text-gray-700 flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { Landmark, Copy, Check, Clock, AlertCircle } from 'lucide-react';

interface PayWithBankProps {
  amount: number;
}

export const PayWithBank: React.FC<PayWithBankProps> = ({ amount }) => {
  const [copied, setCopied] = useState(false);
  const accountNumber = '9928104821';
  const bankName = 'Wema Bank (Paystack Reserve)';

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          Transfer to Dedicated Virtual Account
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Send the exact amount to this temporary bank account to complete payment.
        </p>
      </div>

      <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 space-y-3">
        <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold">
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-emerald-600 animate-pulse" />
            Account expires in 29:45
          </span>
          <span className="text-[11px] bg-emerald-200/60 px-2 py-0.5 rounded-full font-bold">
            Live Settlement
          </span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-emerald-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Bank Name</span>
            <span className="text-xs font-bold text-gray-900">{bankName}</span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Account Number</span>
            <div className="flex items-center space-x-2">
              <span className="text-base font-mono font-bold text-gray-900 tracking-wider">
                {accountNumber}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                title="Copy Account Number"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <span className="text-xs text-gray-500 font-medium">Amount to Transfer</span>
            <span className="text-sm font-bold text-emerald-700">
              ₦{amount.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-[11px] text-gray-500 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <span>
          Your payment will automatically be confirmed within 60 seconds of transfer completion. Please do not close this window.
        </span>
      </div>
    </div>
  );
};

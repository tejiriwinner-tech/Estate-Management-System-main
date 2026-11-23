'use client';

import React, { useState } from 'react';
import { Smartphone, CheckCircle2 } from 'lucide-react';

interface PayWithMobileMoneyProps {
  amount: number;
}

export const PayWithMobileMoney: React.FC<PayWithMobileMoneyProps> = ({ amount }) => {
  const [phone, setPhone] = useState('0803 123 4567');
  const [provider, setProvider] = useState<'MTN MoMo' | 'Airtel Money'>('MTN MoMo');

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          Pay with Mobile Money
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Enter your mobile money wallet number to receive an authorization prompt.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
            Network Provider
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['MTN MoMo', 'Airtel Money'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all ${
                  provider === p
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="border border-gray-300 rounded-xl p-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all bg-white">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            WALLET PHONE NUMBER
          </label>
          <div className="flex items-center space-x-2">
            <Smartphone className="w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0800 000 0000"
              className="w-full text-base font-mono font-medium text-gray-800 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

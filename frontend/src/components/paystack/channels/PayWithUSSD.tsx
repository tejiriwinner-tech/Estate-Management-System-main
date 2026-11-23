'use client';

import React, { useState } from 'react';
import { Smartphone, Copy, Check, PhoneCall } from 'lucide-react';

interface PayWithUSSDProps {
  amount: number;
}

export const PayWithUSSD: React.FC<PayWithUSSDProps> = ({ amount }) => {
  const [copied, setCopied] = useState(false);
  const [selectedBank, setSelectedBank] = useState('GTBank');

  const ussdCodes: Record<string, string> = {
    'GTBank': `*737*2*${amount}*8291#`,
    'Zenith Bank': `*966*000*8291#`,
    'Access Bank': `*901*000*8291#`,
    'UBA': `*919*00*8291#`,
  };

  const activeCode = ussdCodes[selectedBank] || ussdCodes['GTBank'];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          Pay with GTB 737 / USSD
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Select your bank and dial the USSD code on the mobile line linked to your account.
        </p>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
          Choose Bank
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(ussdCodes).map((bank) => (
            <button
              key={bank}
              type="button"
              onClick={() => setSelectedBank(bank)}
              className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all ${
                selectedBank === bank
                  ? 'border-emerald-500 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {bank}
            </button>
          ))}
        </div>
      </div>

      {/* Generated Code */}
      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 text-center space-y-2">
        <span className="text-[11px] font-semibold text-gray-500 uppercase">Dial Code on your phone:</span>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl sm:text-2xl font-mono font-bold text-gray-900 tracking-wider">
            {activeCode}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 transition-colors shadow-2xs"
            title="Copy USSD Code"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-400">Authenticate with your banking PIN when prompted on phone.</p>
      </div>
    </div>
  );
};

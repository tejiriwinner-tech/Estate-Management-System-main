'use client';

import React from 'react';
import { QrCode, Smartphone, CheckCircle2 } from 'lucide-react';

interface PayWithQRProps {
  amount: number;
}

export const PayWithQR: React.FC<PayWithQRProps> = ({ amount }) => {
  return (
    <div className="space-y-5 text-center animate-fadeIn">
      <div>
        <h3 className="text-lg font-bold text-gray-800">
          Scan Visa QR Code
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Open your banking or mobile wallet app and scan the QR code to pay.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl border border-gray-200">
        {/* Visual QR Code Box */}
        <div className="w-44 h-44 bg-white p-3 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center relative">
          <QrCode className="w-36 h-36 text-gray-900" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center text-white text-[10px] font-bold shadow-md">
              P
            </div>
          </div>
        </div>

        <span className="text-xs font-bold text-gray-700 mt-3">
          Pay exact amount: <strong className="text-emerald-700 font-extrabold">₦{amount.toLocaleString()}</strong>
        </span>
        <span className="text-[11px] text-gray-400 mt-0.5">Valid for 15 minutes</span>
      </div>
    </div>
  );
};

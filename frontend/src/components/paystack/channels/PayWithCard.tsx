'use client';

import React, { useState } from 'react';
import { CreditCard, HelpCircle, Check, Sparkles } from 'lucide-react';
import { CardFormData } from '@/types/paystackForm';
import { demoTestCards } from '@/data/mockPaystackForm';

interface PayWithCardProps {
  cardData: CardFormData;
  onChange: (data: CardFormData) => void;
  amount: number;
}

export const PayWithCard: React.FC<PayWithCardProps> = ({
  cardData,
  onChange,
  amount,
}) => {
  const [showCvvHelp, setShowCvvHelp] = useState(false);

  // Auto-format card number into 4-digit chunks
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    let formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    onChange({ ...cardData, cardNumber: formatted });
  };

  // Auto-format expiry MM / YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      onChange({ ...cardData, cardExpiry: `${raw.slice(0, 2)} / ${raw.slice(2)}` });
    } else {
      onChange({ ...cardData, cardExpiry: raw });
    }
  };

  // CVV format 3 or 4 digits
  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({ ...cardData, cvv: raw });
  };

  // Card brand detection
  const getCardBrand = (num: string) => {
    const clean = num.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'VISA';
    if (clean.startsWith('5')) return 'MASTERCARD';
    if (clean.startsWith('506') || clean.startsWith('650')) return 'VERVE';
    return null;
  };

  const cardBrand = getCardBrand(cardData.cardNumber);

  const fillTestCard = (testCard: typeof demoTestCards[0]) => {
    onChange({
      cardNumber: testCard.number,
      cardExpiry: testCard.expiry,
      cvv: testCard.cvv,
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Wireframe Headline */}
      <div className="text-center sm:text-left">
        <h3 className="text-lg font-bold text-gray-800">
          Enter your card details to pay
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          Secured by Paystack 256-bit SSL encryption
        </p>
      </div>

      {/* Test Card Quick Fill Chips */}
      <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between overflow-x-auto text-xs">
        <span className="text-[11px] font-semibold text-gray-500 uppercase flex items-center gap-1 flex-shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" /> Demo Test Cards:
        </span>
        <div className="flex items-center space-x-1.5 ml-2">
          {demoTestCards.map((tc) => (
            <button
              key={tc.brand}
              type="button"
              onClick={() => fillTestCard(tc)}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-lg text-[11px] font-semibold text-gray-700 flex-shrink-0 shadow-2xs transition-colors"
            >
              {tc.brand.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Card Input Form */}
      <div className="space-y-4">
        {/* CARD NUMBER */}
        <div className="relative border border-gray-300 rounded-xl p-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all bg-white">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            CARD NUMBER
          </label>
          <div className="flex items-center justify-between">
            <input
              type="text"
              required
              value={cardData.cardNumber}
              onChange={handleCardNumberChange}
              placeholder="0000 0000 0000 0000"
              className="w-full text-base sm:text-lg font-mono font-medium text-gray-800 placeholder-gray-300 focus:outline-none"
            />
            {cardBrand ? (
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wider ${
                cardBrand === 'VISA' ? 'bg-blue-100 text-blue-800' : cardBrand === 'MASTERCARD' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
              }`}>
                {cardBrand}
              </span>
            ) : (
              <CreditCard className="w-5 h-5 text-gray-300 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* CARD EXPIRY & CVV */}
        <div className="grid grid-cols-2 gap-3">
          {/* EXPIRY */}
          <div className="border border-gray-300 rounded-xl p-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all bg-white">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
              CARD EXPIRY
            </label>
            <input
              type="text"
              required
              value={cardData.cardExpiry}
              onChange={handleExpiryChange}
              placeholder="MM / YY"
              className="w-full text-base sm:text-lg font-mono font-medium text-gray-800 placeholder-gray-300 focus:outline-none"
            />
          </div>

          {/* CVV */}
          <div className="relative border border-gray-300 rounded-xl p-3 focus-within:border-[#10B981] focus-within:ring-2 focus-within:ring-[#10B981]/20 transition-all bg-white">
            <div className="flex items-center justify-between mb-0.5">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                CVV
              </label>
              <button
                type="button"
                onClick={() => setShowCvvHelp(!showCvvHelp)}
                className="text-[10px] font-bold text-gray-400 hover:text-emerald-600 transition-colors"
              >
                HELP?
              </button>
            </div>
            <input
              type="password"
              maxLength={4}
              required
              value={cardData.cvv}
              onChange={handleCvvChange}
              placeholder="123"
              className="w-full text-base sm:text-lg font-mono font-medium text-gray-800 placeholder-gray-300 focus:outline-none"
            />

            {/* CVV Help Tooltip */}
            {showCvvHelp && (
              <div className="absolute right-0 bottom-full mb-2 z-20 w-48 p-2.5 bg-gray-900 text-white text-[11px] rounded-lg shadow-xl animate-fadeIn">
                The 3 or 4 digits printed on the signature strip on the back of your card.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

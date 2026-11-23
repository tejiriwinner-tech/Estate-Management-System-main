'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  Landmark, 
  Phone, 
  Smartphone, 
  QrCode, 
  Lock, 
  ShieldCheck, 
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { PaymentChannel, CardFormData, PaystackBillItem, TransactionReceipt } from '@/types/paystackForm';
import { PayWithCard } from './channels/PayWithCard';
import { PayWithBank } from './channels/PayWithBank';
import { PayWithUSSD } from './channels/PayWithUSSD';
import { PayWithMobileMoney } from './channels/PayWithMobileMoney';
import { PayWithQR } from './channels/PayWithQR';
import { PaystackSuccessModal } from './PaystackSuccessModal';
import { paystackApi } from '@/services/paystackApi';

interface PaystackCheckoutCardProps {
  bill: PaystackBillItem;
  onSuccess?: (receipt: TransactionReceipt) => void;
}

export const PaystackCheckoutCard: React.FC<PaystackCheckoutCardProps> = ({
  bill,
  onSuccess,
}) => {
  const [activeChannel, setActiveChannel] = useState<PaymentChannel>('card');
  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: '0000 0000 0000 0000',
    cardExpiry: 'MM / YY',
    cvv: '123',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');
  const [activeReference, setActiveReference] = useState('');
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);

  const channels: { id: PaymentChannel; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'card', label: 'Card', icon: CreditCard },
    { id: 'bank', label: 'Bank', icon: Landmark },
    { id: 'gtb_737', label: 'GTB 737', icon: Phone },
    { id: 'mobile_money', label: 'Mobile money', icon: Smartphone },
    { id: 'visa_qr', label: 'Visa QR', icon: QrCode },
  ];

  const handlePay = async () => {
    setIsSubmitting(true);
    try {
      const chargeRes = await paystackApi.chargeCard(bill, cardData);
      setActiveReference(chargeRes.reference);
      setIsSubmitting(false);

      if (chargeRes.status === 'send_otp') {
        setShowOtpModal(true);
      }
    } catch {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    const result = await paystackApi.submitOtp(activeReference, otpCode);
    setIsSubmitting(false);
    setShowOtpModal(false);
    setReceipt(result.receipt);
    if (onSuccess) onSuccess(result.receipt);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Outer Checkout Card elevated with luxury border & shadow */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
        
        {/* =========================================================================
            LEFT COLUMN: PAY WITH Channel Selector (Exact Figma Sidebar)
            ========================================================================= */}
        <div className="w-full md:w-64 bg-[#FAFAFA] border-b md:border-b-0 md:border-r border-gray-100 p-5 sm:p-6 flex flex-col justify-between flex-shrink-0">
          <div>
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
              PAY WITH
            </h4>

            {/* Desktop Vertical Menu / Mobile Horizontal Bar */}
            <div className="flex md:flex-col overflow-x-auto md:overflow-visible gap-1.5 pb-2 md:pb-0">
              {channels.map((ch) => {
                const Icon = ch.icon;
                const isSelected = activeChannel === ch.id;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => setActiveChannel(ch.id)}
                    className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex-shrink-0 text-left ${
                      isSelected
                        ? 'bg-white text-emerald-700 shadow-sm border border-emerald-500/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <span>{ch.label}</span>
                    {isSelected && (
                      <span className="hidden md:inline-block w-2 h-2 rounded-full bg-emerald-500 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure Trust Stamp */}
          <div className="hidden md:flex items-center space-x-2 pt-6 border-t border-gray-200/60 text-[11px] text-gray-400">
            <Lock className="w-3.5 h-3.5 text-gray-400" />
            <span>Paystack Secured 256-Bit SSL</span>
          </div>
        </div>

        {/* =========================================================================
            RIGHT COLUMN: Form Content Area (Exact Figma Right Panel)
            ========================================================================= */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          {/* Header Row: Paystack 4-bar Cyan Logo + Email + Amount */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-5">
            {/* Paystack 4-Bar Logo Representation */}
            <div className="flex items-center space-x-2">
              <div className="flex flex-col space-y-1">
                <span className="w-6 h-1 bg-[#09A5DB] rounded-full" />
                <span className="w-4 h-1 bg-[#09A5DB] rounded-full" />
                <span className="w-6 h-1 bg-[#09A5DB] rounded-full" />
                <span className="w-5 h-1 bg-[#09A5DB] rounded-full" />
              </div>
              <span className="text-sm font-extrabold text-gray-800 tracking-tight hidden sm:inline">
                paystack
              </span>
            </div>

            {/* Email & Amount from Figma */}
            <div className="text-right">
              <div className="text-xs sm:text-sm font-medium text-gray-600">
                {bill.residentEmail}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">
                Pay <strong className="text-emerald-700 font-bold">NGN {bill.amount.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          {/* Active Channel Component Body */}
          <div className="flex-1">
            {activeChannel === 'card' && (
              <PayWithCard
                cardData={cardData}
                onChange={setCardData}
                amount={bill.amount}
              />
            )}
            {activeChannel === 'bank' && <PayWithBank amount={bill.amount} />}
            {activeChannel === 'gtb_737' && <PayWithUSSD amount={bill.amount} />}
            {activeChannel === 'mobile_money' && <PayWithMobileMoney amount={bill.amount} />}
            {activeChannel === 'visa_qr' && <PayWithQR amount={bill.amount} />}
          </div>

          {/* Primary Action Button (Big Green Button: "Pay NGN 5000") */}
          <div className="pt-2">
            <button
              type="button"
              onClick={handlePay}
              disabled={isSubmitting}
              className="w-full py-4 bg-[#10B981] hover:bg-[#059669] active:scale-[0.99] text-white text-base sm:text-lg font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay NGN {bill.amount.toLocaleString()}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-base text-gray-900">Authorize Transaction</h3>
              <p className="text-xs text-gray-500 mt-1">
                Enter the One-Time Password (OTP) sent to your registered phone to confirm ₦{bill.amount.toLocaleString()}.
              </p>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono font-bold tracking-widest py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-gray-400 mt-1">Demo sandbox OTP: 123456</p>
            </div>

            <div className="pt-2 flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                {isSubmitting ? 'Verifying...' : 'Submit OTP'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Verified Success Receipt Modal */}
      <PaystackSuccessModal
        receipt={receipt}
        isOpen={!!receipt}
        onClose={() => setReceipt(null)}
      />
    </div>
  );
};

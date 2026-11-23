"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Lock,
  CreditCard,
  Landmark,
  Hash,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import {
  PaymentTypeItem,
  PaystackChannel,
  PaystackTransactionPayload,
} from "@/types/paystackCheckout";

interface PaystackCheckoutModalProps {
  isOpen: boolean;
  selectedItem: PaymentTypeItem | null;
  onClose: () => void;
  onSuccess: (payload: PaystackTransactionPayload) => void;
}

export function PaystackCheckoutModal({
  isOpen,
  selectedItem,
  onClose,
  onSuccess,
}: PaystackCheckoutModalProps) {
  const [channel, setChannel] = useState<PaystackChannel>("card");
  const [email, setEmail] = useState("marcus.holloway@lincolnestate.ng");
  const [cardNumber, setCardNumber] = useState("4084 0840 8408 4081");
  const [expiry, setExpiry] = useState("09/28");
  const [cvv, setCvv] = useState("408");
  const [isProcessing, setIsProcessing] = useState(false);
  const [reference, setReference] = useState("");

  useEffect(() => {
    if (selectedItem && isOpen) {
      setReference(`PSK-LE-${Date.now().toString().slice(-6)}`);
      setIsProcessing(false);
    }
  }, [selectedItem, isOpen]);

  if (!isOpen || !selectedItem) return null;

  const amountToPay =
    selectedItem.balance > 0 ? selectedItem.balance : selectedItem.amount;

  const handlePaystackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        paymentTypeId: selectedItem.id,
        paymentTypeName: selectedItem.type,
        email,
        residentName: "Marcus Holloway",
        amount: amountToPay,
        reference,
        channel,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-dark/60 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Paystack Checkout Card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-150">
        {/* Top Paystack Brand Header */}
        <div className="bg-gradient-to-r from-dark via-dark-soft to-primary-dark px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white font-bold text-sm shadow-xs">
                <span className="italic font-serif">LE</span>
              </div>
              <div>
                <p className="text-xs font-extrabold tracking-wide text-accent">
                  PAYSTACK SECURE CHECKOUT
                </p>
                <p className="text-[11px] text-white/75 truncate max-w-[210px]">
                  {email}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Bill Summary Strip */}
          <div className="mt-4 flex items-end justify-between border-t border-white/10 pt-3.5">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/60">
                PAYMENT FOR
              </p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {selectedItem.type} ({selectedItem.schedule})
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-wider text-accent">
                AMOUNT DUE
              </p>
              <p className="text-xl font-black tracking-tight text-white font-mono">
                ₦{amountToPay.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Channel Selector Tabs (Card / Bank Transfer / USSD) */}
        <div className="grid grid-cols-3 border-b border-slate-100 bg-slate-50 p-1.5 text-xs font-bold">
          <button
            type="button"
            onClick={() => setChannel("card")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              channel === "card"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-dark"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5" />
            <span>Card</span>
          </button>

          <button
            type="button"
            onClick={() => setChannel("bank_transfer")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              channel === "bank_transfer"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-dark"
            }`}
          >
            <Landmark className="h-3.5 w-3.5" />
            <span>Transfer</span>
          </button>

          <button
            type="button"
            onClick={() => setChannel("ussd")}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all cursor-pointer ${
              channel === "ussd"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-500 hover:text-dark"
            }`}
          >
            <Hash className="h-3.5 w-3.5" />
            <span>USSD</span>
          </button>
        </div>

        {/* Payment Form Body */}
        <form onSubmit={handlePaystackSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">
              Resident Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 font-semibold text-dark focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/25"
            />
          </div>

          {channel === "card" && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Card Number (Paystack Test Card)
                </label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 font-mono font-bold text-dark focus:outline-none focus:ring-2 focus:ring-primary/25"
                  />
                </div>
              </div>
            </>
          )}

          {channel === "bank_transfer" && (
            <div className="rounded-2xl border border-accent/40 bg-accent/10 p-4 text-center space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PAYSTACK VIRTUAL ACCOUNT
              </p>
              <p className="text-lg font-black tracking-widest text-primary font-mono">
                9948201942
              </p>
              <p className="text-xs font-bold text-dark">
                Paystack-Titan / LincolnEstate Escrow
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Click confirm below once transfer of ₦
                {amountToPay.toLocaleString("en-US")} is sent.
              </p>
            </div>
          )}

          {channel === "ussd" && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                DIAL USSD CODE ON YOUR PHONE
              </p>
              <p className="text-lg font-black tracking-wider text-primary font-mono">
                *737*000*{reference.slice(-4)}#
              </p>
              <p className="text-[11px] text-slate-500">
                Reference: <span className="font-mono font-bold">{reference}</span>
              </p>
            </div>
          )}

          {/* Submit Paystack Payment Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 py-3 text-xs font-extrabold text-white shadow-md shadow-primary/25 transition-all cursor-pointer"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying with Paystack...</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-accent" />
                <span>
                  Pay ₦
                  {amountToPay.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </>
            )}
          </button>

          {/* Footer Security Badge */}
          <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] font-medium text-slate-400">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Secured by Paystack • Ref: {reference}</span>
          </div>
        </form>
      </div>
    </div>
  );
}

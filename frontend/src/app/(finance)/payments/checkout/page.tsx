"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CreditCard, CheckCircle2, ExternalLink } from "lucide-react";
import { PaymentTypesCard } from "@/components/checkout/PaymentTypesCard";
import { PaystackCheckoutModal } from "@/components/checkout/PaystackCheckoutModal";
import { mockPaymentTypes } from "@/data/mockPaymentTypes";
import {
  PaymentTypeItem,
  PaystackTransactionPayload,
} from "@/types/paystackCheckout";

export default function PaystackCheckoutPaymentPage() {
  const [paymentTypes, setPaymentTypes] =
    useState<PaymentTypeItem[]>(mockPaymentTypes);
  const [selectedItem, setSelectedItem] = useState<PaymentTypeItem | null>(
    null
  );
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [lastTransaction, setLastTransaction] =
    useState<PaystackTransactionPayload | null>(null);

  const handleOpenPaystack = (item: PaymentTypeItem) => {
    setSelectedItem(item);
    setIsCheckoutOpen(true);
  };

  const handleSimulateNewCycle = () => {
    setPaymentTypes((prev) =>
      prev.map((item) => ({
        ...item,
        paid: 0,
        balance: item.amount,
      }))
    );
    setLastTransaction(null);
  };

  const handlePaystackSuccess = (payload: PaystackTransactionPayload) => {
    setIsCheckoutOpen(false);
    setLastTransaction(payload);

    // Update the paid and balance columns for that payment type
    setPaymentTypes((prev) =>
      prev.map((item) =>
        item.id === payload.paymentTypeId
          ? {
              ...item,
              paid: item.amount,
              balance: 0.0,
              receiptId: payload.reference,
            }
          : item
      )
    );
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-dark">
            Payment &amp; Paystack Checkout
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
            Manage recurring estate payment types and complete instant online
            payments via Paystack.
          </p>
        </div>

        <div>
          <button
            type="button"
            onClick={() => handleOpenPaystack(paymentTypes[0])}
            className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all cursor-pointer"
          >
            <CreditCard className="h-4 w-4 text-accent" />
            <span>Quick Pay with Paystack</span>
          </button>
        </div>
      </div>

      {/* 2. Paystack Payment Verified Banner */}
      {lastTransaction && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 px-5 py-4 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-extrabold text-dark">
                Paystack Payment Verified — ₦
                {lastTransaction.amount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}{" "}
                for {lastTransaction.paymentTypeName}
              </p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                Reference:{" "}
                <span className="font-mono font-bold text-primary">
                  {lastTransaction.reference}
                </span>{" "}
                • Channel: {lastTransaction.channel.toUpperCase()}
              </p>
            </div>
          </div>

          <Link
            href={`/payments/receipt/${lastTransaction.reference}`}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-xl bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-primary-hover transition-colors"
          >
            <span>View Official Receipt</span>
            <ExternalLink className="h-3.5 w-3.5 text-accent" />
          </Link>
        </div>
      )}

      {/* 3. Payment Types Table & Mobile Cards (Matching Task 19 Figma) */}
      <PaymentTypesCard
        items={paymentTypes}
        onPayClick={handleOpenPaystack}
        onSimulateNewCycle={handleSimulateNewCycle}
      />

      {/* 4. Interactive Paystack Checkout Modal */}
      <PaystackCheckoutModal
        isOpen={isCheckoutOpen}
        selectedItem={selectedItem}
        onClose={() => setIsCheckoutOpen(false)}
        onSuccess={handlePaystackSuccess}
      />
    </div>
  );
}

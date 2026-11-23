"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Check, Download, Share2, QrCode } from "lucide-react";
import { PaymentReceiptData } from "@/types/receipt";

interface MobileReceiptProps {
  receipt: PaymentReceiptData;
}

export function MobileReceipt({ receipt }: MobileReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `LincolnEstate Receipt ${receipt.receiptNumber}`,
          text: `Payment Receipt for ${receipt.residentName} - ₦${receipt.totalAmount.toLocaleString()}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      alert("Receipt link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4 max-w-sm mx-auto">
      {/* 1. Header: Back button + Title */}
      <div className="relative flex items-center justify-center py-2">
        <Link
          href="/payments"
          className="absolute left-0 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-dark">Receipt</h1>
      </div>

      {/* 2. Success Status Pill */}
      <div className="flex justify-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700 shadow-xs">
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
            <Check className="h-2.5 w-2.5 stroke-[3]" />
          </span>
          Payment Successful
        </span>
      </div>

      {/* 3. Main Ticket Card */}
      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white p-6 shadow-xl">
        {/* Top Estate Identity */}
        <div className="flex flex-col items-center text-center pb-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white font-bold text-2xl shadow-md shadow-primary/20 mb-2">
            <span className="italic font-serif">LE</span>
          </div>
          <h2 className="text-base font-extrabold text-primary">LincolnEstate</h2>
          <p className="text-[11px] font-semibold text-slate-400">
            Finance Module • Receipt {receipt.receiptNumber}
          </p>
        </div>

        {/* Hero Amount Display */}
        <div className="my-3 text-center">
          <p className="text-xs font-semibold text-slate-400">Amount Paid</p>
          <p className="text-3xl font-black tracking-tight text-primary mt-0.5">
            ₦{receipt.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        {/* 2-Column Key Value Grid */}
        <div className="grid grid-cols-2 gap-y-4 gap-x-3 py-4 text-left border-t border-slate-100 text-xs">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              RESIDENT INFO
            </p>
            <p className="font-bold text-dark mt-0.5 truncate">{receipt.residentName}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              HOUSE NUMBER
            </p>
            <p className="font-bold text-dark mt-0.5 truncate">{receipt.propertyName}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              SERVICE
            </p>
            <p className="font-bold text-dark mt-0.5 truncate">
              {receipt.lineItems[0]?.serviceDescription || "Service Charge"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              DATE
            </p>
            <p className="font-bold text-dark mt-0.5">{receipt.transactionDate}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              PAYMENT METHOD
            </p>
            <p className="font-bold text-dark mt-0.5">{receipt.paymentMethod}</p>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              STATUS
            </p>
            <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-600 mt-0.5">
              PAID
            </span>
          </div>
        </div>

        {/* Perforated Divider Line with Cutout Notches */}
        <div className="relative my-4">
          {/* Left Cutout */}
          <div className="absolute -left-9 top-1/2 -mt-3 h-6 w-6 rounded-full bg-slate-50 border border-slate-200/80" />
          {/* Right Cutout */}
          <div className="absolute -right-9 top-1/2 -mt-3 h-6 w-6 rounded-full bg-slate-50 border border-slate-200/80" />
          {/* Dashed Line */}
          <div className="border-t-2 border-dashed border-slate-200" />
        </div>

        {/* Digital Verification QR Code */}
        <div className="flex flex-col items-center text-center pt-2 pb-1">
          <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-sm">
            <QrCode className="h-full w-full text-dark" />
          </div>
          <p className="text-[10px] font-medium text-slate-400 mt-3 max-w-[220px]">
            Scan this QR code to verify the authenticity of this receipt.
          </p>
        </div>
      </div>

      {/* 4. Action Buttons (Download PDF & Share) */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary hover:bg-primary-hover py-3 text-xs font-bold text-white shadow-sm shadow-primary/25 transition-all"
        >
          <Download className="h-4 w-4" />
          <span>Download PDF</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-200/80 hover:bg-slate-300/80 py-3 text-xs font-bold text-dark transition-all"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Support footer */}
      <div className="text-center pt-3 pb-6">
        <p className="text-xs text-slate-400">
          Need help with this transaction?{" "}
          <Link href="/messages" className="text-primary font-bold hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
}

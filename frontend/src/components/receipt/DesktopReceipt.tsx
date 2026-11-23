"use client";

import React from "react";
import { Printer, Download, User, Home, QrCode } from "lucide-react";
import { PaymentReceiptData } from "@/types/receipt";

interface DesktopReceiptProps {
  receipt: PaymentReceiptData;
}

export function DesktopReceipt({ receipt }: DesktopReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Action Controls (Hidden when printing) */}
      <div className="flex items-center justify-end gap-3 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl bg-primary hover:bg-primary-hover text-white px-5 py-2.5 text-xs font-bold shadow-sm shadow-primary/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Print Receipt</span>
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white text-dark hover:bg-slate-50 px-5 py-2.5 text-xs font-bold shadow-sm transition-colors cursor-pointer"
        >
          <Download className="h-4 w-4 text-accent" />
          <span>Download PDF</span>
        </button>
      </div>

      {/* Official Receipt Paper Card */}
      <div
        id="printable-receipt"
        className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-12 shadow-lg"
      >
        {/* Right Edge Decorative Accent Bar */}
        <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-gradient-to-b from-primary via-accent to-dark" />

        {/* 1. Header: Brand + Status + Receipt # */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-8 border-b border-slate-100 gap-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white font-bold text-2xl shadow-md shadow-primary/20">
              <span className="italic font-serif">LE</span>
            </div>
            <div>
              <div className="flex items-center">
                <span className="text-xl font-extrabold tracking-tight text-primary">Lincoln</span>
                <span className="text-xl font-extrabold tracking-tight text-dark">Estate</span>
              </div>
              <p className="text-[11px] font-semibold tracking-wide text-slate-400">
                Finance Module | Official Transaction
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              {receipt.status}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-2">
              RECEIPT NUMBER
            </p>
            <p className="text-lg font-extrabold tracking-tight text-dark font-mono">
              {receipt.receiptNumber}
            </p>
          </div>
        </div>

        {/* 2. Resident & Property Details (2 Columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-8 border-b border-slate-100">
          {/* Resident Details */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              RESIDENT DETAILS
            </p>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <User className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark">{receipt.residentName}</p>
                <p className="text-xs text-slate-500">{receipt.residentEmail}</p>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              PROPERTY INFO
            </p>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                <Home className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-dark">{receipt.propertyName}</p>
                <p className="text-xs text-slate-500">{receipt.estatePhase}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Itemized Service Breakdown Table */}
        <div className="py-8">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4 rounded-l-xl">Service Description</th>
                <th className="py-3 px-4">Billing Period</th>
                <th className="py-3 px-4 text-right rounded-r-xl">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {receipt.lineItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <p className="font-bold text-dark">{item.serviceDescription}</p>
                    {item.subDescription && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{item.subDescription}</p>
                    )}
                  </td>
                  <td className="py-4 px-4 text-slate-500 font-medium">{item.billingPeriod}</td>
                  <td className="py-4 px-4 text-right font-bold text-dark font-mono">
                    ₦{item.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Payment Metadata & Total Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 py-6 border-t border-b border-slate-100">
          {/* Metadata */}
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-32">
                PAYMENT METHOD
              </span>
              <span className="font-bold text-dark">{receipt.paymentMethod}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-32">
                TRANSACTION DATE
              </span>
              <span className="font-medium text-slate-600">{receipt.transactionDate}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 w-32">
                GENERATED BY
              </span>
              <span className="font-medium text-slate-500">{receipt.generatedBy}</span>
            </div>
          </div>

          {/* Total Amount Box */}
          <div className="flex flex-col items-end rounded-2xl bg-gradient-to-r from-primary to-primary-dark p-5 text-white shadow-md min-w-[220px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent-light">
              TOTAL AMOUNT
            </span>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                ₦{receipt.totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
              <span className="rounded-md bg-accent/30 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                PAID
              </span>
            </div>
          </div>
        </div>

        {/* 5. Digital Verification QR & Authorization Stamp */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pt-8 items-center">
          {/* QR Verification Box */}
          <div className="sm:col-span-6 flex items-start gap-4">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-xs">
              <QrCode className="h-full w-full text-dark" />
            </div>
            <div>
              <p className="text-xs font-bold text-dark">Digital Verification</p>
              <p className="text-[10px] text-slate-400 leading-relaxed mt-1 max-w-[220px]">
                Scan this code to verify the authenticity of this receipt on the LincolnEstate Secure Portal.
              </p>
            </div>
          </div>

          {/* Watermarked Authorization Stamp & Disclaimer */}
          <div className="sm:col-span-6 text-right relative">
            <div className="relative inline-block text-right">
              {/* Ghosted Stamp Graphic */}
              <div className="border-2 border-accent/50 rounded-xl px-4 py-2 inline-block -rotate-3 mb-2 bg-accent/10">
                <span className="text-xs font-black tracking-widest uppercase text-primary/90">
                  {receipt.authorizationStampText}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-normal max-w-sm ml-auto">
                {receipt.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

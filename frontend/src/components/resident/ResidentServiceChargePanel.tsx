"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Receipt,
  CheckCircle2,
  Clock,
  ShieldCheck,
  CreditCard,
  Printer,
  Upload,
  FileText,
  Eye,
  X,
  Building2,
} from "lucide-react";
import { readSession } from "@/components/auth/session";

export interface UnitServiceCharge {
  id: number;
  resident_name: string;
  unit_number: string;
  service_type: string;
  amount: number;
  billing_cycle: string;
  due_date: string | null;
  status: string;
  invoice_no: string;
  notes: string;
  receipt_url?: string | null;
  receipt_name?: string | null;
  payment_reference?: string | null;
  paid_at?: string | null;
}

export function ResidentServiceChargePanel({
  scope = "resident",
  compact = false,
}: {
  scope?: "resident" | "store";
  compact?: boolean;
}) {
  const [charges, setCharges] = useState<UnitServiceCharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Payment & Receipt Upload Modal state
  const [activeCharge, setActiveCharge] = useState<UnitServiceCharge | null>(null);
  const [paymentRef, setPaymentRef] = useState("");
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);
  const [receiptName, setReceiptName] = useState<string | null>(null);

  // Receipt Preview Modal state
  const [previewCharge, setPreviewCharge] = useState<UnitServiceCharge | null>(null);

  const load = useCallback(async () => {
    try {
      const session = readSession();
      const res = await fetch(`/api/v1/resident/service-charges?scope=${scope}`, {
        cache: "no-store",
        headers: session?.email ? { "X-User-Email": session.email } : {},
      });
      const json = await res.json();
      setCharges(json.data || []);
    } catch {
      setCharges([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    void load();
  }, [load]);

  const openPayModal = (item: UnitServiceCharge) => {
    setActiveCharge(item);
    setPaymentRef(item.payment_reference || "");
    setReceiptUrl(item.receipt_url || null);
    setReceiptName(item.receipt_name || null);
    setErrorMsg(null);
  };

  const closePayModal = () => {
    setActiveCharge(null);
    setPaymentRef("");
    setReceiptUrl(null);
    setReceiptName(null);
    setErrorMsg(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setErrorMsg("Receipt file must be 3MB or smaller (PNG, JPG, WEBP, or PDF).");
      return;
    }
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setReceiptUrl(reader.result);
        setReceiptName(file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCharge) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/v1/resident/service-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: activeCharge.id,
          receipt_url: receiptUrl,
          receipt_name: receiptName,
          payment_reference: paymentRef.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.message || "Could not process service charge payment.");
      }
      setToast(
        receiptUrl
          ? `Payment & receipt uploaded for ${activeCharge.invoice_no}! Ref: ${json.data?.receipt_no || "Verified"}`
          : `Payment confirmed for ${activeCharge.invoice_no}! Ref: ${json.data?.receipt_no || "Verified"}`
      );
      setTimeout(() => setToast(null), 5000);
      closePayModal();
      await load();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Could not verify payment right now.");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingTotal = charges
    .filter((c) => c.status !== "Paid")
    .reduce((sum, c) => sum + c.amount, 0);
  const paidTotal = charges
    .filter((c) => c.status === "Paid")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Service Charge
            </span>
            <p className="text-2xl font-black text-[#B22222] mt-1">
              ₦{pendingTotal.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {pendingTotal > 0 ? "Billed by Estate Administration" : "All unit assessments cleared"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Cleared (YTD)
            </span>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              ₦{paidTotal.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              Verified estate service receipts
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Levy Standing
            </span>
            <div className="mt-1.5 flex items-center gap-2">
              {pendingTotal === 0 ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-4 h-4" /> Good Standing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <Clock className="w-4 h-4" /> Payment Due
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium">
              {charges[0]?.unit_number || (scope === "store" ? "Commercial Shop" : "Villa A-402")}
            </p>
          </div>
        </div>
      )}

      {toast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#B22222]" />
            <h3 className="text-sm font-extrabold text-slate-900">
              {scope === "store" ? "Commercial Shop Service Charges" : "My Unit Service Charges"}
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            {charges.length} {charges.length === 1 ? "Assessment" : "Assessments"}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {loading ? (
            <div className="py-10 text-center text-xs text-slate-400">Loading service charges…</div>
          ) : charges.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No service charges billed to your unit right now.
            </div>
          ) : (
            charges.slice(0, compact ? 3 : charges.length).map((c) => {
              const isPaid = c.status === "Paid";
              const hasReceipt = Boolean(c.receipt_url);
              return (
                <div
                  key={c.id}
                  className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-slate-500">{c.invoice_no}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPaid
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {c.status}
                      </span>
                      {hasReceipt && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Receipt Uploaded
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-medium">{c.billing_cycle}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{c.service_type}</p>
                    {c.notes && <p className="text-[11px] text-slate-500 mt-0.5">{c.notes}</p>}
                    {c.due_date && !isPaid && (
                      <p className="text-[11px] font-semibold text-amber-700 mt-0.5">Due: {c.due_date}</p>
                    )}
                    {c.payment_reference && isPaid && (
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                        Ref: {c.payment_reference}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 shrink-0">
                    <span className="text-sm sm:text-base font-black text-slate-900 mr-1">
                      ₦{c.amount.toLocaleString()}
                    </span>
                    {isPaid ? (
                      <>
                        {hasReceipt && (
                          <button
                            type="button"
                            onClick={() => setPreviewCharge(c)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Receipt</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openPayModal(c)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#B22222]" />
                          <span>{hasReceipt ? "Update Receipt" : "Upload Receipt"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openPayModal(c)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs transition-all"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Pay Charge</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Pay Service Charge & Upload Receipt Modal */}
      {activeCharge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePayModal();
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B22222]">
                  <Receipt className="w-3.5 h-3.5" />
                  <span>
                    {activeCharge.status === "Paid"
                      ? "Upload / Update Payment Receipt"
                      : "Pay Service Charge & Upload Receipt"}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-0.5">{activeCharge.service_type}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Invoice <span className="font-mono font-bold">{activeCharge.invoice_no}</span> • {activeCharge.unit_number}
                </p>
              </div>
              <button
                type="button"
                onClick={closePayModal}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="mt-4 space-y-4">
              {/* Amount & Estate Account Info */}
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Amount Due
                  </span>
                  <p className="text-2xl font-black text-[#B22222]">
                    ₦{activeCharge.amount.toLocaleString()}
                  </p>
                </div>
                <div className="text-left sm:text-right text-[11px] text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800 flex items-center sm:justify-end gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
                    <span>Post Army House Estate Service Account</span>
                  </div>
                  <p className="font-mono font-semibold">Zenith Bank • 1018472910</p>
                </div>
              </div>

              {/* Payment Reference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transfer / Payment Reference (Optional)
                </label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  placeholder="e.g. TRF-884120 or Bank Teller No."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]/25 focus:border-[#B22222]"
                />
              </div>

              {/* Receipt Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Upload Payment Receipt (Screenshot, Photo, or PDF)
                </label>
                <label className="flex flex-col items-center justify-center w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-[#B22222] bg-slate-50/70 hover:bg-[#FEF2F2]/40 p-5 cursor-pointer transition-colors text-center">
                  <Upload className="w-6 h-6 text-[#B22222] mb-1.5" />
                  <span className="text-xs font-bold text-slate-800">
                    {receiptName ? `Selected: ${receiptName}` : "Click to choose receipt image or PDF"}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    PNG, JPG, WEBP, or PDF up to 3MB
                  </span>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {receiptUrl && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3">
                    {receiptUrl.startsWith("data:image/") ? (
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={receiptUrl}
                          alt="Uploaded receipt preview"
                          className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{receiptName || "Payment Receipt"}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">Ready to submit</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-7 h-7 text-[#B22222] shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{receiptName || "Receipt.pdf"}</p>
                          <p className="text-[11px] text-emerald-700 font-semibold">PDF attached</p>
                        </div>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setReceiptUrl(null);
                        setReceiptName(null);
                      }}
                      className="text-xs font-bold text-red-600 hover:underline shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {errorMsg && (
                <p role="alert" className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-semibold text-red-700">
                  {errorMsg}
                </p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={closePayModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {submitting
                      ? "Submitting…"
                      : activeCharge.status === "Paid"
                      ? "Save Uploaded Receipt"
                      : "Confirm Payment & Upload Receipt"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Preview Modal */}
      {previewCharge && previewCharge.receipt_url && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewCharge(null);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">Uploaded Payment Receipt</h3>
                <p className="text-xs text-slate-500">
                  {previewCharge.invoice_no} • {previewCharge.receipt_name || "Payment Proof"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewCharge(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewCharge.receipt_url.startsWith("data:image/") ? (
              <div className="max-h-[60vh] overflow-auto rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center p-2">
                <img
                  src={previewCharge.receipt_url}
                  alt={previewCharge.receipt_name || "Service charge receipt"}
                  className="max-w-full max-h-[55vh] rounded-lg object-contain"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center space-y-3">
                <FileText className="w-10 h-10 text-[#B22222] mx-auto" />
                <p className="text-xs font-bold text-slate-800">
                  {previewCharge.receipt_name || "Uploaded Receipt Document"}
                </p>
                <a
                  href={previewCharge.receipt_url}
                  download={previewCharge.receipt_name || `${previewCharge.invoice_no}-receipt`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#B22222] text-white text-xs font-bold"
                >
                  Download Receipt
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

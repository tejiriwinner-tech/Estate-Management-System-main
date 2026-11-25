"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Receipt, CheckCircle2, Clock, ShieldCheck, CreditCard, Printer } from "lucide-react";
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
  const [payingId, setPayingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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

  const handlePay = async (item: UnitServiceCharge) => {
    setPayingId(item.id);
    try {
      const res = await fetch("/api/v1/resident/service-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id }),
      });
      const json = await res.json();
      setToast(`Payment confirmed for ${item.invoice_no}! Receipt: ${json.data?.receipt_no || "Verified"}`);
      setTimeout(() => setToast(null), 5000);
      await load();
    } catch {
      setToast("Could not verify payment right now.");
    } finally {
      setPayingId(null);
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
                      <span className="text-[11px] text-slate-400 font-medium">{c.billing_cycle}</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 mt-1">{c.service_type}</p>
                    {c.notes && <p className="text-[11px] text-slate-500 mt-0.5">{c.notes}</p>}
                    {c.due_date && !isPaid && (
                      <p className="text-[11px] font-semibold text-amber-700 mt-0.5">Due: {c.due_date}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <span className="text-sm sm:text-base font-black text-slate-900">
                      ₦{c.amount.toLocaleString()}
                    </span>
                    {isPaid ? (
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={payingId === c.id}
                        onClick={() => void handlePay(c)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>{payingId === c.id ? "Processing…" : "Pay Charge"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

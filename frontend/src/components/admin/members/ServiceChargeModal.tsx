"use client";

import React, { useCallback, useEffect, useState } from "react";
import { X, Plus, CheckCircle2, Clock, Trash2, Receipt, CreditCard, Building2 } from "lucide-react";

export interface ServiceChargeRecord {
  id: number;
  user_id: number | null;
  resident_name: string;
  unit_number: string;
  service_type: string;
  amount: number;
  billing_cycle: string;
  due_date: string | null;
  status: string;
  invoice_no: string;
  notes: string | null;
  receipt_url?: string | null;
  receipt_name?: string | null;
  payment_reference?: string | null;
}

interface ServiceChargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  member?: { id: number; name: string; house_no: string } | null; // null = Bulk Estate Billing mode
  onSaved?: () => void;
}

const SERVICE_PRESETS = [
  { label: "Monthly Estate Security & Maintenance Levy", amount: 35000, cycle: "Monthly" },
  { label: "24/7 Power Grid & Generator Backup", amount: 45000, cycle: "Monthly" },
  { label: "Waste & Environmental Sanitation", amount: 15000, cycle: "Monthly" },
  { label: "Water Treatment & Borehole Reticulation", amount: 12000, cycle: "Monthly" },
  { label: "Annual Infrastructure & Road Maintenance", amount: 120000, cycle: "Annual" },
];

export function ServiceChargeModal({
  isOpen,
  onClose,
  member,
  onSaved,
}: ServiceChargeModalProps) {
  const [charges, setCharges] = useState<ServiceChargeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    service_type: SERVICE_PRESETS[0].label,
    amount: "",
    billing_cycle: "Monthly",
    due_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    notes: "",
  });

  const loadMemberCharges = useCallback(async () => {
    if (!member) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/service-charges?user_id=${member.id}`, { cache: "no-store" });
      const json = await res.json();
      setCharges(json.data || []);
    } catch {
      setCharges([]);
    } finally {
      setLoading(false);
    }
  }, [member]);

  useEffect(() => {
    if (isOpen && member) {
      void loadMemberCharges();
    }
  }, [isOpen, member, loadMemberCharges]);

  if (!isOpen) return null;

  const isBulk = !member;

  const handlePresetChange = (label: string) => {
    const found = SERVICE_PRESETS.find((p) => p.label === label);
    if (found) {
      setForm((prev) => ({
        ...prev,
        service_type: found.label,
        billing_cycle: found.cycle,
      }));
    } else {
      setForm((prev) => ({ ...prev, service_type: label }));
    }
  };

  const handleAssignCharge = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/admin/service-charges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: isBulk ? "all" : "single",
          user_id: member?.id,
          resident_name: member?.name,
          unit_number: member?.house_no,
          service_type: form.service_type,
          amount: Number(form.amount),
          billing_cycle: form.billing_cycle,
          due_date: form.due_date,
          notes: form.notes,
        }),
      });
      const json = await res.json();
      setToast(json.message || "Service charge billed successfully!");
      setTimeout(() => setToast(null), 3500);
      onSaved?.();
      if (isBulk) {
        setTimeout(() => onClose(), 1200);
      } else {
        await loadMemberCharges();
      }
    } catch {
      setToast("Could not assign service charge.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkStatus = async (id: number, status: string) => {
    try {
      await fetch("/api/v1/admin/service-charges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await loadMemberCharges();
      onSaved?.();
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`/api/v1/admin/service-charges?id=${id}`, { method: "DELETE" });
      await loadMemberCharges();
      onSaved?.();
    } catch {
      // ignore
    }
  };

  const totalPending = charges
    .filter((c) => c.status === "Pending")
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#B22222]">
              <Receipt className="w-3.5 h-3.5" />
              <span>{isBulk ? "Estate-Wide Levy Billing" : "Resident Service Charge Account"}</span>
            </div>
            <h3 className="text-xl font-black text-gray-900 mt-0.5">
              {isBulk ? "Bill Service Charge to All Members" : `${member.name} • ${member.house_no}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-gray-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {toast && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toast}</span>
          </div>
        )}

        {/* Summary Strip for Single Member */}
        {!isBulk && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Outstanding Dues</span>
                <div className="text-lg font-black text-[#B22222] mt-0.5">
                  ₦{totalPending.toLocaleString()}
                </div>
              </div>
              <CreditCard className="w-5 h-5 text-[#B22222]/60" />
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Assigned Unit</span>
                <div className="text-lg font-black text-gray-900 mt-0.5">{member.house_no}</div>
              </div>
              <Building2 className="w-5 h-5 text-slate-400" />
            </div>
          </div>
        )}

        {/* Assign New Service Charge Form */}
        <form onSubmit={handleAssignCharge} className="mt-5 p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 space-y-3.5">
          <div className="text-xs font-extrabold uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-[#B22222]" />
            <span>{isBulk ? "Configure Estate-Wide Charge" : "Add New Service Charge to User"}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Service Charge Category</label>
              <select
                value={form.service_type}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              >
                {SERVICE_PRESETS.map((p) => (
                  <option key={p.label} value={p.label}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Amount (₦)</label>
              <input
                type="number"
                required
                min={1}
                placeholder="Enter amount (e.g. 35000)"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Billing Cycle</label>
              <select
                value={form.billing_cycle}
                onChange={(e) => setForm({ ...form, billing_cycle: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              >
                <option>Monthly</option>
                <option>Quarterly</option>
                <option>Bi-Annual</option>
                <option>Annual</option>
                <option>One-Time Assessment</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Payment Due Date</label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Description / Memo (Optional)</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Q4 Security & Streetlight Levy"
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#991B1B] text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>
                {submitting
                  ? "Billing..."
                  : isBulk
                  ? "Bill All Estate Residents"
                  : `Assign ₦${Number(form.amount || 0).toLocaleString()} Charge`}
              </span>
            </button>
          </div>
        </form>

        {/* Member Service Charge Ledger */}
        {!isBulk && (
          <div className="mt-5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Service Charge History for {member.name}
            </h4>

            <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading charges…</div>
              ) : charges.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No service charges billed to this resident yet.
                </div>
              ) : (
                charges.map((c) => (
                  <div key={c.id} className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/70">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500">{c.invoice_no}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.status === "Paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-gray-900 mt-0.5 truncate">{c.service_type}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="font-extrabold text-gray-800">₦{c.amount.toLocaleString()}</span>
                        <span>• {c.billing_cycle}</span>
                        {c.due_date && (
                          <span className="flex items-center gap-0.5">
                            • <Clock className="w-3 h-3 inline" /> Due: {c.due_date}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.status !== "Paid" && (
                        <button
                          type="button"
                          onClick={() => handleMarkStatus(c.id, "Paid")}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        title="Remove Charge"
                        className="p-1.5 rounded-lg border border-gray-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

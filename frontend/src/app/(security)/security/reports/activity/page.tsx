"use client";

import { useState } from "react";
import { Activity, Plus, X } from "lucide-react";
import EstateActivityTable, { type ActivityRow } from "@/components/security/reports/EstateActivityTable";
import { securityFetch } from "@/lib/security/api";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";


export default function EstateActivityPage() {
  const { data, error, reload } = useSecurityData<{ rows: ActivityRow[]; total: number }>("/security/activity", { rows: [], total: 0 });
  const rows = data.rows;
  const [saveError, setSaveError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm]           = useState({ name: "", out: "", outWith: "", in: "", inWith: "" });

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return;
    // "8:30am" style times are applied to today's date.
    const at = (t: string) => {
      const m = t.trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
      if (!m) return undefined;
      let h = Number(m[1]);
      if (m[3] === "pm" && h < 12) h += 12;
      if (m[3] === "am" && h === 12) h = 0;
      const d = new Date();
      d.setHours(h, Number(m[2] ?? 0), 0, 0);
      return d.toISOString();
    };
    const base = { name: form.name.trim(), person_type: "Resident", gate: "Main Gate", verification_type: "Manual", status: "Success" };
    try {
      setSaveError(null);
      if (form.out.trim()) {
        await securityFetch("/security/access/log", { method: "POST", body: JSON.stringify({ ...base, direction: "out", companions: form.outWith || undefined, occurred_at: at(form.out) }) });
      }
      if (form.in.trim()) {
        await securityFetch("/security/access/log", { method: "POST", body: JSON.stringify({ ...base, direction: "in", companions: form.inWith || undefined, occurred_at: at(form.in) }) });
      }
      setForm({ name: "", out: "", outWith: "", in: "", inWith: "" });
      setModalOpen(false);
      await reload();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Could not save the activity.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error ?? saveError} />
      {/* Stat header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6 text-[#B22222]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Incident &amp; Gate Activity Reports</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {rows.length} logged estate gate movement{rows.length === 1 ? "" : "s"} &amp; incident entries
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B22222] text-white text-xs font-extrabold hover:bg-[#991B1B] shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Log Activity
        </button>
      </div>

      {/* Table */}
      <EstateActivityTable
        rows={rows}
        total={data.total}
        onAddActivity={() => setModalOpen(true)}
      />

      {/* Add Activity Modal */}
      {modalOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setModalOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-[--color-border]">
                <h3 className="text-base font-bold text-[--color-text]">Add Estate Activity</h3>
                <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-[--color-text-muted]" />
                </button>
              </div>
              {/* Form */}
              <form onSubmit={handleAdd} className="p-6 flex flex-col gap-4">
                {[
                  { key: "name",    label: "Resident Name",   placeholder: "e.g. David Onyemenam" },
                  { key: "out",     label: "Check-Out Time",  placeholder: "e.g. 8:30am"          },
                  { key: "outWith", label: "Out With",        placeholder: "e.g. Family"           },
                  { key: "in",      label: "Check-In Time",   placeholder: "e.g. 6:45pm"          },
                  { key: "inWith",  label: "In With",         placeholder: "e.g. Wife"             },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-[--color-text] mb-1.5">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      className="w-full px-3 py-2.5 text-sm border border-[--color-border] rounded-lg outline-none focus:border-[--color-primary] transition-colors"
                    />
                  </div>
                ))}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 rounded-lg border border-[--color-border] text-sm font-semibold text-[--color-text-muted] hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-lg bg-[--color-primary] text-white text-sm font-bold hover:bg-[--color-primary-dark] transition-colors"
                  >
                    Add Activity
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

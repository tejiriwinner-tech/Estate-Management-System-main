"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Pencil, PhoneCall, Plus, Trash2, Check, X } from "lucide-react";

export interface DispatchContact {
  id: number;
  role: string;
  desk: string;
  contact: string;
}

export function DispatchContactsCard({ editable = true }: { editable?: boolean }) {
  const [contacts, setContacts] = useState<DispatchContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ role: "", desk: "", contact: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/security/dispatch-contacts", { cache: "no-store" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to load contacts");
      setContacts(Array.isArray(json?.data) ? json.data : []);
      setError(null);
    } catch (e: any) {
      setError(e?.message || "Could not load dispatch contacts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startAdd = () => {
    setEditingId(null);
    setForm({ role: "", desk: "", contact: "" });
    setAdding(true);
  };

  const startEdit = (c: DispatchContact) => {
    setAdding(false);
    setEditingId(c.id);
    setForm({ role: c.role, desk: c.desk || "", contact: c.contact });
  };

  const cancelEdit = () => {
    setAdding(false);
    setEditingId(null);
    setForm({ role: "", desk: "", contact: "" });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.role.trim() || !form.contact.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const isEdit = editingId !== null;
      const res = await fetch("/api/v1/security/dispatch-contacts", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isEdit
            ? { id: editingId, role: form.role.trim(), desk: form.desk.trim(), contact: form.contact.trim() }
            : { role: form.role.trim(), desk: form.desk.trim(), contact: form.contact.trim() }
        ),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to save contact");
      cancelEdit();
      await load();
    } catch (e: any) {
      setError(e?.message || "Could not save contact.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setError(null);
    try {
      const res = await fetch(`/api/v1/security/dispatch-contacts?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Could not delete contact.");
      await load();
    } catch (e: any) {
      setError(e?.message || "Could not delete contact.");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-5 w-5 text-emerald-600" />
          <div>
            <h2 className="text-base font-extrabold text-slate-900">Command Dispatch Contacts</h2>
            <p className="text-[11px] text-slate-500">
              Editable by Estate Admin &amp; Security Command
            </p>
          </div>
        </div>
        {editable && !adding && editingId === null && (
          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] px-3 py-1.5 text-xs font-extrabold text-white hover:bg-[#991B1B] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Contact
          </button>
        )}
      </div>

      {error && (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      )}

      {(adding || editingId !== null) && (
        <form onSubmit={handleSave} className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2.5">
          <p className="text-xs font-extrabold text-slate-800">
            {editingId !== null ? "Edit Dispatch Contact" : "New Dispatch Contact"}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              placeholder="Title (e.g. Chief Security Officer)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
            />
            <input
              type="text"
              value={form.desk}
              onChange={(e) => setForm({ ...form, desk: e.target.value })}
              placeholder="Post / Desk (e.g. Gate 1 Terminal)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
            />
            <input
              type="text"
              required
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              placeholder="Phone (e.g. +234 803...)"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B22222]"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              <Check className="w-3.5 h-3.5" /> {saving ? "Saving..." : "Save Contact"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="py-6 text-center text-xs text-slate-400">Loading dispatch contacts...</p>
      ) : contacts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/70 p-6 text-center">
          <p className="text-xs font-bold text-slate-700">No command dispatch contacts added yet.</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click <strong>Add Contact</strong> to set your real CSO, Gate 1, Gate 2, or Patrol phone numbers.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {contacts.map((c) => (
            <div key={c.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">{c.role}</p>
                {c.desk && <p className="text-[11px] text-slate-400 font-medium">{c.desk}</p>}
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${c.contact}`}
                  className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  {c.contact}
                </a>
                {editable && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(c)}
                      title="Edit contact"
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(c.id)}
                      title="Delete contact"
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

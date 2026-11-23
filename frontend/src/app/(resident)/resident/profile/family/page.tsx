"use client";

// Figma "User family members": Name, Role In Family, Age, Gender + "Add a Member".
import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { GreenButton, StateMsg, Table } from "@/components/resident/ui";
import { FamilyMember, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

const ROLES = ["Husband", "Wife", "Child", "Parent", "Sibling", "Relative", "Other"];

export default function FamilyTab() {
  const { data, error, loading, reload } = useResident<FamilyMember[]>("/family");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", role_in_family: "Child", age: "", gender: "Male" });
  const [msg, setMsg] = useState<string | null>(null);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await send("/family", "POST", { ...form, age: form.age === "" ? null : Number(form.age) });
      setOpen(false); setForm({ name: "", role_in_family: "Child", age: "", gender: "Male" }); setMsg(null); await reload();
    } catch (err) { setMsg(err instanceof Error ? err.message : "Could not add."); }
  };
  const remove = async (id: number) => { await send(`/family/${id}`, "DELETE"); await reload(); };

  return (
    <div>
      <StateMsg loading={loading} error={error} />
      {data && <Table empty="No family members added yet." head={["Name", "Role In Family", "Age", "Gender", ""]}
        rows={data.map((m) => [m.name, m.role_in_family, m.age ?? "-", m.gender ?? "-",
          <button key={m.id} aria-label={`Remove ${m.name}`} onClick={() => remove(m.id)} className="text-alert"><Trash2 className="h-5 w-5" /></button>])} />}
      <div className="mt-8 flex justify-end"><GreenButton onClick={() => setOpen(true)} className="w-48">Add a Member</GreenButton></div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={add} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-brand">Add a family member</h2>
            <input required aria-label="Name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-md border border-muted/50 px-3 py-2" />
            <select aria-label="Role in family" value={form.role_in_family} onChange={(e) => setForm({ ...form, role_in_family: e.target.value })} className="w-full rounded-md border border-muted/50 px-3 py-2">{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
            <div className="flex gap-3">
              <input aria-label="Age" type="number" min={0} max={120} placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} className="w-1/2 rounded-md border border-muted/50 px-3 py-2" />
              <select aria-label="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-1/2 rounded-md border border-muted/50 px-3 py-2"><option>Male</option><option>Female</option></select>
            </div>
            {msg && <p role="alert" className="text-sm text-alert">{msg}</p>}
            <div className="flex justify-end gap-3"><button type="button" onClick={() => setOpen(false)} className="rounded-md border border-muted/60 px-4 py-2">Cancel</button><GreenButton type="submit">Save</GreenButton></div>
          </form>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Building2, Mail, Phone, ShieldCheck, User } from "lucide-react";
import { GreenButton, StateMsg } from "@/components/resident/ui";
import { Profile, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

export default function AboutTab() {
  const { data, error, loading, reload } = useResident<Profile>("/profile");
  const [editing, setEditing] = useState(false);
  const [about, setAbout] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    if (data) setAbout(data.about ?? "");
  }, [data]);

  const save = async () => {
    try {
      await send("/profile", "PUT", { about });
      setEditing(false);
      setMsg(null);
      await reload();
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Could not save.");
    }
  };

  return (
    <div className="space-y-6">
      <StateMsg loading={loading} error={error} />
      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#B22222]" /> Full Name
              </p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">{data.name}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#C9A227]" /> House / Unit
              </p>
              <p className="text-sm font-extrabold text-slate-900 mt-1">{data.unit_number || "Unassigned"}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#B22222]" /> Email
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1 truncate">{data.email}</p>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone &amp; Status
              </p>
              <p className="text-sm font-bold text-slate-900 mt-1">{data.phone || "Not set"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#B22222]" /> Residence Bio &amp; Household Notes
              </h3>
            </div>
            {editing ? (
              <textarea
                aria-label="About"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm"
                placeholder="Write a short note about your household or residence..."
              />
            ) : (
              <p className="whitespace-pre-line text-sm text-slate-700 leading-relaxed">
                {data.about || "No bio added yet. Click Edit Bio to update your residence details."}
              </p>
            )}
            {msg && <p role="alert" className="mt-2 text-sm text-rose-600">{msg}</p>}
            <div className="mt-5 flex justify-end gap-3">
              {editing && (
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
              )}
              <GreenButton onClick={editing ? save : () => setEditing(true)} className="w-36 text-xs">
                {editing ? "Save Bio" : "Edit Bio"}
              </GreenButton>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

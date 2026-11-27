"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, User } from "lucide-react";

interface ResidentUser {
  id: number;
  name: string;
  email: string;
  unit_number?: string | null;
}

interface ChargeRow {
  id: number;
  user_id?: number | null;
  resident_name?: string;
  unit_number?: string;
  amount: number;
  status: string;
}

export default function AdminResidentFinanceDirectoryPage() {
  const [residents, setResidents] = useState<ResidentUser[]>([]);
  const [charges, setCharges] = useState<ChargeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/admin/users?role=resident&per_page=100", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => (Array.isArray(j?.data) ? j.data : [])),
      fetch("/api/v1/admin/service-charges", { cache: "no-store" })
        .then((r) => r.json())
        .then((j) => (Array.isArray(j?.data) ? j.data : [])),
    ])
      .then(([u, c]) => {
        setResidents(u);
        setCharges(c);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const summaries = useMemo(() => {
    return residents.map((r) => {
      const rName = (r.name || "").trim().toLowerCase();
      const rUnit = (r.unit_number || "").trim().toLowerCase();
      const mine = charges.filter((c) => {
        if (c.user_id && Number(c.user_id) === Number(r.id)) return true;
        if (!c.user_id && c.resident_name && c.resident_name.trim().toLowerCase() === rName) return true;
        if (!c.user_id && rUnit && c.unit_number && c.unit_number.trim().toLowerCase() === rUnit) return true;
        return false;
      });
      const paid = mine
        .filter((c) => String(c.status || "").toLowerCase() === "paid")
        .reduce((s, c) => s + Number(c.amount || 0), 0);
      const due = mine
        .filter((c) => String(c.status || "").toLowerCase() !== "paid")
        .reduce((s, c) => s + Number(c.amount || 0), 0);
      return { resident: r, paid, due, count: mine.length };
    });
  }, [residents, charges]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin/finance/outstanding"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#B22222] mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Outstanding Arrears</span>
          </Link>
          <h1 className="text-2xl font-black text-dark tracking-tight">Resident Finance Summary</h1>
          <p className="text-sm text-muted">
            Consolidated billing, settled invoices, and outstanding arrears per resident.
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
        {loading ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading resident financial summaries...</div>
        ) : summaries.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500">No registered residents found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-6">Resident</th>
                  <th className="py-3.5 px-4">Unit</th>
                  <th className="py-3.5 px-4">Paid</th>
                  <th className="py-3.5 px-4">Outstanding</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Statement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summaries.map(({ resident, paid, due, count }) => (
                  <tr key={resident.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-red-50 text-[#B22222] flex items-center justify-center shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{resident.name}</p>
                          <p className="text-[11px] text-slate-500">{resident.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">{resident.unit_number || "—"}</td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700">₦{paid.toLocaleString()}</td>
                    <td className="py-3.5 px-4 font-extrabold text-[#B22222]">₦{due.toLocaleString()}</td>
                    <td className="py-3.5 px-4">
                      {due > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          <Clock className="w-3 h-3" /> Arrears Due
                        </span>
                      ) : count > 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Cleared
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500">
                          No Bills
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/admin/finance/outstanding/resident/${resident.id}`}
                        className="inline-flex items-center gap-1 rounded-xl bg-[#B22222] hover:bg-[#991B1B] px-3 py-1.5 text-[11px] font-bold text-white transition-colors"
                      >
                        <span>View Ledger</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

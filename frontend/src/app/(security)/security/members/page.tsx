"use client";

import Link from "next/link";
import { Shield, Users, BadgeCheck, Mail, UserPlus } from "lucide-react";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";
import SecurityMembersTable, { type SecurityMember } from "@/components/security/members/SecurityMembersTable";

export default function SecurityMembersPage() {
  const { data, error } = useSecurityData<{ members: SecurityMember[] }>("/security/members", { members: [] });
  const members = data.members;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto">
      <SecurityError message={error} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#B22222] text-white flex items-center justify-center shadow-sm">
            <Shield className="w-6 h-6 text-[#C9A227]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Security Officers &amp; Duty Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {members.length} registered security personnel protecting Post Army Housing Estate.
            </p>
          </div>
        </div>
        <Link
          href="/admin/staffs"
          className="inline-flex items-center gap-2 rounded-xl bg-[#B22222] px-4 py-2 text-xs font-extrabold text-white hover:bg-[#991B1B] shadow-xs"
        >
          <UserPlus className="w-3.5 h-3.5" /> Manage Staff in Admin
        </Link>
      </div>

      {/* Officer Summary Cards */}
      {members.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((m) => (
            <div key={m.id} className="rounded-2xl bg-white border border-slate-200 p-4 shadow-2xs flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-[#B22222] flex items-center justify-center font-extrabold text-xs shrink-0">
                {(m.name || "SO").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-extrabold text-slate-900 truncate">{m.name}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-700 shrink-0">
                    <BadgeCheck className="w-3 h-3" /> Active
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{m.role || "Security Officer"}</p>
                {m.email && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1.5 truncate">
                    <Mail className="w-3 h-3 shrink-0" /> {m.email}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#B22222]" />
            <h3 className="text-sm font-extrabold text-slate-900">Registered Security Personnel</h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">{members.length} total</span>
        </div>
        <SecurityMembersTable members={members} />
      </div>
    </div>
  );
}

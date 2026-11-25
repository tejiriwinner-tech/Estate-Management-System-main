"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User, Trash2, Receipt, Plus, Search, CheckCircle2, Clock } from "lucide-react";
import { adminUsers, type AdminUser } from "@/lib/admin/api";
import { NewMemberInput } from "@/types/admin/member";
import { CreatingMemberOverlayModal } from "./CreatingMemberOverlayModal";
import { ServiceChargeModal, type ServiceChargeRecord } from "./ServiceChargeModal";
import { cn } from "@/lib/admin/utils";

interface MemberRow {
  id: number;
  name: string;
  house_no: string;
  date_moved_in: string;
}

const fmtDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-GB").replace(/\//g, "-") : "-";

const toRow = (u: AdminUser): MemberRow => ({
  id: u.id,
  name: u.name,
  house_no: u.unit_number || "-",
  date_moved_in: fmtDate(u.moved_in_at ?? u.created_at),
});

export function EstateMembersView() {
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Service charge state
  const [allCharges, setAllCharges] = useState<ServiceChargeRecord[]>([]);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedMemberForCharge, setSelectedMemberForCharge] = useState<MemberRow | null>(null);

  const loadCharges = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/admin/service-charges", { cache: "no-store" });
      const json = await res.json();
      setAllCharges(json.data || []);
    } catch {
      setAllCharges([]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await adminUsers.list({ role: "resident", per_page: 100 });
      setMembers(res.data.map(toRow));
      setTotalCount(res.meta.total);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load members.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    void loadCharges();
  }, [load, loadCharges]);

  const filteredMembers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return members;
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.house_no.toLowerCase().includes(q) ||
        m.date_moved_in.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Compute pending service charge amount per user
  const pendingByMember = useMemo(() => {
    const map = new Map<number, number>();
    for (const c of allCharges) {
      if (c.user_id && c.status === "Pending") {
        map.set(c.user_id, (map.get(c.user_id) || 0) + c.amount);
      }
    }
    return map;
  }, [allCharges]);

  const handleAddMember = async (p: NewMemberInput) => {
    try {
      await adminUsers.create({
        name: p.name,
        email: p.email,
        role: "resident",
        unit_number: p.house_no || undefined,
        moved_in_at: p.date_moved_in || undefined,
      });
      await load();
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add member.");
    }
  };

  const handleDeleteMember = async (record: MemberRow) => {
    if (!window.confirm(`Remove ${record.name} from the estate? This deletes their account.`)) return;
    try {
      await adminUsers.remove(record.id);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove the member.");
    }
  };

  const openMemberServiceCharge = (member: MemberRow) => {
    setSelectedMemberForCharge(member);
    setServiceModalOpen(true);
  };

  const openBulkServiceCharge = () => {
    setSelectedMemberForCharge(null);
    setServiceModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* ================= TOP EXECUTIVE SUMMARY BANNER ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/70 shadow-xs px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#B22222]/15 text-[#B22222] flex items-center justify-center shrink-0">
            <User className="w-7 h-7 stroke-[2]" />
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Registered Directory
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-dark tracking-tight">
                {loading ? "..." : totalCount}
              </span>
              <span className="text-sm font-bold text-slate-600">Estate Residents</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Bulk Service Charge + Add Member */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={openBulkServiceCharge}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Receipt className="w-4 h-4 text-[#C9A227]" />
            <span>Bill Estate Service Charge</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add a Member</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {/* ================= MEMBERS & SERVICE CHARGE TABLE CARD ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/70 shadow-xs overflow-hidden">
        {/* Top Toolbar */}
        <div className="px-6 py-4 bg-slate-50/60 border-b border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-extrabold text-dark">Estate Members &amp; Service Charges</h2>
            <p className="text-xs text-muted">Manage unit allocations, resident accounts, and monthly service charge levies</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search name or house unit…"
              aria-label="Search members of estate"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-xs font-medium text-dark placeholder:text-muted/80 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100/80 border-b border-border/70 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                <th className="py-3.5 pl-6 pr-4">Resident Name</th>
                <th className="py-3.5 px-4">House / Unit No</th>
                <th className="py-3.5 px-4">Date Moved In</th>
                <th className="py-3.5 px-4">Service Charge Status</th>
                <th className="py-3.5 pl-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/60 text-sm">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted font-medium">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2 py-4">
                        <span className="w-4 h-4 border-2 border-[#B22222] border-t-transparent rounded-full animate-spin inline-block" />
                        <span>Loading registered estate members…</span>
                      </span>
                    ) : searchQuery ? (
                      <>No estate members match &ldquo;{searchQuery}&rdquo;.</>
                    ) : (
                      "No estate members registered yet."
                    )}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => {
                  const pendingDue = pendingByMember.get(member.id) || 0;
                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="py-3.5 pl-6 pr-4 font-bold text-dark">
                        {member.name}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-bold text-slate-800 border border-slate-200">
                          {member.house_no}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                        {member.date_moved_in}
                      </td>
                      <td className="py-3.5 px-4">
                        {pendingDue > 0 ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>₦{pendingDue.toLocaleString()} Due</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Cleared</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 pl-4 pr-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openMemberServiceCharge(member)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-[#FEF2F2] hover:border-[#B22222]/30 text-xs font-bold text-slate-700 hover:text-[#B22222] transition-all shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5" />
                            <span>Service Charge</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMember(member)}
                            title={`Remove ${member.name}`}
                            aria-label={`Remove ${member.name}`}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 hover:bg-primary text-primary hover:text-white border border-red-200/70 transition-all active:scale-95"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards (< 640px) */}
        <div className="sm:hidden divide-y divide-border/60">
          {filteredMembers.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-muted font-medium">
              {loading ? "Loading members…" : searchQuery ? <>No estate members match &ldquo;{searchQuery}&rdquo;.</> : "No estate members yet."}
            </div>
          ) : (
            filteredMembers.map((member) => {
              const pendingDue = pendingByMember.get(member.id) || 0;
              return (
                <div key={member.id} className="p-4 space-y-3 bg-surface-card">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-sm font-extrabold text-dark">{member.name}</div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted font-semibold mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-dark font-bold">
                          {member.house_no}
                        </span>
                        <span>Moved in: {member.date_moved_in}</span>
                      </div>
                    </div>

                    {pendingDue > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        ₦{pendingDue.toLocaleString()} Due
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Cleared
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => openMemberServiceCharge(member)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#B22222]" />
                      <span>Service Charge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member)}
                      aria-label={`Remove ${member.name}`}
                      className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-border/60 flex items-center justify-between text-xs font-semibold text-muted">
          <span>Showing {filteredMembers.length} of {totalCount} registered members</span>
          <span>Post Army House Estate Administration</span>
        </div>
      </div>

      {/* Add Member Modal */}
      <CreatingMemberOverlayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />

      {/* Service Charge Modal (Single User or Bulk Estate Billing) */}
      <ServiceChargeModal
        isOpen={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        member={selectedMemberForCharge}
        onSaved={loadCharges}
      />
    </div>
  );
}

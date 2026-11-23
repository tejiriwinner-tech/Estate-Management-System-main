"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { User, Trash2 } from "lucide-react";
import { adminUsers, type AdminUser } from "@/lib/admin/api";
import { NewMemberInput } from "@/types/admin/member";
import { CreatingMemberOverlayModal } from "./CreatingMemberOverlayModal";
import { cn } from "@/lib/admin/utils";

interface MemberRow { id: number; name: string; house_no: string; date_moved_in: string }

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB").replace(/\//g, "-") : "-");
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
  useEffect(() => { void load(); }, [load]);

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

  const handleAddMember = async (p: NewMemberInput) => {
    await adminUsers.create({
      name: p.name,
      email: p.email,
      role: "resident",
      unit_number: p.house_no || undefined,
      moved_in_at: p.date_moved_in || undefined,
    });
    await load();
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

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">
      {/* ================= TOP SUMMARY BANNER CARD ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] px-5 sm:px-8 py-5 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: User Icon Box + 120 Members Of Estate */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="w-20 h-16 sm:w-24 sm:h-[72px] rounded-xl bg-accent-light/75 text-primary flex items-center justify-center shrink-0">
            <User className="w-10 h-10 sm:w-12 sm:h-12 fill-primary/85 text-primary stroke-[1.8]" />
          </div>

          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight leading-none">
              {totalCount}
            </div>
            <div className="text-base sm:text-xl font-bold text-muted mt-1.5">
              Members Of Estate
            </div>
          </div>
        </div>

        {/* Right: Solid "Add a Member" CTA Button */}
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm sm:text-lg font-extrabold shadow-xs transition-all active:scale-[0.99] w-full sm:w-auto text-center"
        >
          Add a Member
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {/* ================= LOWER TABLE CARD: LIST OF MEMBERS ================= */}
      <div className="bg-surface-card rounded-2xl border border-border/70 shadow-[0_4px_16px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Top Toolbar: "List of Members" + Search Box */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 bg-surface-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base sm:text-lg font-normal text-dark">
            List of Members
          </h2>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search members of estate"
            className="w-full sm:w-72 md:w-80 px-4 py-1.5 rounded-lg border border-border text-sm text-dark placeholder:text-muted/80 focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* ================= DESKTOP & TABLET ZEBRA TABLE (sm and up) ================= */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#E5E5E5] text-dark text-sm sm:text-base font-normal">
                <th className="py-3.5 pl-8 pr-4 text-center w-1/3 font-normal">
                  Name
                </th>
                <th className="py-3.5 px-4 text-center w-1/5 font-normal">
                  House No
                </th>
                <th className="py-3.5 px-4 text-center w-1/4 font-normal">
                  Date Moved In
                </th>
                <th className="py-3.5 pl-4 pr-8 text-center w-1/5 font-normal">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-10 text-center text-sm text-muted font-medium"
                  >
                    {loading ? "Loading members…" : searchQuery ? <>No estate members match &ldquo;{searchQuery}&rdquo;.</> : "No estate members yet."}
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member, index) => {
                  const isStriped = index % 2 === 1;
                  return (
                    <tr
                      key={member.id}
                      className={cn(
                        "text-sm sm:text-base text-dark transition-colors hover:bg-primary-light/15",
                        isStriped ? "bg-[#EAEAEA]" : "bg-surface-card"
                      )}
                    >
                      <td className="py-3.5 pl-8 pr-4 text-center font-normal text-dark">
                        {member.name}
                      </td>
                      <td className="py-3.5 px-4 text-center font-normal text-dark">
                        {member.house_no}
                      </td>
                      <td className="py-3.5 px-4 text-center font-normal text-dark">
                        {member.date_moved_in}
                      </td>
                      <td className="py-2.5 pl-4 pr-8 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member)}
                          title={`Remove ${member.name}`}
                          aria-label={`Remove ${member.name}`}
                          className="inline-flex items-center justify-center w-16 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white shadow-2xs transition-all active:scale-95"
                        >
                          <Trash2 className="w-4 h-4 stroke-[2.2]" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE RESPONSIVE ZEBRA CARDS (< 640px) ================= */}
        <div className="sm:hidden divide-y divide-border/60 border-t border-border/60">
          {filteredMembers.length === 0 ? (
            <div className="py-8 px-4 text-center text-xs text-muted font-medium">
              {loading ? "Loading members…" : searchQuery ? <>No estate members match &ldquo;{searchQuery}&rdquo;.</> : "No estate members yet."}
            </div>
          ) : (
            filteredMembers.map((member, index) => {
              const isStriped = index % 2 === 1;
              return (
                <div
                  key={member.id}
                  className={cn(
                    "p-4 flex items-center justify-between gap-3",
                    isStriped ? "bg-[#EAEAEA]/70" : "bg-surface-card"
                  )}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="text-sm font-extrabold text-dark truncate">
                      {member.name}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted font-semibold">
                      <span className="px-2 py-0.5 rounded-md bg-accent-light/75 text-dark font-bold">
                        {member.house_no}
                      </span>
                      <span>Moved in: {member.date_moved_in}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMember(member)}
                    title={`Remove ${member.name}`}
                    aria-label={`Remove ${member.name}`}
                    className="inline-flex items-center justify-center w-12 h-8 rounded-lg bg-primary hover:bg-primary-hover text-white shadow-2xs shrink-0 transition-all active:scale-95"
                  >
                    <Trash2 className="w-4 h-4 stroke-[2.2]" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* ================= CARD FOOTER ROW: "8 of 120" ================= */}
        <div className="px-5 sm:px-12 py-3.5 bg-surface-card border-t border-border/50 text-sm sm:text-base font-normal text-dark">
          {filteredMembers.length} of {totalCount}
        </div>
      </div>

      {/* Creating Member Overlay Modal (Task 18: CREATE NEW USER) */}
      <CreatingMemberOverlayModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMember={handleAddMember}
      />
    </div>
  );
}

"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";
import { staffApi } from "@/lib/admin/staffApi";
import { StaffsZebraListView } from "@/components/admin/staff/StaffsZebraListView";
import { EditStaffProfileModal } from "@/components/admin/staff/EditStaffProfileModal";
import { CreatingStaffOverlayModal } from "@/components/admin/staff/CreatingStaffOverlayModal";

export default function AllStaffsListPage() {
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try { setMembers(await staffApi.list()); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : "Could not load staff."); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  const mutate = async (fn: () => Promise<unknown>) => {
    try { await fn(); await reload(); } catch (e) { setError(e instanceof Error ? e.message : "That change failed."); }
  };
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleOpenEdit = (member: StaffMember) => {
    setSelectedMember(member);
    setIsEditOpen(true);
  };

  const handleCreateStaff = (data: Partial<StaffMember>) => { void mutate(() => staffApi.create(data)); };

  const handleSaveMember = (data: Partial<StaffMember>) => {
    if (!selectedMember) return;
    void mutate(() => staffApi.update(selectedMember.id, data));
  };

  const handleConfirmDelete = (id: number) => { void mutate(() => staffApi.remove(id)); };

  const handleDeleteMember = (member: StaffMember) => {
    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
      handleConfirmDelete(member.id);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300 pb-12">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/staffs"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-dark hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff Management</span>
        </Link>
      </div>

      <StaffsZebraListView
        members={members}
        totalCount={members.length}
        onEdit={handleOpenEdit}
        onDelete={handleDeleteMember}
        onCreateNewStaff={() => setIsCreateOpen(true)}
      />

      <CreatingStaffOverlayModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateStaff}
      />

      <EditStaffProfileModal
        member={selectedMember}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleSaveMember}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}

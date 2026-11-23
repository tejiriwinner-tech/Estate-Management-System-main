"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, UserX } from "lucide-react";
import { StaffMember } from "@/types/admin/staff";
import { staffApi } from "@/lib/admin/staffApi";
import { ProfileHeader } from "@/components/admin/staff/profile/ProfileHeader";
import { ProfileCover } from "@/components/admin/staff/profile/ProfileCover";
import { PersonalInfoCard } from "@/components/admin/staff/profile/PersonalInfoCard";
import { EmploymentCard } from "@/components/admin/staff/profile/EmploymentCard";
import { EditStaffProfileModal } from "@/components/admin/staff/EditStaffProfileModal";

export default function StaffProfilePage() {
  const params = useParams<{ id: string }>();
  const staffId = Number(params?.id);
  const [member, setMember] = useState<StaffMember | undefined>(undefined);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const all = await staffApi.list();
      setMember(all.find((s) => s.id === staffId));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load this profile.");
    } finally {
      setLoaded(true);
    }
  }, [staffId]);
  useEffect(() => { void load(); }, [load]);

  const persist = async (patch: Partial<StaffMember>) => {
    try {
      await staffApi.update(staffId, patch);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save changes.");
    }
  };

  if (!loaded) {
    return <p className="py-24 text-center text-sm text-muted">Loading profile…</p>;
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-24 px-4">
        <div className="w-16 h-16 rounded-2xl bg-primary-light text-primary flex items-center justify-center">
          <UserX className="w-8 h-8" />
        </div>
        <h1 className="mt-5 text-xl font-extrabold text-dark">Staff member not found</h1>
        <p className="text-sm text-muted mt-1 max-w-sm">
          The profile you are looking for does not exist or may have been removed.
        </p>
        <Link
          href="/admin/staffs"
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-bold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Staff Directory
        </Link>
      </div>
    );
  }

  const joined = member.created_at ? new Date(member.created_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const isSuspended = member.status === "suspended";

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12 max-w-6xl">
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</div>}
      <ProfileHeader
        name={member.name}
        isSuspended={isSuspended}
        onPrint={() => window.print()}
        onToggleSuspend={() => void persist({ status: member.status === "active" ? "suspended" : "active" })}
        onEdit={() => setIsEditOpen(true)}
      />

      <ProfileCover
        name={member.name}
        jobTitle={member.job_title}
        department={member.department || "—"}
        avatarUrl={
          member.avatar_url ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=B22222&color=fff&bold=true`
        }
        isSuspended={isSuspended}
      />

      {/* Row 1: Personal Info + Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        <div className="lg:col-span-5 xl:col-span-4">
          <PersonalInfoCard
            email={member.email}
            phone={member.phone || "—"}
            address="—"
          />
        </div>
      </div>

      {/* Row 2: Employment + Duties */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <EmploymentCard
          employeeId={member.staff_id || `#${member.id}`}
          joinDate={joined}
          department={member.department || "—"}
        />
      </div>

      <EditStaffProfileModal
        member={member}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={(data) => void persist(data)}
      />
    </div>
  );
}

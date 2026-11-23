"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { Download, Plus, ChevronRight, Users, UserCheck } from "lucide-react";
import { User, UserStats } from "@/types/admin/user";
import { adminUsers } from "@/lib/admin/api";
import { UserMetrics } from "@/components/admin/users/UserMetrics";
import { UserFilterBar } from "@/components/admin/users/UserFilterBar";
import { UserTableDesktop } from "@/components/admin/users/UserTableDesktop";
import { UserCardsMobile } from "@/components/admin/users/UserCardsMobile";
import { QuickTipCard } from "@/components/admin/users/QuickTipCard";
import { UserModal, ModalMode } from "@/components/admin/users/UserModal";

const initialStats: UserStats = {
  total_users: 0,
  total_users_trend: "+0%",
  pending_approval: 0,
  blocked_accounts: 0,
  active_staff: 0,
  active_staff_trend: "+0",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>(initialStats);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes] = await Promise.all([
        adminUsers.list({ per_page: 50, page: currentPage }),
        adminUsers.stats().catch(() => null),
      ]);

      const mappedUsers: User[] = usersRes.data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || "",
        role: u.role,
        status: u.status,
        unit_number: u.unit_number || null,
        staff_id: u.staff_id || null,
        job_title: u.job_title || null,
        avatar_url: u.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=B22222&color=fff&bold=true`,
      }));

      setUsers(mappedUsers);
      setTotalPages(usersRes.meta.last_page || 1);

      if (statsRes?.data) {
        setStats({
          total_users: statsRes.data.total_users,
          total_users_trend: "+4%",
          pending_approval: statsRes.data.pending_approval,
          blocked_accounts: statsRes.data.blocked_accounts,
          active_staff: statsRes.data.active_staff,
          active_staff_trend: "+2",
        });
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.unit_number && user.unit_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.staff_id && user.staff_id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.job_title && user.job_title.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedRole === "all" || selectedRole === "all roles") return true;
      if (selectedRole === "all_staff" || selectedRole === "all staff") {
        return ["manager", "agent", "maintenance", "security", "admin", "super_admin", "staff"].includes(
          user.role
        );
      }
      if (selectedRole === "managers") return user.role === "manager";
      if (selectedRole === "agents") return user.role === "agent";
      if (selectedRole === "maintenance") return user.role === "maintenance";
      if (selectedRole === "residents") return user.role === "resident";
      if (selectedRole === "security") return user.role === "security";

      return user.role === selectedRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleAddUser = () => {
    setActiveUser(null);
    setModalMode("add");
  };

  const handleEditUser = (user: User) => {
    setActiveUser(user);
    setModalMode("edit");
  };

  const handleViewUser = (user: User) => {
    setActiveUser(user);
    setModalMode("view");
  };

  const handleDeleteUser = (user: User) => {
    setActiveUser(user);
    setModalMode("delete");
  };

  const handleSuspendUser = (user: User) => {
    setActiveUser(user);
    setModalMode("suspend");
  };

  const handleConfirmDelete = async (id: number) => {
    try {
      await adminUsers.remove(id);
      await fetchUsers();
      setModalMode(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete user");
    }
  };

  const handleConfirmSuspend = async (id: number) => {
    try {
      await adminUsers.toggleStatus(id);
      await fetchUsers();
      setModalMode(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to change user status");
    }
  };

  const handleApprove = async (user: User) => {
    try {
      await adminUsers.approve(user.id);
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to approve user");
    }
  };

  const handleReject = async (user: User) => {
    try {
      await adminUsers.reject(user.id);
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reject user");
    }
  };

  const handleReactivate = async (user: User) => {
    try {
      await adminUsers.toggleStatus(user.id);
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to reactivate user");
    }
  };

  const handleSaveModal = async (data: Partial<User>) => {
    try {
      if (modalMode === "add") {
        await adminUsers.create({
          name: data.name || "New User",
          email: data.email || "",
          phone: data.phone || undefined,
          role: data.role || "resident",
          unit_number: data.unit_number || undefined,
          job_title: data.job_title || undefined,
          staff_id: data.staff_id || undefined,
        });
      } else if (modalMode === "edit" && activeUser) {
        await adminUsers.update(activeUser.id, {
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
          status: data.status,
          unit_number: data.unit_number,
          avatar_url: data.avatar_url,
        });
      }
      setModalMode(null);
      await fetchUsers();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Operation failed");
    }
  };

  const handleExportCSV = () => {
    const headers = ["ID", "Name", "Email", "Role", "Status", "Unit/House", "Staff ID", "Job Title"];
    const rows = filteredUsers.map((u) => [
      u.id,
      `"${u.name}"`,
      `"${u.email}"`,
      u.role,
      u.status,
      `"${u.unit_number || ""}"`,
      u.staff_id || "",
      `"${u.job_title || ""}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `LincolnEstate_Users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Switcher */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-card border border-border/70 rounded-2xl w-fit shadow-xs">
        <Link
          href="/admin/staffs"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-muted hover:text-dark hover:bg-surface-subtle transition-all"
        >
          <UserCheck className="w-4 h-4" />
          <span>Staff Directory</span>
        </Link>
        <Link
          href="/admin/users"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-primary text-white shadow-xs transition-all"
        >
          <Users className="w-4 h-4" />
          <span>Resident Management</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted mb-1.5">
            <Link href="/admin/dashboard" className="hover:text-dark transition-colors">
              Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-muted/60" />
            <span className="text-primary font-bold">User Management</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
            User Management
          </h1>
          <p className="text-xs sm:text-sm text-muted font-medium mt-1">
            <span className="hidden sm:inline">Manage estate residents and roles.</span>
            <span className="sm:hidden">Manage staff, roles, and permissions.</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-accent" />
            <span>Export</span>
          </button>

          <button
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold transition-all shadow-sm group"
          >
            <Plus className="w-4 h-4 stroke-[2.5] transition-transform group-hover:rotate-90" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Metrics */}
      <UserMetrics stats={stats} />

      {/* Filters */}
      <UserFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
      />

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Desktop Table + Quick Tip */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-9">
              <UserTableDesktop
                users={filteredUsers}
                totalCount={stats.total_users}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onView={handleViewUser}
                onApprove={handleApprove}
              />
            </div>

            <div className="lg:col-span-3">
              <QuickTipCard />
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <UserCardsMobile
              users={filteredUsers}
              onEdit={handleEditUser}
              onSuspend={handleSuspendUser}
              onApprove={handleApprove}
              onReject={handleReject}
              onReactivate={handleReactivate}
              onView={handleViewUser}
            />
          </div>
        </>
      )}

      <UserModal
        mode={modalMode}
        user={activeUser}
        isOpen={modalMode !== null}
        onClose={() => setModalMode(null)}
        onSave={handleSaveModal}
        onConfirmDelete={handleConfirmDelete}
        onConfirmSuspend={handleConfirmSuspend}
      />
    </div>
  );
}

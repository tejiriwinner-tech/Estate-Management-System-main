"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  UserPlus,
  ArrowRight,
  Users,
  LayoutGrid,
  Table2,
  Rows3,
  ListChecks,
} from "lucide-react";
import {
  StaffMember,
  StaffMetrics,
  StaffActivityItem,
  StaffStatus,
} from "@/types/admin/staff";
import { staffApi } from "@/lib/admin/staffApi";
import type { DepartmentAnalyticsData } from "@/types/admin/staff";
import { StaffMetricsBar } from "@/components/admin/staff/StaffMetricsBar";
import { StaffCard } from "@/components/admin/staff/StaffCard";
import { RecentActivityWidget } from "@/components/admin/staff/RecentActivityWidget";
import { StaffTipWidget } from "@/components/admin/staff/StaffTipWidget";
import { EditStaffProfileModal } from "@/components/admin/staff/EditStaffProfileModal";
import { CreateStaffModal } from "@/components/admin/staff/CreateStaffModal";
import { StaffFilterBar } from "@/components/admin/staff/StaffFilterBar";
import { StaffManagementTable } from "@/components/admin/staff/StaffManagementTable";
import { DepartmentOverviewCard } from "@/components/admin/staff/DepartmentOverviewCard";
import { StaffHorizontalListView } from "@/components/admin/staff/StaffHorizontalListView";
import { StaffsZebraListView } from "@/components/admin/staff/StaffsZebraListView";
import { CreatingStaffOverlayModal } from "@/components/admin/staff/CreatingStaffOverlayModal";
import { cn } from "@/lib/admin/utils";

const PAGE_SIZE = 6;

export default function StaffPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<
    "staffs_list" | "list" | "table" | "grid"
  >("staffs_list");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [metrics, setMetrics] = useState<StaffMetrics>({ total_staff: 0, active: 0, active_pct: "0%", suspended: 0, new_joining: 0 });
  const [deptAnalytics, setDeptAnalytics] = useState<DepartmentAnalyticsData>({ departments: [] });
  const [activities, setActivities] = useState<StaffActivityItem[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const zebraStaffList = staffList;

  const reload = useCallback(async () => {
    try {
      const [list, m, acts] = await Promise.all([staffApi.list(), staffApi.metrics(), staffApi.activities()]);
      setStaffList(list);
      const { department_overview, ...counts } = m;
      setMetrics(counts);
      setDeptAnalytics(department_overview);
      setActivities(acts);
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Could not load staff.");
    }
  }, []);
  useEffect(() => { void reload(); }, [reload]);

  // Run an API change, then refresh everything from the server.
  const mutate = async (fn: () => Promise<unknown>) => {
    try { await fn(); await reload(); } catch (e) { setLoadError(e instanceof Error ? e.message : "That change failed."); }
  };
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSimpleCreateOverlayOpen, setIsSimpleCreateOverlayOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);

  // Filters & Selection for Table View (Figma Staff 5)
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<StaffStatus | "all">("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter for Grid View (Figma Staff 1)
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);

  // Horizontal List View: the four most recently added staff
  const horizontalListStaff = useMemo(() => staffList.slice(0, 4), [staffList]);

  // Distinct departments list
  const departments = useMemo(() => {
    const set = new Set<string>();
    staffList.forEach((s) => {
      if (s.department) set.add(s.department);
    });
    return Array.from(set);
  }, [staffList]);

  // Filtered staff list for Table View
  const filteredTableStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchesDept =
        selectedDepartment === "all" || s.department === selectedDepartment;
      const matchesStatus =
        selectedStatus === "all" || s.status === selectedStatus;
      return matchesDept && matchesStatus;
    });
  }, [staffList, selectedDepartment, selectedStatus]);

  // Paginated rows for Table View (6 per page, matching Figma Staff 5)
  const paginatedTableStaff = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTableStaff.slice(start, start + PAGE_SIZE);
  }, [filteredTableStaff, currentPage]);

  const totalMembersDisplay = filteredTableStaff.length;
  const totalPagesDisplay = Math.max(1, Math.ceil(filteredTableStaff.length / PAGE_SIZE));

  // Filtered staff list for Card Directory View
  const displayedGridStaff = useMemo(() => {
    if (filterActiveOnly) {
      return staffList.filter((s) => s.status === "active");
    }
    return staffList;
  }, [staffList, filterActiveOnly]);

  // Selection handlers
  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    const pageIds = paginatedTableStaff.map((m) => m.id);
    const allSelected =
      pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const handleBulkStatusChange = (status: StaffStatus) => {
    const ids = selectedIds;
    setSelectedIds([]);
    void mutate(() => Promise.all(ids.map((id) => staffApi.update(id, { status }))));
  };

  // Staff CRUD handlers
  const handleOpenAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleViewProfile = (member: StaffMember) => {
    router.push(`/admin/staffs/${member.id}`);
  };

  const handleOpenEdit = (member: StaffMember) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const handleToggleMemberStatus = (member: StaffMember) => {
    const next: StaffStatus = member.status === "suspended" ? "active" : "suspended";
    void mutate(() => staffApi.update(member.id, { status: next }));
  };

  const handleCreateStaff = (data: Partial<StaffMember>) => {
    setCurrentPage(1);
    void mutate(() => staffApi.create(data));
  };

  const handleConfirmDelete = (id: number) => {
    setSelectedIds((prev) => prev.filter((selId) => selId !== id));
    void mutate(() => staffApi.remove(id));
  };

  const handleDeleteMember = (member: StaffMember) => {
    if (confirm(`Are you sure you want to remove ${member.name}?`)) {
      handleConfirmDelete(member.id);
    }
  };

  const handleSaveMember = (data: Partial<StaffMember>) => {
    if (!selectedMember) return;
    void mutate(() => staffApi.update(selectedMember.id, data));
  };

  // Export Staff to CSV
  const handleExportCSV = () => {
    const headers = [
      "Staff ID",
      "Full Name",
      "Email",
      "Phone",
      "Role",
      "Department",
      "Status",
    ];
    const source =
      viewMode === "table"
        ? filteredTableStaff
        : viewMode === "staffs_list"
          ? zebraStaffList
          : viewMode === "list"
            ? horizontalListStaff
            : displayedGridStaff;
    const rows = source.map((s) => [
      s.staff_id,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.phone || ""}"`,
      `"${s.job_title}"`,
      `"${s.department || ""}"`,
      s.status,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `LincolnEstate_Staff_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {loadError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{loadError}</div>
      )}
      {/* ================= TOP VIEW & MODULE SWITCHER ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface-card border border-border/70 rounded-2xl w-fit shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("staffs_list")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              viewMode === "staffs_list"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            )}
          >
            <ListChecks className="w-4 h-4" />
            <span>Staffs List</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              viewMode === "list"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            )}
          >
            <Rows3 className="w-4 h-4" />
            <span>Staff Cards</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              viewMode === "table"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            )}
          >
            <Table2 className="w-4 h-4" />
            <span>Staff Table</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all",
              viewMode === "grid"
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:text-dark hover:bg-surface-subtle"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Staff Directory</span>
          </button>

          <Link
            href="/admin/users"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-muted hover:text-dark hover:bg-surface-subtle transition-all"
          >
            <Users className="w-4 h-4" />
            <span>Resident Management</span>
          </Link>
        </div>
      </div>

      {/* ================= VIEW 1: FIGMA "staffs List" ZEBRA TABLE (TASK 9) ================= */}
      {viewMode === "staffs_list" ? (
        <StaffsZebraListView
          members={zebraStaffList}
          totalCount={staffList.length}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteMember}
          onCreateNewStaff={() => setIsSimpleCreateOverlayOpen(true)}
        />
      ) : viewMode === "list" ? (
        /* ================= VIEW 2: FIGMA "staffs" HORIZONTAL CARDS ================= */
        <StaffHorizontalListView
          members={horizontalListStaff}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteMember}
          onCreateNewStaff={() => setIsSimpleCreateOverlayOpen(true)}
          onViewAllStaff={() => setViewMode("staffs_list")}
        />
      ) : (
        <>
          {/* ================= TITLE & ACTION BUTTONS (TABLE & GRID VIEWS) ================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark tracking-tight">
                Staff Management
              </h1>
              <p className="text-xs sm:text-sm text-muted font-medium mt-1">
                {viewMode === "table"
                  ? "Manage and monitor employee performance and roles across departments."
                  : "Oversee and manage your real estate operational team."}
              </p>
            </div>

            {/* Action Buttons: Export + Add New Staff (Primary #B22222) */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface-card hover:bg-surface-subtle text-xs sm:text-sm font-bold text-dark shadow-xs transition-all"
              >
                <Download className="w-4 h-4 text-dark/80" />
                <span>{viewMode === "table" ? "Export" : "Export Staff"}</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAdd}
                className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-xs transition-all group"
              >
                <UserPlus className="w-4 h-4 stroke-[2.2] transition-transform group-hover:scale-110" />
                <span>{viewMode === "table" ? "Add New Staff" : "Add Staff"}</span>
              </button>
            </div>
          </div>

          {/* ================= VIEW 3: FIGMA STAFF 5 TABLE & ANALYTICS ================= */}
          {viewMode === "table" ? (
            <div className="space-y-6">
              <StaffFilterBar
                selectedDepartment={selectedDepartment}
                onDepartmentChange={(dept) => {
                  setSelectedDepartment(dept);
                  setCurrentPage(1);
                }}
                selectedStatus={selectedStatus}
                onStatusChange={(status) => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                departments={departments}
                selectedCount={selectedIds.length}
                onClearSelection={() => setSelectedIds([])}
                onBulkStatusChange={handleBulkStatusChange}
              />

              <StaffManagementTable
                members={paginatedTableStaff}
                totalMembersCount={totalMembersDisplay}
                currentPage={currentPage}
                totalPages={totalPagesDisplay}
                onPageChange={(page) => setCurrentPage(page)}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
                onView={handleViewProfile}
                onEdit={handleOpenEdit}
                onToggleStatus={handleToggleMemberStatus}
                onDelete={handleDeleteMember}
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-12">
                  <DepartmentOverviewCard analytics={deptAnalytics} />
                </div>
              </div>
            </div>
          ) : (
            /* ================= VIEW 4: FIGMA STAFF 1 DIRECTORY CARDS ================= */
            <div className="space-y-6 sm:space-y-8">
              <StaffMetricsBar metrics={metrics} />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-extrabold text-dark tracking-tight">
                      Staff Directory
                    </h2>
                    <button
                      type="button"
                      onClick={() => setFilterActiveOnly(!filterActiveOnly)}
                      className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
                    >
                      <span>{filterActiveOnly ? "Show All Staff" : "View All"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {displayedGridStaff.map((member) => (
                      <StaffCard
                        key={member.id}
                        member={member}
                        onView={handleViewProfile}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteMember}
                      />
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                  <RecentActivityWidget activities={activities} />
                  <StaffTipWidget />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= FIGMA "creating staff ol" OVERLAY MODAL (TASK 10) ================= */}
      <CreatingStaffOverlayModal
        isOpen={isSimpleCreateOverlayOpen}
        onClose={() => setIsSimpleCreateOverlayOpen(false)}
        onSave={handleCreateStaff}
      />

      {/* ================= FIGMA STAFF 3 CREATE MODAL (TASK 6) ================= */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateStaff}
        staffSequence={staffList.length + 1}
      />

      {/* ================= FIGMA STAFF 2 EDIT MODAL (TASK 5) ================= */}
      <EditStaffProfileModal
        member={selectedMember}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveMember}
        onDelete={handleConfirmDelete}
      />
    </div>
  );
}

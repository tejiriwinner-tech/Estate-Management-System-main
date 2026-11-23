import { adminFetch } from "./api";
import type { StaffActivityItem, StaffMember, StaffMetrics, DepartmentAnalyticsData } from "@/types/admin/staff";

export interface StaffMetricsResponse extends StaffMetrics { department_overview: DepartmentAnalyticsData }

export const staffApi = {
  list: async () => (await adminFetch<{ data: StaffMember[] }>("/staff")).data,
  metrics: async () => (await adminFetch<{ data: StaffMetricsResponse }>("/staff/metrics")).data,
  activities: async () => (await adminFetch<{ data: StaffActivityItem[] }>("/staff/activities")).data,
  create: (b: Partial<StaffMember>) => adminFetch("/staff", { method: "POST", body: JSON.stringify(b) }),
  update: (id: number, b: Partial<StaffMember>) => adminFetch(`/staff/${id}`, { method: "PUT", body: JSON.stringify(b) }),
  remove: (id: number) => adminFetch(`/staff/${id}`, { method: "DELETE" }),
};

export type StaffStatus = 'active' | 'on_leave' | 'suspended';

export interface StaffMember {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  job_title: string;
  department?: string | null;
  staff_id: string; // e.g. 'LE - 2024 - 001' or '#LE-4492'
  status: StaffStatus;
  avatar_url?: string | null;
  employment_type?: 'full_time' | 'contract';
  created_at?: string;
}

export interface StaffMetrics {
  total_staff: number;
  total_trend?: string;
  active: number;
  active_pct: string; // e.g. '95%'
  suspended: number;
  suspended_diff?: string;
  new_joining: number;
  new_joining_badge?: string;
}

export interface StaffActivityItem {
  id: number;
  staff_name: string;
  action_text: string;
  target_entity?: string;
  timestamp_display: string;
  dot_color: 'green' | 'red' | 'blue' | 'gold';
}

/* ---------- Staff Profile Detail (Task 7) ---------- */

export interface PerformancePoint {
  month: string; // e.g. 'JAN'
  value: number; // 0 - 100
}

export type DutyFrequency = 'daily' | 'urgent' | 'weekly' | 'monthly';
export type DutyIcon = 'building' | 'file' | 'handshake' | 'wrench' | 'shield';

export interface StaffDuty {
  id: number;
  title: string;
  subtitle: string;
  frequency: DutyFrequency;
  icon: DutyIcon;
}

export type DocumentKind = 'pdf' | 'id' | 'verified' | 'file';

export interface StaffDocument {
  id: number;
  name: string;
  kind: DocumentKind;
  meta: string; // e.g. 'Signed: Oct 11, 2021'
}

export interface StaffProfileDetail {
  employee_id: string;
  home_address: string;
  join_date: string;
  reports_to: { name: string; avatar_url: string };
  leave_used: number;
  leave_total: number;
  performance_year: string;
  performance: PerformancePoint[];
  duties: StaffDuty[];
  documents: StaffDocument[];
}

/* ---------- Department Overview & Performance Goal (Task 8 - Staff 5) ---------- */

export interface DepartmentBarItem {
  code: 'OPS' | 'FIN' | 'MAINT' | 'LEGAL' | 'HR';
  label: string;
  count: number;
  percentage: number; // 0 - 100 bar height
}

export interface DepartmentAnalyticsData {
  retention_rate?: string; // only shown when the backend can compute it
  avg_tenure?: string;
  hiring_target?: string;
  departments: DepartmentBarItem[];
  goal?: {
    title: string;
    subtitle: string;
    achieved_pct: number;
  };
}


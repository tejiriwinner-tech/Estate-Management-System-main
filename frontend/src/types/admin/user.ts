export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'manager'
  | 'agent'
  | 'maintenance'
  | 'security'
  | 'resident'
  | 'staff';

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  staff_id?: string | null; // e.g. 'STF-4829', 'STF-PEND', 'STF-3391'
  job_title?: string | null; // e.g. 'Senior Property Manager', 'Leasing Agent', 'Maintenance Tech'
  department?: string | null;
  unit_number?: string | null; // e.g. 'Villa A-402', 'Block B, 204', 'Gate 1'
  avatar_url?: string | null;
  requested_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface UserStats {
  total_users: number;
  total_users_trend: string;
  pending_approval: number;
  blocked_accounts: number;
  active_staff: number;
  active_staff_trend: string;
}

export interface UserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  per_page?: number;
}

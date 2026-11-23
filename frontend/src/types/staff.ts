export interface StaffMember {
  id: string;
  name: string;
  role: string;
  code: string; // e.g., #LE-2940
  avatarUrl?: string;
  isOnline: boolean;
  email: string;
  department: string;
}

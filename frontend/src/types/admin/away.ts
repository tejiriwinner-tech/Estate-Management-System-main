export type AwayStatusType = "away" | "check_required";

export interface AwayMetricCard {
  id: string;
  label: string;
  value: number;
  iconType: "away" | "returns" | "alerts";
}

export interface AwayResidentRecord {
  id: number;
  initials: string;
  resident_name: string;
  unit: string;
  departure_date: string;       // e.g. 'Nov 10, 2023'
  expected_return_date: string; // e.g. 'Nov 25, 2023'
  is_overdue?: boolean;
  status: AwayStatusType;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notify_security: boolean;
  suspend_packages: boolean;
  user_id?: number | null;
  departure_iso?: string;
  expected_return_iso?: string;
}

export interface UpcomingReturnItem {
  id: number;
  month_short: string; // 'NOV'
  day: string;         // '18', '20', '25'
  resident_name: string;
  unit: string;
  has_warning?: boolean;
  highlight_badge?: boolean;
}

export interface ResidentSelectOption {
  label: string;
  resident_name: string;
  unit: string;
  initials: string;
  user_id?: number;
}

export interface AwaySavePayload {
  user_id?: number | null;
  resident_name: string;
  unit: string;
  departure_date: string;       // yyyy-mm-dd
  expected_return_date: string; // yyyy-mm-dd
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  notes?: string;
  notify_security?: boolean;
  suspend_packages?: boolean;
}

export type MobileAwayLogStatus = "AWAY" | "RETURNING SOON";

export interface MobileAwayMetric {
  id: string;
  label: string;
  value: number;
  iconType: "currently_away" | "returning_week";
}

export interface MobileActiveAwayLogItem {
  id: number;
  resident_name: string;
  unit: string;
  status: MobileAwayLogStatus;
  date_range: string; // e.g. 'Oct 12 - Oct 25'
  from_date?: string;
  to_date?: string;
  footer_note: string; // e.g. 'Contact: Sister (055-1234)' or 'Notes: Check mail'
}

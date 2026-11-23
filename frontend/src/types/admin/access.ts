export type AccessMetricIconType = "checkin" | "checkout" | "residents" | "visitors";

export interface AccessMetricCard {
  id: string;
  label: string;
  value: string;
  iconType: AccessMetricIconType;
}

export type AccessStatus = "in_estate" | "checked_out";

export type AccessGate = "Main Gate" | "Service Gate" | "East Gate";

export interface AccessLogItem {
  id: number;
  name: string;
  person_type: string; // e.g. 'Resident', 'Visitor (Food Delivery)', 'Visitor (Guest)'
  avatar_url?: string;
  initials?: string;
  house_no: string;
  check_in: string;
  check_out: string;
  gate: AccessGate;
  status: AccessStatus;
}

export interface SecurityIncident {
  id: number;
  time: string;
  gate: AccessGate;
  plate: string;
  description: string;
  resolved: boolean;
}

export interface SecuritySummaryData {
  vehicles_entered: number;
  vehicles_trend?: string;
  pedestrians: number;
  pedestrians_trend?: string;
  alert_title: string;
  alert_description: string;
  incidents: SecurityIncident[];
  active_personnel: {
    id: number;
    name: string;
    role: string;
    avatar_url: string;
  }[];
  extra_personnel_count: number;
}

/* ---------- Check-In / Check-Out (Mobile - Task 12) ---------- */

export type MobileAccessBadgeType = "Resident" | "Visitor" | "Service";
export type MobileAccessActionType = "Check-in" | "Check-out";

export interface MobileAccessMetric {
  id: string;
  label: string; // e.g. 'Total Check-ins'
  value: string; // e.g. '142'
  iconType: "checkin" | "checkout" | "residents" | "visitors";
}

export interface MobileAccessLogCardItem {
  id: number;
  initials: string; // 'JS', 'AD', 'DP'
  name: string;     // 'John Smith', 'Alice Doe', 'Delivery Pro'
  unit_label: string; // 'Unit 402', 'Visiting: Unit 105', 'Delivery: Block B'
  badge_type: MobileAccessBadgeType;
  action_type: MobileAccessActionType;
  time: string;
  gate: AccessGate;
  vehicle: string;  // 'ABC-1234', 'Walk-in', 'XYZ-9876'
}


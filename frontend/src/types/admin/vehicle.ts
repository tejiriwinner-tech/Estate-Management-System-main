export type VehicleStatus = "active" | "disabled" | "pending";
export type VehicleOwnerRole = "Resident" | "Vendor" | "Visitor";

export interface VehicleMetricItem {
  id: string;
  label: string;
  value: number;
  iconType: "registered" | "visitor" | "pending" | "disabled";
}

export interface VehicleRecord {
  id: number;
  initials: string;
  owner_name: string;
  owner_role: VehicleOwnerRole;
  house_unit: string;
  vehicle_type: string; // e.g. 'SUV - Toyota Land Cruiser'
  plate_number: string; // e.g. 'LND - 234 - XG'
  status: VehicleStatus;
}

export interface ScannerFeed {
  id: string;
  name: string;
  ip_address: string;
  status: "online" | "offline";
  offline_label?: string; // e.g. 'OFFLINE - Check Conn.'
}

/* ---------- Vehicle Management (Mobile - Task 14) ---------- */

export interface MobileVehicleMetric {
  id: string;
  label: string; // 'Total Registered', 'Active Scanners', 'Entries Today'
  value: string; // '1,248', '4 / 4', '342'
  iconType: "car" | "scan" | "entry";
}

export interface MobileScannerItem {
  id: string;
  name: string;      // 'Main Gate Entrance', 'Main Gate Exit', 'Service Gate'
  last_ping: string; // 'Last ping: 2 mins ago'
  online: boolean;
}

export interface MobileVehicleDirectoryItem {
  id: number;
  plate: string;         // 'ABC-1234', 'XYZ-9876', 'LMN-4567'
  make_color: string;    // 'Toyota Camry - Silver'
  badge: "RESIDENT" | "VISITOR";
  owner_display: string; // 'John Doe', 'Jane Smith (Host: B, 204)', 'Mike Johnson'
  sub_info: string;      // 'Block A, 102', 'Valid till 8 PM', 'Block C, 301'
  sub_icon: "home" | "clock";
}


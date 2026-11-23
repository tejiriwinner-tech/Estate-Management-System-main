// ─── Finance Report Center Types (Task 17) ───────────────────────────────────

export interface ReportFilterState {
  month: string;
  year: string;
  service: string;
  area: string;
  status: string;
}

export type ReportIconType =
  | "monthly"
  | "yearly"
  | "service"
  | "resident"
  | "outstanding";

export type ReportBadgeTone = "primary" | "accent" | "critical" | "neutral";

export interface ReportTemplateCard {
  id: string;
  title: string;
  description: string;
  badgeLabel: string;
  badgeTone: ReportBadgeTone;
  iconType: ReportIconType;
}

export interface ReportUsageMetrics {
  title: string;
  subtitle: string;
  totalDownloads: number;
  barHeights: number[]; // percentage heights for the 5 histogram bars
}

export interface RecentExportItem {
  id: string;
  fileName: string;
  generatedBy: string;
  dateTime: string;
  format: "PDF" | "XLSX" | "CSV";
  downloadUrl: string;
}

export interface ReportCenterData {
  templates: ReportTemplateCard[];
  usageMetrics: ReportUsageMetrics;
  recentExports: RecentExportItem[];
}

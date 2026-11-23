// Agent Dashboard type definitions

export type AgentKpiIcon =
  | "agents"
  | "listings"
  | "leads"
  | "deals"
  | "commission"
  | "rating";

export interface AgentKpi {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  subtitleType: "trend-up" | "trend-down" | "neutral" | "warning";
  icon: AgentKpiIcon;
  badgeBg: string;
}

export interface AgentPerformancePoint {
  month: string;
  dealsClosed: number;
  commission: number;
}

export type PipelineStage =
  | "New Leads"
  | "Contacted"
  | "Viewing Scheduled"
  | "Negotiation"
  | "Closed Won";

export interface PipelineStageData {
  stage: PipelineStage;
  count: number;
  color: string;
}

export type AgentStatus = "Active" | "On Leave" | "Inactive";

export const AGENT_STATUSES: AgentStatus[] = ["Active", "On Leave", "Inactive"];

export const AGENT_ZONES = [
  "Phase 1 – Lekki",
  "Phase 2 – Ajah",
  "Phase 3 – Sangotedo",
] as const;

export interface Agent {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  zone: string;
  status: AgentStatus;
  joinedOn: string; // ISO date
  activeListings: number;
  openLeads: number;
  dealsClosed: number;
  commission: number;
  targetProgress: number; // % of quarterly target
  rating: number; // 0 - 5 (0 = no reviews yet)
  reviews: number;
  avatarBg: string;
}

export type ViewingStatus = "Confirmed" | "Pending" | "Rescheduled";

export interface UpcomingViewing {
  id: string;
  property: string;
  client: string;
  agentId: string;
  date: string; // ISO date
  time: string;
  status: ViewingStatus;
}

export interface AgentDashboardData {
  performance: AgentPerformancePoint[];
  pipeline: PipelineStageData[];
  agents: Agent[];
  viewings: UpcomingViewing[];
}

export interface NewAgentInput {
  name: string;
  email: string;
  phone: string;
  zone: string;
  status: AgentStatus;
}

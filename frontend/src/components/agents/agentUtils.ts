import { Agent, AgentKpi } from "@/types/agent";

export const formatNaira = (amount: number) => `₦${amount.toLocaleString()}`;

export const formatNairaShort = (amount: number) => {
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₦${Math.round(amount / 1_000)}K`;
  return `₦${amount}`;
};

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString(
    "en-GB",
    opts ?? { day: "numeric", month: "short", year: "numeric" }
  );

/** All headline numbers are derived from the agent roster so cards and table always agree. */
export function buildAgentKpis(agents: Agent[]): AgentKpi[] {
  const active = agents.filter((a) => a.status === "Active").length;
  const onLeave = agents.filter((a) => a.status === "On Leave").length;
  const listings = agents.reduce((s, a) => s + a.activeListings, 0);
  const leads = agents.reduce((s, a) => s + a.openLeads, 0);
  const deals = agents.reduce((s, a) => s + a.dealsClosed, 0);
  const commission = agents.reduce((s, a) => s + a.commission, 0);
  const reviews = agents.reduce((s, a) => s + a.reviews, 0);
  const avgRating = reviews
    ? agents.reduce((s, a) => s + a.rating * a.reviews, 0) / reviews
    : 0;
  const unassignedLeads = Math.round(leads * 0.15);

  return [
    {
      id: "total-agents",
      title: "Total Agents",
      value: String(agents.length),
      subtitle: `${active} active · ${onLeave} on leave`,
      subtitleType: "neutral",
      icon: "agents",
      badgeBg: "bg-blue-50",
    },
    {
      id: "active-listings",
      title: "Active Listings",
      value: String(listings),
      subtitle: "↗ 9 new this week",
      subtitleType: "trend-up",
      icon: "listings",
      badgeBg: "bg-purple-50",
    },
    {
      id: "open-leads",
      title: "Open Leads",
      value: String(leads),
      subtitle: `${unassignedLeads} awaiting follow-up`,
      subtitleType: "warning",
      icon: "leads",
      badgeBg: "bg-amber-50",
    },
    {
      id: "deals-closed",
      title: "Deals Closed",
      value: String(deals),
      subtitle: "↗ 14% YTD vs last year",
      subtitleType: "trend-up",
      icon: "deals",
      badgeBg: "bg-emerald-50",
    },
    {
      id: "commission",
      title: "Commission",
      value: formatNairaShort(commission),
      subtitle: "↗ 8.2% YTD vs last year",
      subtitleType: "trend-up",
      icon: "commission",
      badgeBg: "bg-rose-50",
    },
    {
      id: "rating",
      title: "Client Rating",
      value: avgRating ? avgRating.toFixed(1) : "—",
      subtitle: `From ${reviews} reviews`,
      subtitleType: "neutral",
      icon: "rating",
      badgeBg: "bg-yellow-50",
    },
  ];
}

export function agentsToCsv(agents: Agent[]): string {
  const header = [
    "Agent ID",
    "Name",
    "Email",
    "Phone",
    "Zone",
    "Status",
    "Joined",
    "Active Listings",
    "Open Leads",
    "Deals Closed",
    "Commission (NGN)",
    "Target Progress (%)",
    "Rating",
  ];
  const escape = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = agents.map((a) =>
    [
      a.id,
      a.name,
      a.email,
      a.phone,
      a.zone,
      a.status,
      a.joinedOn,
      a.activeListings,
      a.openLeads,
      a.dealsClosed,
      a.commission,
      a.targetProgress,
      a.reviews ? a.rating.toFixed(1) : "",
    ]
      .map(escape)
      .join(",")
  );
  return [header.join(","), ...rows].join("\r\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv") {
  // BOM so Excel opens the ₦ / en-dash characters correctly
  const blob = new Blob(["﻿", content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

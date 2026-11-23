import { ClientRequest, Listing } from "@/types/agentPortal";

export const formatNaira = (n: number) => `₦${n.toLocaleString()}`;

export const formatNairaShort = (n: number) => {
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `₦${Math.round(n / 1_000)}K`;
  return `₦${n}`;
};

export { todayIso, nowTime } from "@/lib/dates";
import { todayIso } from "@/lib/dates";

const parse = (iso: string) => new Date(`${iso}T00:00:00`);

export const formatDate = (iso: string, opts?: Intl.DateTimeFormatOptions) =>
  parse(iso).toLocaleDateString("en-GB", opts ?? { day: "numeric", month: "short", year: "numeric" });

/** "Today", "Tomorrow" or e.g. "Mon, 16 Nov" */
export const dayLabel = (iso: string) => {
  const diff = Math.round((parse(iso).getTime() - parse(todayIso()).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return formatDate(iso, { weekday: "short", day: "numeric", month: "short" });
};

/** "16:00" -> "4:00 PM" */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
};

/** Available listings that fit what the client asked for, cheapest first. */
export function matchListings(request: ClientRequest, listings: Listing[]): Listing[] {
  return listings
    .filter(
      (l) =>
        l.status === "Available" &&
        l.beds >= request.minBeds &&
        l.rentPerYear <= request.maxBudget &&
        (request.zone === "Any" || l.zone === request.zone) &&
        (request.propertyType === "Any" || l.type === request.propertyType)
    )
    .sort((a, b) => a.rentPerYear - b.rentPerYear);
}

/** A short "what they want" line, e.g. "2+ bed Apartment · Phase 2 – Ajah · up to ₦3.5M/yr" */
export const requestSummary = (r: ClientRequest) =>
  [
    `${r.minBeds}+ bed ${r.propertyType === "Any" ? "home" : r.propertyType}`,
    r.zone === "Any" ? "Any zone" : r.zone,
    `up to ${formatNairaShort(r.maxBudget)}/yr`,
  ].join(" · ");

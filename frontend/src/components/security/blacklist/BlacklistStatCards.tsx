import { Ban, AlertTriangle, Eye, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface StatItem {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
}

interface Props {
  totalBlacklisted: number;
  highRiskAlerts: number;
  watchlistEntries: number;
  clearedRemoved: number;
  trends?: { blacklisted?: string; watch?: string; resolved?: string };
}

export default function BlacklistStatCards({
  totalBlacklisted,
  highRiskAlerts,
  watchlistEntries,
  clearedRemoved,
  trends,
}: Props) {
  const stats: StatItem[] = [
    {
      label: "Total Blacklisted",
      value: String(totalBlacklisted).padStart(2, "0"),
      icon: <Ban className="w-5 h-5 text-[--color-danger]" />,
      iconBg: "bg-[--color-danger-light]",
      trend: trends?.blacklisted,
      trendUp: false,
    },
    {
      label: "High Risk Alerts",
      value: String(highRiskAlerts).padStart(2, "0"),
      icon: <AlertTriangle className="w-5 h-5 text-[--color-warning]" />,
      iconBg: "bg-[--color-warning-light]",
    },
    {
      label: "Watchlist Entries",
      value: String(watchlistEntries).padStart(2, "0"),
      icon: <Eye className="w-5 h-5 text-[--color-info]" />,
      iconBg: "bg-[--color-info-light]",
      trend: trends?.watch,
      trendUp: true,
    },
    {
      label: "Cleared / Removed",
      value: String(clearedRemoved).padStart(2, "0"),
      icon: <ShieldCheck className="w-5 h-5 text-[--color-success]" />,
      iconBg: "bg-[--color-success-light]",
      trend: trends?.resolved,
      trendUp: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-xl border border-[--color-border] p-4 flex items-center gap-3"
        >
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.iconBg)}>
            {s.icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-[--color-text-muted] leading-tight">{s.label}</p>
            <p className="text-2xl font-bold text-[--color-text] tabular-nums mt-0.5">{s.value}</p>
            {s.trend && (
              <p className={cn("text-[10px] font-semibold mt-0.5", s.trendUp ? "text-[--color-success]" : "text-[--color-danger]")}>
                {s.trend}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

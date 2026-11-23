import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  subtext?: string;
  statusBadge?: { text: string; variant?: "green" | "gold" | "red" | "blue" };
  className?: string;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  subtext,
  statusBadge,
  className,
}: StatCardProps) {
  const badgeColors = {
    green: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    gold: "bg-amber-50 text-amber-700 border-amber-200/60",
    red: "bg-red-50 text-red-700 border-red-200/60",
    blue: "bg-blue-50 text-blue-700 border-blue-200/60",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FEF2F2] text-[#B22222]">
          <Icon className="h-5 w-5" />
        </div>
        {statusBadge && (
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
              badgeColors[statusBadge.variant || "green"]
            )}
          >
            {statusBadge.text}
          </span>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="text-2xl font-extrabold text-gray-900 mt-0.5">{value}</p>
        {subtext && (
          <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtext}</p>
        )}
      </div>
    </div>
  );
}

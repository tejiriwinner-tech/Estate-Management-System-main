import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export default function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl p-5 border border-[--color-border] flex items-center gap-4", className)}>
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[--color-primary-light] shrink-0">
        <Icon className="w-5 h-5 text-[--color-primary]" />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-[--color-text]">{value}</p>
        <p className="text-sm text-[--color-text-muted] mt-0.5 leading-tight">{label}</p>
        {trend && (
          <p className={cn("text-xs mt-1 font-medium", trend.positive ? "text-[--color-success]" : "text-[--color-danger]")}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}

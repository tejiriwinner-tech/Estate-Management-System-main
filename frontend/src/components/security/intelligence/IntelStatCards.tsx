import { AlertTriangle, CheckCircle, Users, Clock } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Props {
  urgentReports: number;
  resolvedToday: number;
  activePatrols?: number;
  pendingReview: number;
}

export default function IntelStatCards({ urgentReports, resolvedToday, activePatrols, pendingReview }: Props) {
  const stats = [
    {
      label: "Urgent Reports",
      value: String(urgentReports).padStart(2, "0"),
      icon: <AlertTriangle className="w-5 h-5 text-[--color-danger]" />,
      iconBg: "bg-[--color-danger-light]",
    },
    {
      label: "Resolved Today",
      value: String(resolvedToday).padStart(2, "0"),
      icon: <CheckCircle className="w-5 h-5 text-[--color-success]" />,
      iconBg: "bg-[--color-success-light]",
    },
    ...(activePatrols === undefined ? [] : [{
      label: "Active Patrols",
      value: String(activePatrols).padStart(2, "0"),
      icon: <Users className="w-5 h-5 text-[--color-primary]" />,
      iconBg: "bg-[--color-primary-light]",
    }]),
    {
      label: "Pending Review",
      value: String(pendingReview).padStart(2, "0"),
      icon: <Clock className="w-5 h-5 text-[--color-warning]" />,
      iconBg: "bg-[--color-warning-light]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl border border-[--color-border] p-4 flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.iconBg)}>
            {s.icon}
          </div>
          <div>
            <p className="text-xs font-medium text-[--color-text-muted] leading-tight">{s.label}</p>
            <p className="text-2xl font-bold text-[--color-text] tabular-nums mt-0.5">{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

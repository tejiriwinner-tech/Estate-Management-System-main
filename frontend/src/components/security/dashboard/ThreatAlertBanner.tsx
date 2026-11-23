import { AlertTriangle, X } from "lucide-react";

interface ThreatAlertBannerProps {
  count: number;
  onDismiss?: () => void;
  onView?: () => void;
}

export default function ThreatAlertBanner({ count, onDismiss, onView }: ThreatAlertBannerProps) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[--color-danger] text-white rounded-xl px-5 py-3.5">
      <div className="flex items-center gap-2.5">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <p className="text-sm font-semibold">
          {count} Life Under Threat Report{count !== 1 ? "s" : ""}!!
        </p>
      </div>
      <div className="flex items-center gap-2">
        {onView && (
          <button
            onClick={onView}
            className="text-xs font-semibold underline underline-offset-2 hover:no-underline"
          >
            View
          </button>
        )}
        {onDismiss && (
          <button onClick={onDismiss} className="p-0.5 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

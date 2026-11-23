import { QrCode, Check, Clock, User } from "lucide-react";
import { cn } from "@/lib/security/utils";

export interface GuestPass {
  id: string;
  name: string;
  subtitle: string;
  status: "cleared" | "expiring" | "pending";
}

interface Props {
  passes: GuestPass[];
  onNewPass?: () => void;
}

const STATUS_ICON = {
  cleared:  <Check className="w-3.5 h-3.5 text-[--color-success]" />,
  expiring: <Clock className="w-3.5 h-3.5 text-[--color-warning]" />,
  pending:  <Clock className="w-3.5 h-3.5 text-[--color-text-muted]" />,
};

export default function GuestPassesPanel({ passes }: Props) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QrCode className="w-4 h-4 text-[--color-primary]" />
        <h3 className="text-xs font-bold text-[--color-text] uppercase tracking-wide">Guest Passes</h3>
      </div>
      <p className="text-[10px] text-[--color-text-muted] -mt-1">Recent QR Clearances</p>

      <ul className="divide-y divide-[--color-border]">
        {passes.map((pass) => (
          <li key={pass.id} className="flex items-center justify-between py-2.5 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[--color-primary-light] flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-[--color-primary]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[--color-text]">{pass.name}</p>
                <p className="text-[10px] text-[--color-text-muted]">{pass.subtitle}</p>
              </div>
            </div>
            {STATUS_ICON[pass.status]}
          </li>
        ))}
      </ul>
    </div>
  );
}

import { cn } from "@/lib/security/utils";
import { Clock, ShieldAlert } from "lucide-react";
import Image from "next/image";

interface EstateUpdateCardProps {
  author: string;
  role: string;
  timestamp: string;
  body: string;
  imageUrl?: string;
  className?: string;
}

export default function EstateUpdateCard({
  author,
  role,
  timestamp,
  body,
  imageUrl,
  className,
}: EstateUpdateCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-[#B22222]" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Chief Security Officer Dispatch
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400">
            <Clock className="w-3 h-3" />
            <span>{timestamp}</span>
          </div>
        </div>

        {imageUrl && (
          <div className="relative h-44 w-full rounded-xl overflow-hidden bg-slate-100 mb-4">
            <Image
              src={imageUrl}
              alt="Security update"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        )}

        <div className="space-y-2">
          <div>
            <span className="text-xs font-extrabold text-[#B22222]">{author}</span>
            <span className="text-[11px] text-slate-500 font-medium"> • {role}</span>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{body}</p>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
        <span>Security Condition: NORMAL</span>
        <span className="text-[#B22222]">Estate Command Verified</span>
      </div>
    </div>
  );
}

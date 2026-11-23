import { cn } from "@/lib/security/utils";
import { Clock } from "lucide-react";
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
    <div className={cn("bg-white rounded-xl border border-[--color-border] overflow-hidden flex flex-col", className)}>
      {/* Image */}
      {imageUrl && (
        <div className="relative h-40 w-full bg-[--color-primary-light]">
          <Image
            src={imageUrl}
            alt="Estate update"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[--color-text]">
              Update From{" "}
              <span className="text-[--color-primary]">{author}</span>
            </p>
            <p className="text-xs text-[--color-text-muted]">{role}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Clock className="w-3 h-3 text-[--color-text-subtle]" />
            <span className="text-xs text-[--color-text-muted]">{timestamp}</span>
          </div>
        </div>
        <p className="text-sm text-[--color-text-muted] leading-relaxed">{body}</p>
      </div>
    </div>
  );
}

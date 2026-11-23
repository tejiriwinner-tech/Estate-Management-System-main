import { cn } from "@/lib/security/utils";
import { ChevronRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export interface IntelItem {
  id: string;
  title: string;
  snippet: string;
  tags: { label: string; variant: "suspicious" | "external" | "investigation" | "default" }[];
  time: string;
}

const TAG_STYLES = {
  suspicious:   "bg-yellow-100 text-yellow-700 border border-yellow-300",
  external:     "bg-teal-50   text-teal-700   border border-teal-300",
  investigation:"bg-[--color-danger-light] text-[--color-danger] border border-[--color-danger]",
  default:      "bg-gray-100  text-gray-600   border border-gray-300",
};

interface IntelFeedCardProps {
  items: IntelItem[];
}

export default function IntelFeedCard({ items }: IntelFeedCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[--color-border] flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text]">Intelligence Feed</h2>
      </div>

      {/* Items */}
      <ul className="divide-y divide-[--color-border] flex-1">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 px-5 py-3.5">
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
              <ImageIcon className="w-5 h-5 text-gray-400" />
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[--color-text] leading-snug line-clamp-2">{item.title}</p>
              <p className="text-[10px] text-[--color-text-muted] mt-0.5 line-clamp-2">{item.snippet}</p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {item.tags.map((tag) => (
                  <span key={tag.label} className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded", TAG_STYLES[tag.variant])}>
                    {tag.label}
                  </span>
                ))}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-[--color-border]">
        <Link
          href="/security/intelligence"
          className="flex items-center justify-center gap-1 w-full py-2 rounded-lg border border-[--color-border] text-xs font-semibold text-[--color-text-muted] hover:bg-gray-50 hover:text-[--color-primary] transition-colors"
        >
          View All Intel Reports <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

import { MapPin, ChevronRight, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/security/utils";

export type FeedStatus = "URGENT" | "INVESTIGATING" | "ACTION_REQUIRED" | "RESOLVED";
export type FeedCategory = "PERIMETER_BREACH" | "SUSPICIOUS_ACTIVITY" | "ACCESS_CONTROL" | "DRONE_RECON" | "VEHICLE_TRACKING";

export interface FeedItem {
  id: string;
  status: FeedStatus;
  category: FeedCategory;
  timeAgo: string;
  title: string;
  snippet: string;
  location: string;
  imageUrl?: string;
}

interface Props {
  items: FeedItem[];
  onViewDetails?: (id: string) => void;
}

const STATUS_STYLES: Record<FeedStatus, string> = {
  URGENT:          "bg-[--color-danger]  text-white",
  INVESTIGATING:   "bg-blue-500          text-white",
  ACTION_REQUIRED: "bg-orange-500        text-white",
  RESOLVED:        "bg-[--color-success] text-white",
};

const STATUS_LABELS: Record<FeedStatus, string> = {
  URGENT:          "URGENT",
  INVESTIGATING:   "INVESTIGATING",
  ACTION_REQUIRED: "ACTION REQUIRED",
  RESOLVED:        "RESOLVED",
};

const CATEGORY_LABELS: Record<FeedCategory, string> = {
  PERIMETER_BREACH:   "PERIMETER BREACH",
  SUSPICIOUS_ACTIVITY:"SUSPICIOUS ACTIVITY",
  ACCESS_CONTROL:     "ACCESS CONTROL",
  DRONE_RECON:        "DRONE RECON",
  VEHICLE_TRACKING:   "VEHICLE TRACKING",
};

const CATEGORY_STYLES: Record<FeedCategory, string> = {
  PERIMETER_BREACH:   "text-[--color-danger]  font-bold",
  SUSPICIOUS_ACTIVITY:"text-[--color-warning] font-bold",
  ACCESS_CONTROL:     "text-blue-600          font-bold",
  DRONE_RECON:        "text-[--color-primary] font-bold",
  VEHICLE_TRACKING:   "text-purple-600        font-bold",
};

export default function IntelFeedGrid({ items, onViewDetails }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-[--color-border] overflow-hidden flex hover:shadow-md transition-shadow"
        >
          {/* Image */}
          <div className="relative w-32 shrink-0 bg-gray-100 flex items-center justify-center">
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-300" />
            )}
            {/* Status badge */}
            <span className={cn(
              "absolute top-2 left-2 text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide",
              STATUS_STYLES[item.status]
            )}>
              {STATUS_LABELS[item.status]}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 p-3.5 flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className={cn("text-[10px] uppercase tracking-wide", CATEGORY_STYLES[item.category])}>
                {CATEGORY_LABELS[item.category]}
              </span>
              <span className="text-[10px] text-[--color-text-subtle] shrink-0 whitespace-nowrap">{item.timeAgo}</span>
            </div>
            <p className="text-sm font-bold text-[--color-text] leading-snug">{item.title}</p>
            <p className="text-xs text-[--color-text-muted] line-clamp-2 leading-relaxed">{item.snippet}</p>
            <div className="flex items-center justify-between mt-auto pt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[--color-text-subtle]" />
                <span className="text-[10px] text-[--color-text-muted]">{item.location}</span>
              </div>
              <button
                onClick={() => onViewDetails?.(item.id)}
                className="flex items-center gap-0.5 text-xs font-semibold text-[--color-primary] hover:underline shrink-0"
              >
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

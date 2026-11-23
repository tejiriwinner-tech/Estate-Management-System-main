"use client";

import { useRouter } from "next/navigation";
import { Search, Menu } from "lucide-react";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { summary, refresh } = useChatSummary();
  return (
    <header className="h-16 bg-white border-b border-[--color-border] flex items-center justify-between px-6 shrink-0">
      {/* Left: hamburger (mobile) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-1.5 rounded-lg text-[--color-text-muted] hover:bg-gray-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Center: search */}
      <div className="hidden md:flex items-center gap-2 bg-[--color-bg] rounded-lg px-3 py-2 w-72 border border-[--color-border]">
        <Search className="w-4 h-4 text-[--color-text-muted] shrink-0" />
        <input
          type="search"
          placeholder="Search..."
          className="bg-transparent text-sm text-[--color-text] placeholder:text-[--color-text-muted] outline-none w-full"
        />
      </div>

      {/* Right: bell + avatar */}
      <div className="flex items-center gap-2">
        <NotificationPopover unread={summary.unread_total} onSeeAll={() => router.push("/security/messages?tab=alerts")} onChanged={refresh} />

        {/* Avatar */}
        <button className="ml-1 w-9 h-9 rounded-full overflow-hidden border-2 border-[--color-border] hover:border-[--color-primary] transition-colors">
          <div className="w-full h-full bg-[--color-primary-light] flex items-center justify-center text-[--color-primary] text-sm font-bold">
            SO
          </div>
        </button>
      </div>
    </header>
  );
}

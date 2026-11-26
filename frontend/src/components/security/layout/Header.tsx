"use client";

import { useRouter } from "next/navigation";
import { Search, Menu, Shield } from "lucide-react";
import { NotificationPopover } from "@/components/chat/NotificationPopover";
import { useChatSummary } from "@/lib/chat/useChatSummary";
import { LiveGpsTracker } from "@/components/location/LiveGpsTracker";
import { readSession } from "@/components/auth/session";

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { summary, refresh } = useChatSummary();

  return (
    <header className="h-20 bg-white border-b border-gray-200/80 flex items-center justify-between px-6 shrink-0 shadow-2xs">
      {/* Left: Mobile Menu & Current Route Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-extrabold text-gray-900 leading-tight">{title}</h1>
          <p className="text-[10px] font-semibold text-slate-400 hidden sm:block">Central Operations & Security Intelligence</p>
        </div>
      </div>

      {/* Center: Search */}
      <div className="hidden md:flex items-center gap-2.5 bg-slate-50 rounded-xl px-3.5 py-2 w-80 border border-gray-200 focus-within:ring-2 focus-within:ring-[#B22222] focus-within:bg-white transition-all">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="search"
          placeholder="Search plates, visitor codes, incidents..."
          className="bg-transparent text-xs text-gray-900 placeholder:text-slate-400 outline-none w-full"
        />
      </div>

      {/* Right: Live Patrol GPS, Alert Bell, and Officer Profile */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:block">
          <LiveGpsTracker
            userEmail={readSession()?.email}
            userName={readSession()?.name || "Security Officer"}
            userRole="Security"
            label="Security Patrol"
            compact
          />
        </div>
        <NotificationPopover
          unread={summary.unread_total}
          onSeeAll={() => router.push("/security/messages?tab=alerts")}
          onChanged={refresh}
        />

        {/* Officer Profile Badge */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-gray-200">
          <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] border border-[#B22222]/20 flex items-center justify-center text-[#B22222] text-xs font-bold shadow-2xs">
            SO
          </div>
          <div className="hidden xl:block text-left">
            <span className="block text-xs font-bold text-gray-900 leading-tight">Chief Security Officer</span>
            <span className="block text-[10px] font-medium text-slate-500">Badge #CSO-04</span>
          </div>
        </div>
      </div>
    </header>
  );
}

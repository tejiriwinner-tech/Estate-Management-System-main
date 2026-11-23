"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  AlertTriangle,
  Brain,
  ShieldCheck,
  Users,
  Ban,
  Info,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/security/utils";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/security/dashboard", icon: LayoutDashboard },
  { label: "Security HQ", href: "/security/hq", icon: Shield },
  { label: "Messages & Alerts", href: "/security/messages", icon: MessageSquare },
  { label: "Emergency Alerts", href: "/security/emergency", icon: AlertTriangle },
  { label: "Intelligence Feed", href: "/security/intelligence", icon: Brain },
  { label: "Access Control", href: "/security/access", icon: ShieldCheck },
  { label: "Blacklist Records", href: "/security/blacklist", icon: Ban },
  { label: "Security Officers", href: "/security/members", icon: Users },
  { label: "Incident Reports", href: "/security/reports", icon: FileText },
  { label: "Station Info", href: "/security/about", icon: Info },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-white border-r border-gray-200/80 shadow-xs shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-gray-200/60">
        <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-[#B22222] text-white font-bold text-lg shadow-md shrink-0">
          <span className="tracking-tighter">LE</span>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#C9A227] rounded-full border-2 border-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-base tracking-tight text-gray-900 leading-tight">
            Lincoln<span className="text-[#B22222]">Estate</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#C9A227]">
            Security Command
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all w-full",
                active
                  ? "bg-[#B22222] text-white shadow-xs font-bold"
                  : "text-slate-600 hover:bg-slate-100 hover:text-gray-900"
              )}
            >
              <Icon
                className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  active ? "text-[#C9A227]" : "text-slate-400"
                )}
              />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info & Logout */}
      <div className="px-4 py-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] font-bold text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Lincoln Guard v2.4 Active</span>
        </div>

        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="flex items-center gap-2.5 w-full px-3.5 py-2 rounded-xl text-xs font-bold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Officer Sign Out</span>
        </button>
      </div>
    </aside>
  );
}

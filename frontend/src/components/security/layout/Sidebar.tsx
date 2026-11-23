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
  { label: "Dashboard",         href: "/security/dashboard",    icon: LayoutDashboard },
  { label: "Security HQ",       href: "/security/hq",           icon: Shield          },
  { label: "Messages",          href: "/security/messages",     icon: MessageSquare   },
  { label: "Emergency Alerts",  href: "/security/emergency",    icon: AlertTriangle   },
  { label: "Intelligence",      href: "/security/intelligence", icon: Brain           },
  { label: "Access Control",    href: "/security/access",       icon: ShieldCheck     },
  { label: "Blacklist",         href: "/security/blacklist",    icon: Ban             },
  { label: "Security Members",  href: "/security/members",      icon: Users           },
  { label: "Reports",           href: "/security/reports",      icon: FileText        },
  { label: "About",             href: "/security/about",        icon: Info            },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col w-[220px] min-h-screen bg-white border-r border-gray-200 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 shadow-sm shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-extrabold text-slate-900">
            LincolnEstate
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-emerald-600">
            Security Command
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all w-full",
                active
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", active ? "text-emerald-400" : "text-slate-400")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          onClick={() => {
            window.location.href = "/login";
          }}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}

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
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
          style={{ backgroundColor: "#0CA348" }}
        >
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div className="leading-tight">
          <span className="block text-sm font-extrabold" style={{ color: "#0CA348" }}>
            LincolnEstate
          </span>
          <span className="block text-[10px] font-medium" style={{ color: "#9F9C9C" }}>
            Admin Dashboard
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
                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all w-full text-white",
                active ? "shadow-sm" : "hover:brightness-110"
              )}
              style={{ backgroundColor: "#0CA348", opacity: active ? 1 : 0.75 }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-200">
        <button
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors hover:bg-green-50"
          style={{ color: "#0CA348" }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}

"use client";

import React from "react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  MessageSquare,
  CreditCard,
  Settings,
} from "lucide-react";
import { UnifiedPortalShell, type UnifiedNavItem } from "@/components/layout/UnifiedPortalShell";
import { useRequireRole } from "@/components/auth/useRequireRole";

const STORE_NAV: UnifiedNavItem[] = [
  { label: "Store Dashboard", href: "/store-app", icon: LayoutDashboard, exact: true },
  { label: "Orders & Fulfillment", href: "/store-app/orders", icon: ShoppingBag },
  { label: "Product Catalog", href: "/store-app/products", icon: Package },
  { label: "Inventory & Stock", href: "/store-app/products/manage", icon: Boxes },
  { label: "Messages & Notices", href: "/store-app/messages", icon: MessageSquare },
  { label: "Settlements & Payouts", href: "/store-app/subscription", icon: CreditCard },
  { label: "Store Settings", href: "/store-app/settings", icon: Settings },
];

export function StorePortalShell({ children }: { children: React.ReactNode }) {
  const allowed = useRequireRole(["Store Owner", "Admin"]);
  if (!allowed) return null;

  return (
    <UnifiedPortalShell
      portalLabel="Store Owner Hub"
      roleSubtitle="Verified Store Merchant"
      homeHref="/store-app"
      messagesHref="/store-app/messages"
      searchPlaceholder="Search orders, products, SKUs, or customers..."
      navItems={STORE_NAV}
    >
      {children}
    </UnifiedPortalShell>
  );
}

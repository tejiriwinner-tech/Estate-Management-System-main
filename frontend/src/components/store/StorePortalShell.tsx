"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
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
import { readSession } from "@/components/auth/session";
import { CodedEmergencyTrigger } from "@/components/emergency/CodedEmergencyTrigger";
import { LiveGpsTracker } from "@/components/location/LiveGpsTracker";

export interface StoreIdentity {
  id: number;
  name: string;
  category: string;
  shop_unit: string;
  owner_name: string;
  owner_email: string;
  status: string;
  isOpen: boolean;
}

interface StoreIdentityContextValue {
  store: StoreIdentity | null;
  loadingStore: boolean;
  refreshStore: () => Promise<void>;
  toggleStoreOpen: () => Promise<void>;
}

const StoreIdentityContext = createContext<StoreIdentityContextValue>({
  store: null,
  loadingStore: true,
  refreshStore: async () => {},
  toggleStoreOpen: async () => {},
});

export function useStoreIdentity() {
  return useContext(StoreIdentityContext);
}

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
  const [store, setStore] = useState<StoreIdentity | null>(null);
  const [loadingStore, setLoadingStore] = useState(true);

  const refreshStore = useCallback(async () => {
    try {
      const session = readSession();
      const emailParam = session?.email ? `?email=${encodeURIComponent(session.email)}` : "";
      const res = await fetch(`/api/v1/store/me${emailParam}`, { cache: "no-store" });
      const json = await res.json();
      setStore(json?.data ?? null);
    } catch {
      setStore(null);
    } finally {
      setLoadingStore(false);
    }
  }, []);

  useEffect(() => {
    if (allowed) void refreshStore();
  }, [allowed, refreshStore]);

  const toggleStoreOpen = useCallback(async () => {
    if (!store) return;
    const nextOpen = !store.isOpen;
    setStore((prev) => (prev ? { ...prev, isOpen: nextOpen, status: nextOpen ? "active" : "archived" } : prev));
    try {
      await fetch("/api/v1/store/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: store.id, isOpen: nextOpen }),
      });
    } catch {
      await refreshStore();
    }
  }, [store, refreshStore]);

  if (!allowed) return null;

  return (
    <StoreIdentityContext.Provider value={{ store, loadingStore, refreshStore, toggleStoreOpen }}>
      <UnifiedPortalShell
        portalLabel={store?.name || "Store Owner Hub"}
        roleSubtitle={store ? `${store.shop_unit} • ${store.category}` : "Store Admin"}
        displayNameOverride={store?.owner_name}
        homeHref="/store-app"
        messagesHref="/store-app/messages"
        searchPlaceholder="Search orders, products, SKUs, or customers..."
        navItems={STORE_NAV}
        footerExtra={
          <div className="space-y-2">
            <LiveGpsTracker
              userEmail={store?.owner_email}
              userName={store?.owner_name || "Shop Owner"}
              userRole="Shop Owner"
              label={store ? `${store.name} (${store.shop_unit})` : "Commercial Plaza"}
            />
            <CodedEmergencyTrigger
              senderName={store?.owner_name || "Shop Owner"}
              senderRole="Shop Owner"
              senderEmail={store?.owner_email}
              defaultLocation={store ? `${store.name} (${store.shop_unit})` : "Commercial Plaza Shop"}
              buttonLabel="SOS Emergency Alert"
            />
          </div>
        }
      >
        {children}
      </UnifiedPortalShell>
    </StoreIdentityContext.Provider>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import {
  getOriginalSiteUrl,
  newBusinessSettings,
  saveSiteSettings,
  useSiteSettings,
} from "./site-settings";
import { checkoutCustomerStorageKey } from "../lib/checkout";
import { storeFetch } from "../lib/api";
import { ChatCenter } from "@/components/chat/ChatCenter";

type StoreProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  image: string;
  featured: boolean;
};

const placeholderImage = "/assets/products/catalog-3.jpeg";

// Plan tiers and prices; must match Store::PLANS on the backend.
const plans = [
  { name: "Basic", price: 25000, features: ["Up to 50 Store Listings", "Standard Analytics", "Email Support"] },
  { name: "Pro", price: 65000, features: ["Unlimited Listings", "Advanced Data Export", "Priority 24/7 Support", "Custom Domain Integration"] },
  { name: "Enterprise", price: 180000, features: ["Multiple Stores Support", "Dedicated Manager", "API Access", "White-label Experience"] },
];

const shellIconFiles = {
  dashboard: ["eb13e4a3-4c6f-430e-acb1-74b1df2ffa56", 18, 18],
  finance: ["2476d259-c7bb-4edc-a055-334fcb969f46", 22, 16],
  store: ["811ce434-bca3-4492-9bc3-96627eb1a217", 20.0939, 18],
  messages: ["28599a1e-65f4-4c6b-ba22-d78c03f2ac3b", 20, 20],
  reports: ["61622eaa-c4dc-42d6-b574-151410afba28", 16, 16],
  staff: ["147931a8-b4ff-4c56-9880-aae56b0c7218", 22, 16],
  settings: ["eb13e4a3-4c6f-430e-acb1-74b1df2ffa56", 18, 18],
  logout: ["2572e3c9-ca9f-4fcb-9a55-962fb709256f", 18, 18],
  notification: ["c8cbcd18-6c71-4c0b-8b1f-4d3bac565b58", 16, 20],
} as const;
type ShellIconName = keyof typeof shellIconFiles;

function ShellIcon({ name }: { name: ShellIconName }) {
  const [file, width, height] = shellIconFiles[name];
  return <Image alt="" aria-hidden="true" height={height} src={`/figma/${file}.svg`} unoptimized width={width} />;
}

type ProductSnapshot = { products: StoreProduct[]; error: string };
type ProductScope = "owner" | "catalog";
const SERVER_PRODUCTS: ProductSnapshot = { products: [], error: "" };
const productSnapshots = new Map<ProductScope, ProductSnapshot>();
const productListeners = new Map<ProductScope, Set<() => void>>();

function getProductSnapshot(scope: ProductScope): ProductSnapshot {
  return productSnapshots.get(scope) ?? SERVER_PRODUCTS;
}

function publishProducts(scope: ProductScope, snapshot: ProductSnapshot) {
  productSnapshots.set(scope, snapshot);
  productListeners.get(scope)?.forEach((listener) => listener());
}

function subscribeToProducts(scope: ProductScope, listener: () => void) {
  const set = productListeners.get(scope) ?? new Set<() => void>();
  set.add(listener);
  productListeners.set(scope, set);
  return () => { set.delete(listener); };
}

async function loadProducts(scope: ProductScope) {
  try {
    const products = await storeFetch<StoreProduct[]>(scope === "owner" ? "/store/products" : "/store/catalog");
    publishProducts(scope, { products, error: "" });
  } catch (error) {
    publishProducts(scope, { products: [], error: error instanceof Error ? error.message : "Products could not be loaded." });
  }
}

/** Products from the API. "owner" = my store's inventory, "catalog" = everything on sale. */
function useStoreProducts(scope: ProductScope = "owner") {
  const snapshot = useSyncExternalStore(
    (listener) => subscribeToProducts(scope, listener),
    () => getProductSnapshot(scope),
    () => SERVER_PRODUCTS,
  );
  useEffect(() => { void loadProducts(scope); }, [scope]);

  /** Applies the change locally, then syncs the difference (create/update/delete) to the server. */
  const setProducts = (update: SetStateAction<StoreProduct[]>): string => {
    const previous = getProductSnapshot(scope).products;
    const next = typeof update === "function" ? update(previous) : update;
    publishProducts(scope, { products: next, error: "" });

    void (async () => {
      try {
        const known = new Set(previous.map((p) => p.id));
        const keep = new Set(next.map((p) => p.id));
        for (const p of previous) {
          if (!keep.has(p.id)) await storeFetch(`/store/products/${p.id}`, { method: "DELETE" });
        }
        for (const p of next) {
          const body = JSON.stringify({ name: p.name, category: p.category, price: p.price, stock: p.stock, description: p.description, image: p.image, featured: p.featured });
          if (!known.has(p.id)) await storeFetch("/store/products", { method: "POST", body });
          else if (JSON.stringify(previous.find((x) => x.id === p.id)) !== JSON.stringify(p)) await storeFetch(`/store/products/${p.id}`, { method: "PUT", body });
        }
        await loadProducts(scope);
      } catch (error) {
        await loadProducts(scope);
        publishProducts(scope, { ...getProductSnapshot(scope), error: error instanceof Error ? error.message : "Product changes could not be saved." });
      }
    })();
    return "";
  };

  return { products: snapshot.products, setProducts, storageError: snapshot.error };
}

type PlanSnapshot = { plan: string; error: string };
const serverPlanSnapshot: PlanSnapshot = { plan: "Basic", error: "" };
let currentPlanSnapshot: PlanSnapshot = serverPlanSnapshot;
const planListeners = new Set<() => void>();

function setPlanSnapshot(next: PlanSnapshot) {
  currentPlanSnapshot = next;
  planListeners.forEach((listener) => listener());
}
function getCurrentPlan(): PlanSnapshot {
  return currentPlanSnapshot;
}
function subscribeToPlan(listener: () => void) {
  planListeners.add(listener);
  return () => { planListeners.delete(listener); };
}
async function loadPlan() {
  try {
    const me = await storeFetch<{ plan: string } | null>("/store/me");
    setPlanSnapshot({ plan: me?.plan ?? "Basic", error: me ? "" : "Register your store to choose a plan." });
  } catch (error) {
    setPlanSnapshot({ plan: "Basic", error: error instanceof Error ? error.message : "The subscription could not be loaded." });
  }
}
async function updateCurrentPlan(name: string) {
  const me = await storeFetch<{ plan: string }>("/store/plan", { method: "PUT", body: JSON.stringify({ plan: name }) });
  setPlanSnapshot({ plan: me.plan, error: "" });
}

/** Resets the browser-only branding settings. Store data lives on the server and is not touched. */
export function resetBrowserBusinessData() {
  window.sessionStorage.removeItem(checkoutCustomerStorageKey);
  saveSiteSettings(newBusinessSettings);
}

function formatNaira(value: number) {
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(","),
    )
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function fileSlug(name: string) {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "business";
}

function StatusBadge({ stock }: { stock: number }) {
  const label = stock === 0 ? "Out of Stock" : stock <= 10 ? "Low Stock" : "In Stock";
  return <span className={`stock-badge stock-badge--${stock === 0 ? "out" : stock <= 10 ? "low" : "in"}`}>{label}</span>;
}

export function StoreShell({
  children,
  activeNav = "Store",
}: {
  children: ReactNode;
  activeNav?: string;
}) {
  const [shellNotice, setShellNotice] = useState("");
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  // If rendering inside /admin, render plain content without duplicate sidebar or topbar
  if (isAdminRoute) {
    return (
      <div className="w-full space-y-6">
        {shellNotice && (
          <div className="p-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-sm flex items-center justify-between" role="status">
            <span>{shellNotice}</span>
            <button aria-label="Dismiss" onClick={() => setShellNotice("")} type="button" className="font-bold text-lg">×</button>
          </div>
        )}
        <div className="w-full">{children}</div>
      </div>
    );
  }

  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { settings } = useSiteSettings();
  useEffect(() => {
    document.title = `${settings.siteName || "Your business"} | Admin Dashboard`;
  }, [settings.siteName]);
  useEffect(() => {
    if (!isMobileNavOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileNavOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileNavOpen]);
  const isStoreApp = pathname.startsWith("/store-app");

  const navItemsList = isStoreApp
    ? [
        { label: "Store Dashboard", href: "/store-app", icon: "dashboard" as const },
        { label: "Orders & Fulfillment", href: "/store-app/orders", icon: "reports" as const },
        { label: "Product Catalog", href: "/store-app/products", icon: "store" as const },
        { label: "Inventory & Stock", href: "/store-app/products/manage", icon: "finance" as const },
        { label: "Messages & Notices", href: "/store-app/messages", icon: "messages" as const },
        { label: "Settlements & Payouts", href: "/store-app/subscription", icon: "finance" as const },
        { label: "Store Settings", href: "/store-app/settings", icon: "settings" as const },
      ]
    : [
        { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" as const },
        { label: "Finance", href: "/admin/finance", icon: "finance" as const },
        { label: "Store", href: "/admin/store", icon: "store" as const, isDropdown: true },
        { label: "Messages", href: "/admin/messages", icon: "messages" as const },
        { label: "Reports", href: "/admin/reports", icon: "reports" as const },
        { label: "Staffs", href: "/admin/staffs", icon: "staff" as const },
      ];

  const storeDropdownSubLinks = [
    { label: "Store Overview", href: "/admin/store" },
    { label: "Inventory Management", href: "/store-app/products/manage" },
    { label: "Product Catalog", href: "/store-app/products" },
    { label: "Orders & Analytics", href: "/store-app/orders" },
    { label: "Subscription", href: "/store-app/subscription" },
    { label: "Store Settings", href: "/store-app/settings" },
  ];

  return (
    <div className="app-shell">
      {isMobileNavOpen && (
        <button
          aria-label="Close navigation"
          className="mobile-nav-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          type="button"
        />
      )}
      <aside className={`sidebar${isMobileNavOpen ? " sidebar--mobile-open" : ""}`} id="primary-sidebar">
        <Link className="brand" href={isStoreApp ? "/store-app" : "/admin/dashboard"} aria-label="LincolnEstate home" onClick={() => setIsMobileNavOpen(false)}>
          <span className="brand-mark">
            <span className="brand-initial">LE</span>
            <span className="brand-badge-dot" />
          </span>
          <span className="brand-copy">
            <strong>Lincoln<span style={{ color: "var(--primary)" }}>Estate</span></strong>
            <small style={isStoreApp ? { color: "#C9A227", fontWeight: "700" } : undefined}>
              {isStoreApp ? "STORE OWNER HUB" : "ADMIN DASHBOARD"}
            </small>
          </span>
        </Link>
        <nav className="side-nav" aria-label="Main navigation" id="primary-navigation">
          {navItemsList.map((item) => {
            if ("isDropdown" in item && item.isDropdown) {
              return (
                <details className="store-menu" open key={item.label}>
                  <summary aria-label="Toggle Store menu" className="store-menu-trigger is-active" style={{ background: "var(--primary)", color: "#fff", borderRadius: "12px", padding: "10px 14px", fontWeight: "600" }}>
                    <ShellIcon name="store" />
                    <span>Store</span>
                    <span aria-hidden="true" className="store-menu-chevron" style={{ marginLeft: "auto" }}>⌄</span>
                  </summary>
                  <div className="store-menu-items" style={{ paddingLeft: "16px", borderLeft: "2px solid rgba(178,34,34,0.2)", marginLeft: "20px", marginTop: "6px", marginBottom: "6px" }}>
                    {storeDropdownSubLinks.map((sub) => {
                      const isSubActive = pathname === sub.href || sub.label === activeNav;
                      return (
                        <Link
                          aria-current={isSubActive ? "page" : undefined}
                          className={`nav-item store-menu-link${isSubActive ? " is-active" : ""}`}
                          href={sub.href}
                          key={sub.href}
                          onClick={() => setIsMobileNavOpen(false)}
                          style={{
                            padding: "8px 12px",
                            fontSize: "12px",
                            fontWeight: isSubActive ? "700" : "500",
                            color: isSubActive ? "var(--primary)" : "#4b5563",
                            background: isSubActive ? "#fbf1f1" : "transparent",
                            borderRadius: "8px",
                            display: "block",
                            marginBottom: "2px",
                          }}
                        >
                          <span>{sub.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </details>
              );
            }

            const isItemActive = pathname === item.href;
            return (
              <Link
                aria-current={isItemActive ? "page" : undefined}
                className={`nav-item store-menu-link${isItemActive ? " is-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                style={isItemActive ? {
                  background: "var(--primary)",
                  color: "#ffffff",
                  borderRadius: "10px",
                  fontWeight: "700",
                } : undefined}
              >
                <ShellIcon name={item.icon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <button
          className="logout-button"
          onClick={() => {
            setIsMobileNavOpen(false);
            window.location.assign(isStoreApp ? "/login" : "/admin/dashboard");
          }}
          type="button"
        >
          <ShellIcon name="logout" />
          <span>{isStoreApp ? "Sign Out" : "Return to Admin"}</span>
        </button>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            aria-controls="primary-sidebar"
            aria-expanded={isMobileNavOpen}
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            className="mobile-nav-toggle"
            onClick={() => setIsMobileNavOpen((open) => !open)}
            type="button"
          >
            <span aria-hidden="true">{isMobileNavOpen ? "×" : "☰"}</span>
          </button>
          <form action="/store-app/products" className="search-field">
            <span className="search-icon" aria-hidden="true" />
            <input aria-label="Search products" name="search" placeholder="Search products, orders, or merchants..." />
          </form>
          <div className="topbar-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "9999px", background: "#f3f4f6", border: "1px solid #e5e7eb", fontSize: "11px", fontWeight: "700", color: "#1f2937" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A227", display: "inline-block" }} />
              <span>OPERATIONAL</span>
            </div>
            <details className="notification-menu">
              <summary aria-label="Notifications"><ShellIcon name="notification" /><span className="notification-dot" /></summary>
              <div className="notification-popover"><strong>You’re all caught up</strong><span>New store activity will appear here.</span></div>
            </details>
            <span className="topbar-divider" />
            <div className="admin-profile">
              <div style={{ textAlign: "right" }}>
                <strong style={{ display: "block", fontSize: "13px", color: "#1a1a1a" }}>Administrator</strong>
                <small style={{ color: "#6b7280", fontSize: "11px" }}>Estate Manager</small>
              </div>
              <Image alt="Administrator" className="admin-avatar" height={40} src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" width={40} unoptimized />
            </div>
          </div>
        </header>
        {shellNotice && <div className="screen-notice" role="status">{shellNotice}<button aria-label="Dismiss" onClick={() => setShellNotice("")} type="button">×</button></div>}
        <main className="page-content screen-content">{children}</main>
        <footer className="screen-footer">
          <span>© {settings.siteName || "Your business"} Admin. All rights reserved.</span>
          <div><a href={`mailto:${settings.supportEmail}?subject=Support%20request`}>Help Center</a><a href={`mailto:${settings.supportEmail}?subject=Privacy%20question`}>Privacy questions</a><Link href="/store-app/settings">Settings</Link></div>
        </footer>
      </div>
    </div>
  );
}

export function AnalyticsScreen() {
  const { settings } = useSiteSettings();
  const [range, setRange] = useState("Last 30 Days");
  const [notice, setNotice] = useState("");
  const transactions = [
    { id: "#ORD-2891", initials: "CO", customer: "Chinedu Okafor", unit: "Lekki Phase 1", item: "Smart Lock Hub (x1)", amount: "₦45,000", status: "Completed" },
    { id: "#ORD-2889", initials: "IN", customer: "Ifeoma Nwosu", unit: "Victoria Island", item: "Filter Replace. (x4)", amount: "₦12,500", status: "Processing" },
    { id: "#ORD-2885", initials: "TA", customer: "Tunde Adeyemi", unit: "Ikeja GRA", item: "Solar Garden Light", amount: "₦89,000", status: "Cancelled" },
  ];
  const [selectedTransaction, setSelectedTransaction] = useState<(typeof transactions)[number] | null>(null);
  const bars = range === "Last 7 Days"
    ? [38, 58, 46, 74, 53, 86, 35]
    : [56, 44, 71, 62, 48, 92, 67];

  useEffect(() => {
    if (!selectedTransaction) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedTransaction(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedTransaction]);

  return (
    <StoreShell activeNav="Dashboard">
    <p className="form-help">Analytics figures on this screen are Figma preview data; live reporting is not connected.</p>
      <div className="screen-title-row"><div><p className="screen-kicker">OVERVIEW / STORE</p><h1>{settings.siteName} Marketplace</h1></div><Link className="button button--primary" href="/store-app/products">Browse products</Link></div>
      {notice && <div className="screen-notice" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button">×</button></div>}
      <div className="analytics-metrics">
        <Metric label="Total Revenue" value="₦4,280,000" note="+12.5% from last month" tone="gold" />
        <Metric label="Total Orders" value="1,248" note="−2.1% from last month" tone="red" />
        <Metric label="Active Customers" value="842" note="+5.8% increase" tone="blue" />
        <Metric label="Pending Fulfillment" value="54 Items" note="Needs immediate attention" tone="red" />
      </div>
      <div className="analytics-grid">
        <section className="screen-card revenue-card">
          <div className="screen-card-heading"><div><h2>Revenue Growth Analysis</h2><p>{range === "Last 7 Days" ? "Daily earnings across the past week" : "Weekly earnings across the past month"}</p></div><label className="select-pill"><span className="sr-only">Revenue period</span><select value={range} onChange={(event) => setRange(event.target.value)}><option>Last 30 Days</option><option>Last 7 Days</option></select></label></div>
          <div aria-label={`${range} revenue chart`} className="bar-chart">
            {bars.map((height, index) => <div className="bar-column" key={index}><span className={`bar${index === 5 ? " bar--active" : ""}`} style={{ height: `${height}%` }} /><small>{range === "Last 7 Days" ? ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][index] : ["WEEK 1", "WEEK 2", "WEEK 3", "WEEK 4", "WEEK 5", "WEEK 6", "WEEK 7"][index]}</small></div>)}
          </div>
        </section>
        <div className="analytics-aside">
          <section className="screen-card category-card"><div className="screen-card-heading"><h2>Top Categories</h2><span aria-hidden="true">•••</span></div>{[["Gardening & Landscaping", "42%"], ["Security Systems", "28%"], ["Home Cleaning", "15%"]].map(([label, percent]) => <div className="category-row" key={label}><span className="category-mark">✦</span><div><span>{label}</span><div className="progress-track"><span style={{ width: percent }} /></div></div><strong>{percent}</strong></div>)}</section>
          <section className="target-card"><span>MONTHLY TARGET · SAMPLE</span><strong>₦5,000,000</strong><small>Progress: 85% <span>₦720k Left</span></small><div className="target-track"><span /></div><button className="button button--primary" onClick={() => setNotice("Sample recommendation: review low-stock items before expanding the top-performing categories. Connect live analytics for store-specific guidance.")} type="button">View sample recommendation</button></section>
        </div>
      </div>
      <section className="screen-card activity-card"><div className="screen-card-heading"><h2>Recent Store Transactions</h2><Link className="text-button" href="/store-app">View Store Dashboard</Link></div><div className="table-scroll"><table><thead><tr><th>Order ID</th><th>Customer/House</th><th>Items</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction.id}><td>{transaction.id}</td><td><span className="customer-cell"><span>{transaction.initials}</span><span><strong>{transaction.customer}</strong><small>{transaction.unit}</small></span></span></td><td>{transaction.item}</td><td className="amount-cell">{transaction.amount}</td><td><span className={`order-status order-status--${transaction.status.toLowerCase()}`}>{transaction.status}</span></td><td><button className="text-button" onClick={() => setSelectedTransaction(transaction)} type="button">View</button></td></tr>)}</tbody></table></div><div className="table-pagination"><span>Showing 1–{transactions.length} of {transactions.length} sample transactions</span></div></section>
      {selectedTransaction && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedTransaction(null); }}><section aria-labelledby="transaction-dialog-title" aria-modal="true" className="editor-modal" role="dialog"><button aria-label="Close transaction details" className="modal-close" onClick={() => setSelectedTransaction(null)} type="button">×</button><h2 id="transaction-dialog-title">Order {selectedTransaction.id}</h2><p>{selectedTransaction.customer} · {selectedTransaction.unit}</p><dl><div><dt>Item</dt><dd>{selectedTransaction.item}</dd></div><div><dt>Amount</dt><dd>{selectedTransaction.amount}</dd></div><div><dt>Status</dt><dd>{selectedTransaction.status}</dd></div></dl><button className="button button--primary" onClick={() => setSelectedTransaction(null)} type="button">Close</button></section></div>}
    </StoreShell>
  );
}

export function StoreAvailabilityControl() {
  const [isOpen, setIsOpen] = useState<boolean | null>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    storeFetch<{ isOpen: boolean; is_open: boolean } | null>("/store/me")
      .then((me) => {
        if (me) {
          setIsOpen(me.isOpen ?? me.is_open ?? true);
        }
      })
      .catch(() => {
        setIsOpen(true);
      });
  }, []);

  async function toggleStoreStatus() {
    if (isOpen === null) return;
    const targetStatus = !isOpen;
    setIsOpen(targetStatus);
    try {
      const me = await storeFetch<{ isOpen: boolean; is_open: boolean }>("/store/me", {
        method: "PATCH",
        body: JSON.stringify({ is_open: targetStatus }),
      });
      if (me) {
        setIsOpen(me.isOpen ?? me.is_open ?? targetStatus);
      }
      setError("");
    } catch {
      // keep local toggle
    }
  }
  const settings = { isStoreOpen: isOpen === true };
  const storageError = "";

  return (
    <section
      aria-label="Store availability"
      className={`store-availability-card${settings.isStoreOpen ? " is-open" : " is-closed"}`}
      role="status"
    >
      <span aria-hidden="true" className="store-availability-indicator" />
      <div className="store-availability-copy">
        <p>STORE STATUS</p>
        <strong>{settings.isStoreOpen ? "Open" : "Closed"}</strong>
        <small>Closed stores are hidden from the catalogue.</small>
      </div>
      <button
        aria-label={settings.isStoreOpen ? "Close store" : "Open store"}
        className={`button ${settings.isStoreOpen ? "button--outline store-close-button" : "button--primary"}`}
        disabled={isOpen === null}
        onClick={toggleStoreStatus}
        type="button"
      >
        {settings.isStoreOpen ? "Close store" : "Open store"}
      </button>
      {(storageError || error) && (
        <p className="store-availability-error" role="alert">
          {storageError || error}
        </p>
      )}
    </section>
  );
}

export function ReportsScreen() {
  const { settings } = useSiteSettings();
  const [period, setPeriod] = useState("Last 30 days");
  const [notice, setNotice] = useState("");
  const reportRows = [
    ["#ORD-2891", "Chinedu Okafor", "Lekki Phase 1", "45,000", "Completed"],
    ["#ORD-2889", "Ifeoma Nwosu", "Victoria Island", "12,500", "Processing"],
    ["#ORD-2885", "Tunde Adeyemi", "Ikeja GRA", "89,000", "Cancelled"],
    ["#ORD-2880", "Zainab Bello", "Ikoyi", "64,500", "Completed"],
    ["#ORD-2876", "Emeka Eze", "Surulere", "32,000", "Completed"],
  ];

  function exportReport() {
    downloadCsv(
      `${fileSlug(settings.siteName)}-report-${period.toLowerCase().replaceAll(" ", "-")}.csv`,
      [
        ["Order", "Customer", "Location", "Amount (NGN)", "Status"],
        ...reportRows,
      ],
    );
    setNotice("Your Nigerian Naira sales report has been downloaded.");
  }

  return (
    <StoreShell activeNav="Reports">
      <div className="screen-title-row">
        <div>
          <p className="screen-kicker">BUSINESS INSIGHTS / REPORTS</p>
          <h1>Reports &amp; insights</h1>
          <p className="form-help">
            Review Nigerian Naira sales activity across your estate.
          </p>
        </div>
        <div className="report-actions">
          <label className="select-pill">
            <span className="sr-only">Report period</span>
            <select
              onChange={(event) => setPeriod(event.target.value)}
              value={period}
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </label>
          <button
            className="button button--primary"
            onClick={exportReport}
            type="button"
          >
            ⇩ Export report
          </button>
        </div>
      </div>
      {notice && (
        <div className="screen-notice" role="status">
          {notice}
        </div>
      )}
      <p className="form-help report-preview-note">
        Sample report figures for the selected period. Live analytics are not
        connected yet.
      </p>
      <div className="analytics-metrics">
        <Metric
          label="Gross sales"
          value="₦4,280,000"
          note={`For the ${period.toLowerCase()}`}
          tone="gold"
        />
        <Metric
          label="Orders completed"
          value="1,248"
          note="+8.4% from the previous period"
          tone="blue"
        />
        <Metric
          label="Average order value"
          value="₦34,295"
          note="Across all product categories"
          tone="gold"
        />
        <Metric
          label="Refunds"
          value="₦72,500"
          note="2 requests need review"
          tone="red"
        />
      </div>
      <section className="screen-card report-table-card">
        <div className="screen-card-heading">
          <div>
            <h2>Sales report</h2>
            <p>Order totals and customer locations · NGN</p>
          </div>
          <button
            className="text-button"
            onClick={() =>
              setNotice(`Showing ${reportRows.length} sample sales records.`)
            }
            type="button"
          >
            {reportRows.length} records
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reportRows.map(([order, customer, location, amount, status]) => (
                <tr key={order}>
                  <td>{order}</td>
                  <td>{customer}</td>
                  <td>{location}, Lagos</td>
                  <td className="amount-cell">₦{amount}</td>
                  <td>
                    <span
                      className={`order-status order-status--${status.toLowerCase()}`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </StoreShell>
  );
}

export function MessagesScreen() {
  return (
    <StoreShell activeNav="Messages">
      <ChatCenter />
    </StoreShell>
  );
}

export function StaffScreen() {
  const { settings } = useSiteSettings();

  return (
    <StoreShell activeNav="Staff">
      <div className="screen-title-row">
        <div>
          <p className="screen-kicker">WORKSPACE / TEAM</p>
          <h1>Staff</h1>
          <p className="form-help">
            Review the people who help manage your estate workspace.
          </p>
        </div>
        <a
          className="button button--primary"
          href={`mailto:${settings.supportEmail}?subject=Add%20a%20team%20member`}
        >
          + Invite a teammate
        </a>
      </div>
      <div className="staff-preview-note">
        Team directory preview. Authentication and team invitations have not
        been connected.
      </div>
      <section className="screen-card staff-card">
        <div className="screen-card-heading">
          <div>
            <h2>Estate team</h2>
            <p>People with access to the {settings.siteName || "business"} workspace.</p>
          </div>
          <span className="staff-count">4 MEMBERS</span>
        </div>
        <div className="staff-list">
          {[
            [settings.profileName, settings.profileEmail, settings.jobTitle, "Active"],
            ["Chinedu Eze", `chinedu.eze@${settings.supportEmail.split("@")[1] || "yourbusiness.ng"}`, "Store Operations", "Active"],
            ["Zainab Bello", `zainab.bello@${settings.supportEmail.split("@")[1] || "yourbusiness.ng"}`, "Finance Officer", "Active"],
            ["Emeka Nwankwo", `emeka.nwankwo@${settings.supportEmail.split("@")[1] || "yourbusiness.ng"}`, "Inventory Lead", "Invited"],
          ].map(([name, email, role, status], index) => (
            <div className="staff-row" key={email}>
              <span className="customer-avatar">
                {name
                  .split(" ")
                  .map((part) => part[0])
                  .join("")}
              </span>
              <span className="staff-person">
                <strong>{name}</strong>
                <small>{email}</small>
              </span>
              <span className="staff-role">{role}</span>
              <span
                className={`order-status order-status--${index === 3 ? "processing" : "completed"}`}
              >
                {status}
              </span>
            </div>
          ))}
        </div>
        <div className="staff-footer">
          <Link className="button button--outline" href="/store-app/settings">
            Edit my profile
          </Link>
        </div>
      </section>
    </StoreShell>
  );
}

function Metric({ label, value, note, tone }: { label: string; value: string; note: string; tone: string }) {
  return <section className={`analytics-metric analytics-metric--${tone}`}><span className="metric-symbol" aria-hidden="true">◈</span><div><small>{label}</small><strong>{value}</strong><span>{note}</span></div></section>;
}

function ProductEditor({
  product,
  onClose,
  onSave,
}: {
  product: StoreProduct | null;
  onClose: () => void;
  onSave: (product: StoreProduct) => void;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!photoPreview) {
      return;
    }

    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  function choosePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setPhotoError("Choose an image file to add a product photo.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setPhotoError("Choose an image smaller than 10 MB.");
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setPhotoError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const category = String(formData.get("category") ?? "");
    const price = Number(formData.get("price"));
    const stock = Number(formData.get("stock"));

    if (!name || !category || !Number.isFinite(price) || price <= 0 || !Number.isInteger(stock) || stock < 0) {
      return;
    }

    setIsSaving(true);
    setPhotoError("");

    try {
      onSave({
        id: product?.id ?? `product-${Date.now()}`,
        name,
        sku: product?.sku ?? `LE-${category.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        category,
        price,
        stock,
        description: String(formData.get("description") ?? "").trim(),
        image: photo
          ? await optimizeProductPhoto(photo)
          : product?.image ?? placeholderImage,
        featured: product?.featured ?? true,
      });
    } catch (error) {
      setPhotoError(
        error instanceof Error
          ? error.message
          : "The product photo could not be prepared. Try a different image.",
      );
      setIsSaving(false);
    }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section aria-labelledby="product-editor-title" aria-modal="true" className="editor-modal" role="dialog"><button aria-label="Close" className="modal-close" onClick={onClose} type="button">×</button><h2 id="product-editor-title">{product ? "Edit product" : "Add a product"}</h2><p>Keep your catalog accurate and easy to discover.</p><form className="form-grid" onSubmit={submit}><label>Product name<input defaultValue={product?.name} name="name" required /></label><label>Category<select defaultValue={product?.category ?? "Electronics"} name="category"><option>Electronics</option><option>Homeware</option><option>Hardware</option><option>Maintenance</option><option>Security</option><option>Furniture</option></select></label><label>Price (₦)<input defaultValue={product?.price} min="1" name="price" required type="number" /></label><label>Stock quantity<input defaultValue={product?.stock} min="0" name="stock" required type="number" /></label><label className="form-span">Description<textarea defaultValue={product?.description} name="description" rows={3} /></label><fieldset className="form-span product-photo-field"><legend>Product photo</legend><div className="product-photo-controls"><div className="product-photo-preview">{photoPreview || product?.image ? <Image alt="Product photo preview" fill sizes="100px" src={photoPreview || product?.image || ""} unoptimized /> : <span aria-hidden="true">▧</span>}</div><div className="product-photo-actions"><label className="button button--outline product-photo-button">Take a photo<input accept="image/*" capture="environment" onChange={choosePhoto} type="file" /></label><label className="button button--outline product-photo-button">Upload photo<input accept="image/*" onChange={choosePhoto} type="file" /></label><small>Photo is resized and saved in this browser.</small></div></div>{photoError && <span className="screen-error product-photo-error" role="alert">{photoError}</span>}</fieldset><div className="modal-actions"><button className="button button--outline" onClick={onClose} type="button">Cancel</button><button className="button button--primary" disabled={isSaving} type="submit">{isSaving ? "Saving…" : product ? "Save changes" : "Add product"}</button></div></form></section></div>;
}

async function optimizeProductPhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Your browser could not prepare this photo. Try another image.");
  }

  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.78),
  );
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) {
    throw new Error("Your browser could not prepare this photo. Try another image.");
  }

  if (blob.size > 1024 * 1024) {
    throw new Error("This photo is still too large after resizing. Choose a smaller image.");
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(new Error("Your browser could not read this photo."));
        return;
      }
      resolve(reader.result);
    };
    reader.onerror = () => reject(new Error("Your browser could not read this photo."));
    reader.readAsDataURL(blob);
  });
}

export function ProductCatalogScreen({ initialQuery = "" }: { initialQuery?: string }) {
  const { products, setProducts, storageError } = useStoreProducts("catalog");
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState("All Categories");
  const [stock, setStock] = useState("All");
  const [maxPrice, setMaxPrice] = useState(500000);
  const [page, setPage] = useState(1);
  const [editor, setEditor] = useState<StoreProduct | null | undefined>();
  const [notice, setNotice] = useState("");
  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesQuery = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === "All Categories" || product.category === category;
    const matchesStock = stock === "All" || (stock === "In Stock" && product.stock > 10) || (stock === "Low Stock" && product.stock > 0 && product.stock <= 10) || (stock === "Out of Stock" && product.stock === 0);
    return matchesQuery && matchesCategory && matchesStock && product.price <= maxPrice;
  }).sort((a, b) => Number(b.featured) - Number(a.featured)), [category, maxPrice, products, query, stock]);
  const productsPerPage = 4;
  const visibleProducts = filteredProducts.slice((page - 1) * productsPerPage, page * productsPerPage);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));

  function save(product: StoreProduct) {
    const storageError = setProducts((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? product : item)
      : [product, ...current]);
    setEditor(undefined);
    setNotice(storageError
      ? `${product.name} was updated for this session, but could not be saved to browser storage: ${storageError}`
      : `${product.name} saved in this browser.`);
  }

  return <StoreShell><div className="screen-title-row"><div><div className="screen-breadcrumb">Store <span>›</span> <strong>Product Inventory</strong></div><h1>Product Management</h1></div><div className="screen-actions"><Link className="button button--outline" href="/store-app/products/manage">☷ &nbsp;Manage inventory</Link><button className="button button--primary" onClick={() => setEditor(null)} type="button">＋ Add New Product</button></div></div>
    <StoreAvailabilityControl />
    {notice && <div className="screen-notice" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button">×</button></div>}
    {storageError && <div className="screen-error" role="alert">Product data could not be saved: {storageError}</div>}
    <div className="catalog-metrics"><Metric label="Total Products" value={String(products.length)} note="Across all categories" tone="gold" /><Metric label="In Stock" value={String(products.filter((item) => item.stock > 10).length)} note="More than 10 units available" tone="blue" /><Metric label="Low Stock" value={String(products.filter((item) => item.stock > 0 && item.stock <= 10).length)} note="Products with 1–10 units" tone="red" /><Metric label="Out of Stock" value={String(products.filter((item) => item.stock === 0).length)} note="Products requiring restock" tone="gold" /></div>
    <div className="catalog-layout"><aside className="filter-card"><h2>Categories</h2><label className="check-row"><input checked={category === "All Categories"} onChange={() => { setCategory("All Categories"); setPage(1); }} type="radio" />All Categories</label>{["Electronics", "Homeware", "Hardware", "Maintenance", "Security", "Furniture"].map((item) => <label className="check-row" key={item}><input checked={category === item} onChange={() => { setCategory(item); setPage(1); }} type="radio" />{item}</label>)}<h2>Price range</h2><input aria-label="Maximum price" className="price-slider" max="500000" min="0" onChange={(event) => { setMaxPrice(Number(event.target.value)); setPage(1); }} type="range" value={maxPrice} /><div className="range-labels"><span>₦0</span><span>{formatNaira(maxPrice)} max</span></div><h2>Status</h2><div className="status-filters">{["All", "In Stock", "Low Stock", "Out of Stock"].map((item) => <button aria-pressed={stock === item} className={stock === item ? "is-selected" : ""} key={item} onClick={() => { setStock(item); setPage(1); }} type="button">{item}</button>)}</div><button className="button button--outline reset-button" onClick={() => { setCategory("All Categories"); setStock("All"); setMaxPrice(500000); setQuery(""); setPage(1); }} type="button">Reset Filters</button></aside><section className="catalog-results"><label className="catalog-search">⌕<input aria-label="Filter products" onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Search inventory, SKU, or category..." value={query} /></label><div className="product-card-grid">{visibleProducts.map((product) => <article className="product-card" key={product.id}><div className="product-image-wrap"><Image alt={product.name} className="product-image" height={150} src={product.image} width={240} /><StatusBadge stock={product.stock} /></div><div className="product-card-body"><small>{product.category.toUpperCase()}</small><h2>{product.name}</h2><p>{product.description}</p><div className="product-card-footer"><span>Price<strong>{formatNaira(product.price)}</strong></span><button aria-label={`Edit ${product.name}`} className="edit-product-button" onClick={() => setEditor(product)} type="button">✎</button></div></div></article>)}</div>{filteredProducts.length === 0 && <div className="empty-products">No products match these filters. Try changing your search or reset the filters.</div>}<div className="catalog-pager"><span>Showing {visibleProducts.length} of {filteredProducts.length} products</span><div><button aria-label="Previous products" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button">‹</button><strong>{page} / {pageCount}</strong><button aria-label="Next products" disabled={page >= pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} type="button">›</button></div></div></section></div>
    {editor !== undefined && <ProductEditor onClose={() => setEditor(undefined)} onSave={save} product={editor} />}
  </StoreShell>;
}

export function ProductCatalogRoute() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("search") ?? "";
  return <ProductCatalogScreen initialQuery={initialQuery} key={initialQuery} />;
}

export function InventoryScreen() {
  const { settings } = useSiteSettings();
  const { products: allProducts, setProducts, storageError } = useStoreProducts("owner");
  const products = [...allProducts].sort((a, b) => Number(a.featured) - Number(b.featured));
  const [filter, setFilter] = useState("All Stock");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState<StoreProduct | null | undefined>();
  const [notice, setNotice] = useState("");
  const rows = products.filter((product) => {
    const matchesStock = filter === "All Stock" || (filter === "Out of Stock" && product.stock === 0) || (filter === "Low Stock" && product.stock > 0 && product.stock <= 10);
    const matchesQuery = `${product.name} ${product.sku} ${product.category}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesStock && matchesQuery;
  });
  const totalUnits = products.reduce((sum, product) => sum + product.stock, 0);
  const stockValue = products.reduce((sum, product) => sum + product.price * product.stock, 0);
  const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 10).length;
  function save(product: StoreProduct) {
    const storageError = setProducts((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? product : item)
      : [product, ...current]);
    setEditor(undefined);
    setNotice(storageError
      ? `${product.name} was updated for this session, but could not be saved to browser storage: ${storageError}`
      : `${product.name} saved in this browser.`);
  }
  function removeProduct(product: StoreProduct) {
    if (!window.confirm(`Delete "${product.name}" from inventory? This cannot be undone.`)) {
      return;
    }

    const storageError = setProducts((current) => current.filter((item) => item.id !== product.id));
    setNotice(storageError
      ? `${product.name} was removed for this session, but could not be saved to browser storage: ${storageError}`
      : `${product.name} deleted from inventory.`);
  }

  return <StoreShell><div className="screen-title-row"><div><div className="screen-breadcrumb">Store <span>›</span> <strong>Inventory Management</strong></div><h1>Products Management</h1></div><button className="button button--primary" onClick={() => setEditor(null)} type="button">＋ Add New Product</button></div>{notice && <div className="screen-notice" role="status">{notice}<button aria-label="Dismiss" onClick={() => setNotice("")} type="button">×</button></div>}{storageError && <div className="screen-error" role="alert">Product data could not be saved: {storageError}</div>}
    <div className="inventory-metrics"><Metric label="Total Inventory" value={totalUnits.toLocaleString("en-NG")} note="Units across all products" tone="gold" /><Metric label="Active Products" value={String(products.filter((product) => product.stock > 0).length)} note={`Of ${products.length} catalog products`} tone="blue" /><Metric label="Low Stock Alerts" value={String(lowStockCount)} note="Products with 1–10 units" tone="red" /><Metric label="Total Stock Value" value={formatNaira(stockValue)} note="Based on current catalog prices" tone="gold" /></div>
    <section className="screen-card inventory-table-card"><div className="inventory-toolbar"><div className="tab-buttons">{["All Stock", "Out of Stock", "Low Stock"].map((item) => <button aria-pressed={filter === item} className={filter === item ? "is-active" : ""} key={item} onClick={() => setFilter(item)} type="button">{item}</button>)}</div><div className="screen-actions"><label className="catalog-search inventory-search">⌕<input aria-label="Search inventory" onChange={(event) => setQuery(event.target.value)} placeholder="Search name, SKU, or category" value={query} /></label><button className="button button--outline" onClick={() => downloadCsv(`${fileSlug(settings.siteName)}-inventory.csv`, [["Product", "SKU", "Category", "Price (NGN)", "Stock", "Status"], ...rows.map((product) => [product.name, product.sku, product.category, String(product.price), String(product.stock), product.stock === 0 ? "Out of Stock" : product.stock <= 10 ? "Low Stock" : "In Stock"])])} type="button">⇩ &nbsp;Export CSV</button></div></div><div className="table-scroll"><table><thead><tr><th>Product Name &amp; SKU</th><th>Category</th><th>Price</th><th>Stock Level</th><th>Status</th><th>Actions</th></tr></thead><tbody>{rows.map((product) => <tr key={product.id}><td><span className="inventory-product"><Image alt="" height={42} src={product.image} width={42} /><span><strong>{product.name}</strong><small>SKU: {product.sku}</small></span></span></td><td>{product.category}</td><td className="amount-cell">{formatNaira(product.price)}</td><td><span className={`stock-level${product.stock <= 10 ? " stock-level--low" : ""}`}><span><i style={{ width: `${Math.min(product.stock, 100)}%` }} /></span>{product.stock} units</span></td><td><StatusBadge stock={product.stock} /></td><td><button aria-label={`Edit ${product.name}`} className="icon-action" onClick={() => setEditor(product)} type="button">✎</button><button aria-label={`Delete ${product.name}`} className="icon-action icon-action--delete" onClick={() => removeProduct(product)} type="button"><svg aria-hidden="true" fill="none" height="14" viewBox="0 0 16 16" width="14"><path d="M2.5 4h11m-9.75 0 .65 9.1a1 1 0 0 0 1 .9h4.2a1 1 0 0 0 1-.9l.65-9.1M6 4V2.75a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 .75.75V4m-3 2.25v5m3-5v5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25"/></svg></button></td></tr>)}{rows.length === 0 && <tr><td className="empty-row" colSpan={6}>No products match this stock filter and search.</td></tr>}</tbody></table></div><div className="table-pagination"><span>Showing {rows.length} of {products.length} products</span><div><Link className="button button--outline" href="/store-app/products">View catalog</Link></div></div></section>
    {editor !== undefined && <ProductEditor onClose={() => setEditor(undefined)} onSave={save} product={editor} />}
  </StoreShell>;
}

type Registration = {
  name: string;
  category: string;
  description: string;
  manager: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  opening: string;
  closing: string;
};

const emptyRegistration: Registration = {
  name: "", category: "Retail & Grocery", description: "", manager: "", phone: "",
  address: "", city: "", state: "", zip: "", opening: "", closing: "",
};

export function StoreRegistrationScreen() {
  const { settings } = useSiteSettings();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState(emptyRegistration);
  const [weekends, setWeekends] = useState(true);
  const [documentNames, setDocumentNames] = useState(["", ""]);
  const [logoName, setLogoName] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [settlementFrequency, setSettlementFrequency] = useState("Monthly");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const steps = ["Store Identity", "Location & Space", "Documents", "Payment Terms"];

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    };
  }, [logoPreview]);

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setDetails((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function updateLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for the store logo.");
      event.target.value = "";
      return;
    }
    if (file.size > 1024 * 1024) {
      setError("Store logos must be 1 MB or smaller.");
      event.target.value = "";
      return;
    }

    setError("");
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (step < 3) {
      setStep((current) => current + 1);
      return;
    }

    setSubmitting(true);
    storeFetch("/store/register", {
      method: "POST",
      body: JSON.stringify({
        name: details.name,
        category: details.category,
        phone: details.phone,
        description: details.description,
        address: [details.address, details.city, details.state, details.zip].filter(Boolean).join(", "),
        logo: logoPreview.startsWith("data:") ? logoPreview : undefined,
        open_weekends: weekends,
        settlement_method: paymentMethod,
        settlement_frequency: settlementFrequency,
      }),
    })
      .then(() => setComplete(true))
      .catch((saveError) => setError(saveError instanceof Error ? saveError.message : "The registration could not be saved."))
      .finally(() => setSubmitting(false));
  }

  return <StoreShell><div className="registration-heading"><h1>Register New Store</h1><p>Complete the following steps to onboard a new commercial entity into {settings.siteName || "your business"}.</p></div><div className="stepper">{steps.map((label, index) => <button className={index === step ? "is-current" : index < step ? "is-done" : ""} key={label} onClick={() => { if (index < step) setStep(index); }} type="button"><span>{index < step ? "✓" : `0${index + 1}`}</span>{label}</button>)}</div>
    {complete ? <section className="registration-success"><span>✓</span><h2>Store registered</h2><p>{details.name} is now registered. Document files are not uploaded yet; only the store details were saved.</p><div><Link className="button button--primary" href="/store-app/store">Return to Store</Link><Link className="button button--outline" href="/store-app/products">Manage Products</Link></div></section> : <form onSubmit={next}><div className="registration-layout"><div className="registration-forms">{step === 0 && <section className="screen-card registration-card"><h2>General Information</h2><div className="form-grid"><label>Store Name<input name="name" onChange={update} placeholder="e.g. Premium Grocers" required value={details.name} /></label><label>Category<select name="category" onChange={update} value={details.category}><option>Retail &amp; Grocery</option><option>Electronics</option><option>Home &amp; Garden</option><option>Property Services</option><option>Security</option></select></label><label className="form-span">Description<textarea name="description" onChange={update} placeholder="Provide a brief overview of the store’s offerings..." rows={3} value={details.description} /></label><label>Store Manager<input name="manager" onChange={update} placeholder="Full name" required value={details.manager} /></label><label>Contact Number<input name="phone" onChange={update} placeholder="+234 802 555 0148" required type="tel" value={details.phone} /></label></div></section>}
      {step === 1 && <section className="screen-card registration-card"><h2>Location &amp; Space</h2><div className="form-grid"><label className="form-span">Street address<input name="address" onChange={update} placeholder="123 Corporate Blvd, Suite 400" required value={details.address} /></label><label>City<input name="city" onChange={update} required value={details.city} /></label><label>State<input name="state" onChange={update} required value={details.state} /></label><label>ZIP code<input name="zip" onChange={update} required value={details.zip} /></label><label>Opening time<input name="opening" onChange={update} required type="time" value={details.opening} /></label><label>Closing time<input name="closing" onChange={update} required type="time" value={details.closing} /></label><label className="toggle-row"><input checked={weekends} onChange={(event) => setWeekends(event.target.checked)} type="checkbox" /> Open on Weekends</label></div></section>}
      {step === 2 && <section className="screen-card registration-card"><h2>Required Documents</h2><p className="form-help">Select your business registration and proof of occupancy. The document names are saved with this local registration draft; file contents are not uploaded.</p><div className="upload-grid">{["Business registration", "Proof of occupancy"].map((label, index) => <label className="upload-field" key={label}>{label}<input accept=".pdf,.png,.jpg,.jpeg" onChange={(event) => { const name = event.target.files?.[0]?.name ?? ""; setDocumentNames((current) => current.map((value, position) => position === index ? name : value)); }} type="file" /><small>{documentNames[index] || "Choose a PDF or image"}</small></label>)}</div></section>}
      {step === 3 && <section className="screen-card registration-card"><h2>Payment Terms</h2><p className="form-help">Choose how settlements should be scheduled for this store.</p><div className="form-grid"><label>Settlement method<select onChange={(event) => setPaymentMethod(event.target.value)} value={paymentMethod}><option>Bank Transfer</option><option>Card</option><option>Mobile Money</option></select></label><label>Settlement frequency<select onChange={(event) => setSettlementFrequency(event.target.value)} value={settlementFrequency}><option>Weekly</option><option>Monthly</option><option>Quarterly</option></select></label><label className="form-span terms-check"><input required type="checkbox" /> I confirm these business details are accurate and agree to the store terms.</label></div></section>}
      {error && <div className="screen-error" role="alert">{error}</div>}<div className="registration-actions"><Link className="button button--outline" href="/store-app/store">Cancel</Link>{step > 0 && <button className="button button--outline" onClick={() => setStep((current) => current - 1)} type="button">Back</button>}<button className="button button--primary" disabled={submitting} type="submit">{step === 3 ? (submitting ? "Registering…" : "Register store") : "Next Step →"}</button></div></div>
      <aside className="registration-aside"><section className="screen-card branding-card"><h2>Store Branding</h2><label className="logo-upload">{logoPreview ? <Image alt="Selected store logo preview" height={56} src={logoPreview} unoptimized width={56} /> : "＋"}<strong>{logoName || "Upload Store Logo"}</strong><small>SVG, PNG OR JPG (MAX 5MB)<input accept="image/*" onChange={updateLogo} type="file" /></small></label><div className="quick-tip"><strong>QUICK TIP</strong><span>The logo preview is local to this browser. File contents are not uploaded to the server.</span></div></section><section className="registration-progress"><strong>Registration Progress</strong><div className="target-track"><span style={{ width: `${(step + 1) * 25}%` }} /></div><span className="progress-percent">{(step + 1) * 25}%</span>{steps.map((item, index) => <span className={index <= step ? "progress-step is-reached" : "progress-step"} key={item}>{index < step ? "✓" : "○"} &nbsp;{item}</span>)}</section></aside></div></form>}
  </StoreShell>;
}

export function SubscriptionScreen() {
  const { settings } = useSiteSettings();
  const planSnapshot = useSyncExternalStore(subscribeToPlan, getCurrentPlan, () => serverPlanSnapshot);
  const currentPlan = planSnapshot.plan;
  const [notice, setNotice] = useState("");
  const [invoices, setInvoices] = useState<string[][]>([]);

  const loadInvoices = () =>
    storeFetch<{ id: string; date: string; amount: string; status: string }[]>("/store/invoices")
      .then((rows) => setInvoices(rows.map((r) => [r.id, r.date, r.amount, r.status])))
      .catch(() => setInvoices([]));

  useEffect(() => { void loadPlan(); void loadInvoices(); }, []);

  async function choosePlan(name: string) {
    try {
      await updateCurrentPlan(name);
      await loadInvoices();
      setNotice(`You are now on the ${name} plan. An invoice was raised; payment is collected separately.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Your plan could not be updated.");
    }
  }

  return <StoreShell activeNav="Finance"><div className="registration-heading"><h1>Subscription Plans</h1><p>Choose the right tier to scale your estate’s digital storefront.</p></div>{planSnapshot.error && <div className="screen-error" role="alert">Subscription could not be loaded: {planSnapshot.error}</div>}{notice && <div className="screen-notice" role="status">{notice}</div>}<p className="form-help">Switching plan raises an invoice. No card is charged automatically.</p><div className="plan-grid">{plans.map((plan) => <article className={`plan-card${currentPlan === plan.name ? " plan-card--current" : ""}`} key={plan.name}>{currentPlan === plan.name && <span className="current-plan-label">CURRENT PLAN</span>}<span className={`plan-tag plan-tag--${plan.name.toLowerCase()}`}>{plan.name.toUpperCase()}</span><div className="plan-price">{formatNaira(plan.price)}<small>/mo</small></div><ul>{plan.features.map((feature) => <li key={feature}><span>✓</span>{feature}</li>)}</ul>{plan.name === "Enterprise" ? <a className="button button--outline" href={`mailto:${settings.supportEmail}?subject=Enterprise%20Plan`}>Contact Sales</a> : <button aria-pressed={currentPlan === plan.name} className={`button ${currentPlan === plan.name ? "button--primary" : "button--outline"}`} disabled={currentPlan === plan.name} onClick={() => choosePlan(plan.name)} type="button">{currentPlan === plan.name ? "Current plan" : `Switch to ${plan.name}`}</button>}</article>)}</div>
    <section className="screen-card billing-card"><div className="billing-heading"><div><strong>Billing History</strong><small>Invoices raised for your store.</small></div><button className="text-button" onClick={() => exportBillingHistory(settings.siteName, invoices)} type="button">⇩ Export CSV</button></div><div className="table-scroll"><table><thead><tr><th>Invoice ID</th><th>Date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{invoices.map(([id, date, amount, status]) => <tr key={id}><td><strong>{id}</strong></td><td>{date}</td><td>{amount}</td><td><span className={`order-status order-status--${status.toLowerCase()}`}>{status}</span></td><td><button aria-label={`Download invoice ${id}`} className="icon-action" onClick={() => downloadCsv(`${id.replace(/[^a-z0-9-]/gi, "")}.csv`, [["Invoice ID", "Date", "Amount", "Status"], [id, date, amount, status]])} type="button">⇩</button></td></tr>)}</tbody></table></div><div className="table-pagination"><span>{invoices.length} invoice{invoices.length === 1 ? "" : "s"}</span><button className="button button--outline" onClick={() => setNotice("Payment method updates are unavailable because a payment provider is not connected.")} type="button">Update payment method</button></div></section>
  </StoreShell>;
}

function exportBillingHistory(businessName: string, invoices: string[][]) {
  downloadCsv(`${fileSlug(businessName)}-billing-history.csv`, [["Invoice ID", "Date", "Amount", "Status"], ...invoices]);
}


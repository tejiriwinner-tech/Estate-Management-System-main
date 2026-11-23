"use client";

import { storeFetch } from "../lib/api";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { getOriginalSiteUrl, useSiteSettings } from "./site-settings";
import { StoreAvailabilityControl } from "./store-screens";

const iconFiles = {
  chevron: "d5eaf6f4-5173-4beb-846a-6b5eb8fa18a8",
  reminder: "f7a08f1a-ce3b-428b-8faa-980967fe2019",
  add: "3e51fe84-39c6-4b2b-8711-4c17461879e8",
  badge: "fc6e6b87-2f0c-402a-a118-2a0711195064",
  trend: "baaa9297-bb31-4b1a-99fe-f9893487d782",
  revenue: "1c6d3b50-898f-40a8-80c3-f8f1876b6fa8",
  overdueClock: "c60c9911-a26c-49fe-afdb-b49a3d7d3f29",
  settlement: "77cb8d01-61c2-4fb8-99f8-9b70a2a11b7e",
  stock: "47cafb9f-68c1-431b-a0ae-ba47e6061d48",
  products: "6ae7b1d1-ab9a-4710-94af-ab29cc5c65f6",
  newOrders: "a2fc345c-56ee-41c3-bcd7-65bff4e3c3a1",
  orders: "5a120a91-c671-43e9-bad6-632539312148",
  external: "115f13d1-f544-4060-bedb-b9f5dccbe0ad",
  insurance: "9b1e9bb0-1110-406e-9e4b-c6329c673d11",
  warehouse: "9822bfd1-20f8-46d0-ba95-d855a4b6b5e7",
  warehouseAlt: "7b9294a5-62ec-4b34-ae62-65c8a597b30f",
  logistics: "ce64f450-270e-4760-bb0d-45bdf11b9058",
  overdue: "51a7f051-bb5b-4127-8c7a-928f114668a0",
  checklist: "8c3638fe-2bc8-449c-956d-a8fca359c9f7",
  warning: "7d4520f0-5299-419b-ba1c-5ffed59190d5",
  bank: "43df0210-f111-47e2-a282-a6b7f1c63504",
  frequency: "5797e0e5-71b9-4c7c-baa0-a2407a6bd3ee",
  autopay: "902911f1-b326-4fc9-9f4b-4f83ab1f9aec",
  document: "44ffe635-e242-425e-9ede-b88681f78f2a",
  download: "e0adc314-840a-40cf-9ec9-47153dab5429",
  info: "a4958412-022b-4a78-8c78-28784239c618",
  notification: "c8cbcd18-6c71-4c0b-8b1f-4d3bac565b58",
  dashboard: "eb13e4a3-4c6f-430e-acb1-74b1df2ffa56",
  finance: "2476d259-c7bb-4edc-a055-334fcb969f46",
  store: "811ce434-bca3-4492-9bc3-96627eb1a217",
  messages: "28599a1e-65f4-4c6b-ba22-d78c03f2ac3b",
  reports: "61622eaa-c4dc-42d6-b574-151410afba28",
  staff: "147931a8-b4ff-4c56-9880-aae56b0c7218",
  logout: "2572e3c9-ca9f-4fcb-9a55-962fb709256f",
} as const;

type IconName = keyof typeof iconFiles;

const iconDimensions: Record<IconName, [number, number]> = {
  chevron: [4.31667, 7],
  reminder: [15.8333, 13.3333],
  add: [16.6667, 16.6667],
  badge: [14.6667, 14],
  trend: [11.6667, 7],
  revenue: [22, 16],
  overdueClock: [11.6667, 11.6667],
  settlement: [19, 18],
  stock: [11.6667, 11.6667],
  products: [18, 18],
  newOrders: [10.5, 10.5],
  orders: [16, 20],
  external: [12, 12],
  insurance: [16, 20],
  warehouse: [20, 18],
  warehouseAlt: [20, 20],
  logistics: [22, 16],
  overdue: [12.8333, 11.0833],
  checklist: [26.6667, 20.1],
  warning: [16.6667, 16.6667],
  bank: [20, 20],
  frequency: [18, 20],
  autopay: [22, 12],
  document: [16, 20],
  download: [12, 12],
  info: [18, 18],
  notification: [16, 20],
  dashboard: [18, 18],
  finance: [22, 16],
  store: [20.0939, 18],
  messages: [20, 20],
  reports: [16, 16],
  staff: [22, 16],
  logout: [18, 18],
};

type Transaction = {
  id: number;
  service: string;
  invoice: string;
  amount: string;
  date: string;
  status: string;
};

type DashboardData = {
  merchant: {
    name: string;
    merchantId: string;
    joinedAt: string;
    tier: string;
    totalRevenue: string;
    pendingSettlements: string;
    activeProducts: number;
    orderVolume: number;
    settlementMode: string;
    settlementFrequency: string;
    autoPayEnabled: boolean;
    documentName: string;
  };
  transactions: Transaction[];
  urgentAction: {
    title: string;
    amount: string;
    dueDate: string;
    overdueDays: number;
  } | null;
  nextBillingDate: string;
};

type DialogContent = {
  title: string;
  description: string;
  action?: { href: string; label: string };
};

const storeMenuItems: { label: string; icon: IconName; href: string }[] = [
  { label: "Store", icon: "store", href: "/store-app/store" },
  { label: "Owner access", icon: "staff", href: "/store-app/owner" },
  { label: "Dashboard", icon: "dashboard", href: "/" },
  { label: "Finance", icon: "finance", href: "/store-app/subscription" },
  { label: "Messages", icon: "messages", href: "/store-app/messages" },
  { label: "Reports", icon: "reports", href: "/store-app/reports" },
  { label: "Staff", icon: "staff", href: "/store-app/staff" },
  { label: "Settings", icon: "dashboard", href: "/store-app/settings" },
  { label: "Analytics", icon: "trend", href: "/store-app/dashboard" },
  { label: "Products", icon: "products", href: "/store-app/products" },
  { label: "Inventory", icon: "stock", href: "/store-app/products/manage" },
  { label: "Register store", icon: "add", href: "/store-app/stores/new" },
  { label: "Checkout", icon: "finance", href: "/store-app/checkout" },
];

function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  const [nativeWidth, nativeHeight] = iconDimensions[name];
  const scale = size / Math.max(nativeWidth, nativeHeight);

  return (
    <Image
      src={`/figma/${iconFiles[name]}.svg`}
      alt=""
      aria-hidden="true"
      width={nativeWidth * scale}
      height={nativeHeight * scale}
      unoptimized
    />
  );
}

function formatCurrency(value: string | number) {
  return `₦${new Intl.NumberFormat("en-NG", {
    maximumFractionDigits: 0,
  }).format(Number(value))}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function MetricCard({
  label,
  value,
  caption,
  icon,
  iconSize = 22,
  variant = "green",
  captionIcon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: IconName;
  iconSize?: number;
  variant?: "green" | "red" | "blue";
  captionIcon: IconName;
}) {
  return (
    <section className={`metric-card metric-card--${variant}`}>
      <div>
        <p className="eyebrow">{label}</p>
        <p className="metric-value">{value}</p>
        <p className="metric-caption">
          <Icon name={captionIcon} size={12} />
          <span>{caption}</span>
        </p>
      </div>
      <span className="metric-icon">
        <Icon name={icon} size={iconSize} />
      </span>
    </section>
  );
}

export default function StoreDashboard() {
  const { settings } = useSiteSettings();
  const pathname = usePathname();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [dialog, setDialog] = useState<DialogContent | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [printingTransaction, setPrintingTransaction] = useState<Transaction | null>(null);
  const [isInvoicePrintReady, setIsInvoicePrintReady] = useState(false);

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

  useEffect(() => {
    if (!printingTransaction) return;
    const handleAfterPrint = () => {
      setIsInvoicePrintReady(false);
      setPrintingTransaction(null);
    };
    window.addEventListener("afterprint", handleAfterPrint, { once: true });
    const frame = window.requestAnimationFrame(() => setIsInvoicePrintReady(true));
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, [printingTransaction]);

  useEffect(() => {
    if (!isInvoicePrintReady) return;
    window.print();
  }, [isInvoicePrintReady]);

  useEffect(() => {
    if (!dialog) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialog(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dialog]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const data = await storeFetch<DashboardData>("/store/owner-dashboard");
        if (!data) {
          throw new Error("The dashboard API returned no dashboard data.");
        }
        const result = { data, preview: false };
        void controller;

        setDashboard(result.data);
        setIsPreview(result.preview === true);
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setLoadError(
          error instanceof Error
            ? error.message
            : "An unexpected error prevented the dashboard from loading.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => controller.abort();
  }, [retryCount]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!dashboard || !query) {
      return dashboard?.transactions ?? [];
    }

    return dashboard.transactions.filter((transaction) =>
      `${transaction.service} ${transaction.invoice} ${transaction.status}`
        .toLowerCase()
        .includes(query),
    );
  }, [dashboard, search]);

  function openDialog(
    title: string,
    description: string,
    action?: DialogContent["action"],
  ) {
    setNotice("");
    setDialog({ title, description, action });
  }

  const reminderMessage = dashboard?.urgentAction
    ? `Hello, this is a reminder that ${dashboard.urgentAction.title} of ${formatCurrency(dashboard.urgentAction.amount)} was due on ${formatDate(dashboard.urgentAction.dueDate)}. Please complete payment at your earliest convenience.`
    : "Please review your overdue store invoice and complete payment at your earliest convenience.";

  async function copyReminder() {
    try {
      await navigator.clipboard.writeText(reminderMessage);
      setDialog(null);
      setNotice("Payment reminder copied. You can now paste it into your customer message.");
    } catch (error) {
      const details = error instanceof Error ? error.message : "Clipboard access was denied.";
      setNotice(`Could not copy the reminder: ${details}`);
    }
  }

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
        <Link className="brand" href="/store-app" aria-label="LincolnEstate Store Portal" onClick={() => setIsMobileNavOpen(false)}>
          <span className="brand-mark">
            <span className="brand-initial">LE</span>
            <span className="brand-badge-dot" />
          </span>
          <span className="brand-copy">
            <strong>Lincoln<span style={{ color: "var(--primary)" }}>Estate</span></strong>
            <small style={{ color: "#C9A227", fontWeight: "700", letterSpacing: "0.05em" }}>STORE OWNER HUB</small>
          </span>
        </Link>

        <nav aria-label="Main navigation" className="side-nav">
          {[
            { label: "Store Dashboard", href: "/store-app", icon: "dashboard" as const },
            { label: "Orders & Fulfillment", href: "/store-app/dashboard", icon: "orders" as const },
            { label: "Product Catalog", href: "/store-app/products", icon: "products" as const },
            { label: "Inventory & Stock", href: "/store-app/products/manage", icon: "stock" as const },
            { label: "Settlements & Payouts", href: "/store-app/subscription", icon: "settlement" as const },
            { label: "Store Settings", href: "/store-app/settings", icon: "store" as const },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`nav-item store-menu-link${isActive ? " is-active" : ""}`}
                href={item.href}
                key={item.href}
                onClick={() => setIsMobileNavOpen(false)}
                style={isActive ? {
                  background: "var(--primary)",
                  color: "#ffffff",
                  borderRadius: "12px",
                  fontWeight: "600",
                } : undefined}
              >
                <Icon name={item.icon} size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <button
          className="logout-button"
          onClick={() => {
            setIsMobileNavOpen(false);
            window.location.assign("/login");
          }}
          type="button"
        >
          <Icon name="logout" size={18} />
          <span>Sign Out</span>
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
          <label className="search-field">
            <span className="search-icon" aria-hidden="true" />
            <input
              aria-label="Search transactions"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transactions by service, invoice, or status..."
              value={search}
            />
            {search && (
              <button
                aria-label="Clear search"
                className="clear-search"
                onClick={() => setSearch("")}
                type="button"
              >
                ×
              </button>
            )}
          </label>

          <div className="topbar-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "9999px", background: "#f3f4f6", border: "1px solid #e5e7eb", fontSize: "11px", fontWeight: "700", color: "#1f2937" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#C9A227", display: "inline-block" }} />
              <span>OPERATIONAL</span>
            </div>
            <button
              aria-label="Notifications"
              className="notification-button"
              onClick={() =>
                setNotice("You are all caught up on store notifications.")
              }
              type="button"
            >
              <Icon name="notification" size={20} />
              <span className="notification-dot" />
            </button>
            <span className="topbar-divider" />
            <div className="admin-profile">
              <div style={{ textAlign: "right" }}>
                <strong style={{ display: "block", fontSize: "13px", color: "#1a1a1a" }}>{dashboard?.merchant.name || "Lincoln Central Mart"}</strong>
                <small style={{ color: "#6b7280", fontSize: "11px" }}>Verified Store Merchant</small>
              </div>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#FEF2F2", border: "1px solid rgba(178,34,34,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#B22222", fontWeight: "bold", fontSize: "13px" }}>
                LM
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          {notice && (
            <div className="notice" role="status">
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
                type="button"
              >
                ×
              </button>
            </div>
          )}

          {isPreview && (
            <div className="preview-notice" role="status">
              Showing Figma preview data only. Connect the Laravel API and MySQL
              database before using live store information.
            </div>
          )}

          <div className="page-heading">
            <div className="heading-copy">
              <div className="breadcrumbs">
                <span>Estate Marketplace</span>
                <Icon name="chevron" size={7} />
                <strong>
                  {dashboard?.merchant.name || settings.siteName || "Lincoln Central Mart"}
                </strong>
              </div>
              <h1>Store Dashboard</h1>
            </div>
            <div className="heading-actions">
              <button
                className="button button--outline"
                onClick={() =>
                  openDialog(
                    "Send payment reminder",
                    `Copy a reminder for ${dashboard?.urgentAction?.title ?? "your overdue invoice"} and send it through your usual customer channel.`,
                  )
                }
                type="button"
              >
                <Icon name="reminder" size={16} />
                <span>Send Reminder</span>
              </button>
              <Link className="button button--primary" href="/store-app/products">
                <Icon name="add" size={17} />
                <span>New Product</span>
              </Link>
            </div>
          </div>

          <StoreAvailabilityControl />

          {isLoading && (
            <div className="state-card" role="status">
              <span className="loading-spinner" />
              <span>Loading your store dashboard…</span>
            </div>
          )}

          {!isLoading && loadError && (
            <div className="error-card" role="alert">
              <div>
                <strong>We couldn&apos;t load your store data.</strong>
                <p>{loadError}</p>
              </div>
              <button
                className="button button--outline"
                onClick={() => setRetryCount((count) => count + 1)}
                type="button"
              >
                Try again
              </button>
            </div>
          )}

          {dashboard && (
            <>
              <div className="metrics-grid">
                <section className="merchant-card">
                  <div className="merchant-picture">
                    <Image
                      alt=""
                      className="merchant-image"
                      height={96}
                      src="/figma/4571e406-4219-493c-9a9e-11dbe4e458bd.png"
                      width={96}
                    />
                  </div>
                  <h2>{settings.siteName || "Your business"}</h2>
                  <span className="tier-badge">
                    <Icon name="badge" size={14} />
                    {dashboard.merchant.tier}
                  </span>
                  <div className="merchant-details">
                    <div>
                      <span>Merchant ID</span>
                      <strong>#{dashboard.merchant.merchantId}</strong>
                    </div>
                    <div>
                      <span>Joined</span>
                      <strong>{formatDate(dashboard.merchant.joinedAt)}</strong>
                    </div>
                  </div>
                </section>

                <div className="metric-cards-grid">
                  <MetricCard
                    caption="+12.5% from last month"
                    captionIcon="trend"
                    icon="revenue"
                    label="Total Revenue"
                    value={formatCurrency(dashboard.merchant.totalRevenue)}
                  />
                  <MetricCard
                    caption="14 days overdue"
                    captionIcon="overdueClock"
                    icon="settlement"
                    iconSize={19}
                    label="Pending Settlements"
                    value={formatCurrency(
                      dashboard.merchant.pendingSettlements,
                    )}
                    variant="red"
                  />
                  <MetricCard
                    caption="98% in stock"
                    captionIcon="stock"
                    icon="products"
                    iconSize={18}
                    label="Active Products"
                    value={`${dashboard.merchant.activeProducts.toLocaleString("en-NG")} Items`}
                    variant="blue"
                  />
                  <MetricCard
                    caption="24 new today"
                    captionIcon="newOrders"
                    icon="orders"
                    iconSize={20}
                    label="Order Volume"
                    value={dashboard.merchant.orderVolume.toLocaleString(
                      "en-NG",
                    )}
                    variant="blue"
                  />
                </div>
              </div>

              <div className="details-grid">
                <section className="panel timeline-panel">
                  <div className="panel-heading">
                    <h2>Sales Timeline</h2>
                    <button
                      className="text-button"
                      onClick={() => {
                        setSearch("");
                        setNotice(`Showing all ${dashboard.transactions.length} available transactions.`);
                      }}
                      type="button"
                    >
                      View All <Icon name="external" size={12} />
                    </button>
                  </div>

                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Service</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((transaction, index) => {
                          const rowIcon: IconName =
                            index === 0
                              ? "insurance"
                              : index === 1
                                ? "warehouse"
                                : "logistics";

                          return (
                            <tr key={transaction.id}>
                              <td>
                                <div className="service-cell">
                                  <span
                                    className={`service-icon service-icon--${index % 3}`}
                                  >
                                    <Icon name={rowIcon} size={20} />
                                  </span>
                                  <span>
                                    <strong>{transaction.service}</strong>
                                    <small>{transaction.invoice}</small>
                                  </span>
                                </div>
                              </td>
                              <td className="amount-cell">
                                {formatCurrency(transaction.amount)}
                              </td>
                              <td className="date-cell">
                                {formatDate(transaction.date)}
                              </td>
                              <td>
                                <span className="paid-badge">
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="action-cell">
                                <button
                                  aria-label={`Print ${transaction.service} invoice`}
                                  className="icon-button print-button"
                                  onClick={() => setPrintingTransaction(transaction)}
                                  type="button"
                                >
                                  <Icon name="document" size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td className="empty-row" colSpan={5}>
                              No transactions match &ldquo;{search}&rdquo;.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                {dashboard.urgentAction ? (
                <section className="panel urgent-panel">
                  <h2>Urgent Actions</h2>
                  <div className="urgent-card">
                    <div className="urgent-title-row">
                      <strong>{dashboard.urgentAction!.title}</strong>
                      <strong className="urgent-amount">
                        {formatCurrency(dashboard.urgentAction!.amount)}
                      </strong>
                    </div>
                    <p>Due: {formatDate(dashboard.urgentAction!.dueDate)}</p>
                    <div className="urgent-footer">
                      <span>
                        <Icon name="warning" size={13} />
                        {dashboard.urgentAction!.overdueDays} Days Overdue
                      </span>
                      <button
                        className="button button--danger"
                        onClick={() => openDialog(
                          "Online payment unavailable",
                          "A payment provider is not connected, so this invoice cannot be paid online here. No payment was started.",
                          { href: `mailto:${settings.supportEmail}?subject=Payment%20assistance`, label: "Contact support" },
                        )}
                        type="button"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>

                  <div className="no-payments">
                    <span className="checklist-icon">
                      <Icon name="checklist" size={25} />
                    </span>
                    <strong>No other pending payments found for this cycle.</strong>
                  </div>

                  <div className="billing-note">
                    <Icon name="info" size={14} />
                    <span>
                      Automated billing for the next cycle (Q1 2024) will be
                      generated on{" "}
                      <strong>{formatDate(dashboard.nextBillingDate)}.</strong>
                    </span>
                  </div>
                </section>
                ) : (
                  <section className="panel urgent-panel"><h2>Urgent Actions</h2><p>No unpaid invoices.</p></section>
                )}
              </div>

              <div className="summary-grid">
                <SummaryCard
                  icon="bank"
                  label="Settlement Mode"
                  value={dashboard.merchant.settlementMode}
                />
                <SummaryCard
                  icon="frequency"
                  label="Frequency"
                  value={dashboard.merchant.settlementFrequency}
                />
                <SummaryCard
                  icon="autopay"
                  label="Auto-pay Status"
                  value={dashboard.merchant.autoPayEnabled ? "Enabled" : "Disabled"}
                />
                <SummaryCard
                  icon="document"
                  label="Document record · no file attached"
                  value={dashboard.merchant.documentName}
                />
              </div>
            </>
          )}
        </main>
      </div>

      {printingTransaction && isInvoicePrintReady && (
        <section className="print-invoice">
          <p>{settings.siteName} · Sales invoice</p>
          <h1>{printingTransaction.service}</h1>
          <dl>
            <div><dt>Invoice</dt><dd>{printingTransaction.invoice}</dd></div>
            <div><dt>Date</dt><dd>{formatDate(printingTransaction.date)}</dd></div>
            <div><dt>Status</dt><dd>{printingTransaction.status}</dd></div>
            <div><dt>Amount</dt><dd>{formatCurrency(printingTransaction.amount)}</dd></div>
          </dl>
        </section>
      )}

      {dialog && (
        <div
          className="dialog-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setDialog(null);
            }
          }}
        >
          <section aria-labelledby="dialog-title" aria-modal="true" className="dialog" role="dialog">
            <button
              aria-label="Close dialog"
              className="dialog-close"
              onClick={() => setDialog(null)}
              type="button"
            >
              ×
            </button>
            <h2 id="dialog-title">{dialog.title}</h2>
            {dialog.title === "Send payment reminder" ? (
              <textarea aria-label="Payment reminder text" className="reminder-copy" readOnly value={reminderMessage} />
            ) : (
              <p>{dialog.description}</p>
            )}
            {dialog.title === "Send payment reminder" && (
              <button className="button button--outline dialog-confirm" onClick={copyReminder} type="button">
                Copy reminder
              </button>
            )}
            {dialog.action && <Link className="button button--outline dialog-confirm" href={dialog.action.href}>{dialog.action.label}</Link>}
            <button
              className="button button--primary dialog-confirm"
              onClick={() => setDialog(null)}
              type="button"
            >
              Got it
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <section className="summary-card">
      <span className="summary-icon">
        <Icon name={icon} size={19} />
      </span>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </section>
  );
}

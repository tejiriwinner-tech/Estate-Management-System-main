"use client";

import Link from "next/link";
import { StoreAvailabilityControl, StoreShell } from "../components/store-screens";
import { useSiteSettings } from "../components/site-settings";

export default function OwnerPage() {
  const { settings } = useSiteSettings();
  const ownerName = settings.profileName.trim().split(/\s+/)[0] || "Owner";

  return (
    <StoreShell activeNav="Owner access">
      <div className="owner-access-page">
        <section className="owner-access-hero">
          <div className="owner-access-hero-copy">
            <p className="owner-access-eyebrow"><span aria-hidden="true" /> STORE OWNER WORKSPACE</p>
            <h1>Welcome, {ownerName}</h1>
            <p>Manage {settings.siteName || "your store"} availability and day-to-day operations from one place.</p>
          </div>
          <div aria-hidden="true" className="owner-access-mark">
            <span>{settings.siteName.trim().charAt(0).toUpperCase() || "S"}</span>
            <small>OWNER</small>
          </div>
        </section>
        <section aria-labelledby="owner-availability-title" className="owner-access-section">
          <div className="owner-section-heading">
            <div>
              <p className="owner-section-kicker">STORE HEALTH</p>
              <h2 id="owner-availability-title">Availability</h2>
              <p>Choose whether your store is currently open to customers.</p>
            </div>
          </div>
          <StoreAvailabilityControl />
        </section>
        <section aria-labelledby="owner-actions-title" className="owner-access-section">
          <div className="owner-section-heading">
            <div>
              <p className="owner-section-kicker">QUICK ACTIONS</p>
              <h2 id="owner-actions-title">Manage your store</h2>
              <p>Jump straight to the tools you use most.</p>
            </div>
          </div>
          <div className="owner-action-grid">
            <Link className="owner-action-card" href="/store-app/settings">
              <span aria-hidden="true" className="owner-action-icon owner-action-icon--settings">⚙</span>
              <span className="owner-action-copy">
                <strong>Business settings</strong>
                <small>Update your business profile and preferences.</small>
              </span>
              <span aria-hidden="true" className="owner-action-arrow">↗</span>
            </Link>
            <Link className="owner-action-card" href="/store-app/products/manage">
              <span aria-hidden="true" className="owner-action-icon owner-action-icon--inventory">▦</span>
              <span className="owner-action-copy">
                <strong>Manage inventory</strong>
                <small>Review products, prices, and stock levels.</small>
              </span>
              <span aria-hidden="true" className="owner-action-arrow">↗</span>
            </Link>
          </div>
        </section>
        <p className="owner-access-footnote">Owner workspace <span aria-hidden="true">·</span> Open anytime from the Store menu</p>
      </div>
    </StoreShell>
  );
}

"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  newBusinessSettings,
  saveSiteSettings,
  useSiteSettings,
  type SiteSettings,
} from "./site-settings";
import { resetBrowserBusinessData, StoreShell } from "./store-screens";

const sections = ["Profile", "Branding", "Contact", "Preferences", "Notifications"] as const;
type Section = (typeof sections)[number];

export function SiteSettingsScreen() {
  const { settings, storageError } = useSiteSettings();
  const [section, setSection] = useState<Section>("Profile");
  const [draftOverride, setDraftOverride] = useState<SiteSettings | null>(null);
  const draft = draftOverride ?? settings;
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);

  function update(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, type, value } = event.target;
    const checked =
      event.target instanceof HTMLInputElement ? event.target.checked : false;

    setDraftOverride((current) => ({
      ...(current ?? settings),
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
    }));
    setNotice("");
    setError("");
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (section === "Profile" && (!draft.profileName.trim() || !draft.profileEmail.trim())) {
      setError("Enter your name and email address.");
      return;
    }

    if (section === "Branding" && !draft.siteName.trim()) {
      setError("Enter a business name.");
      return;
    }

    if (draft.lowStockThreshold < 1 || draft.lowStockThreshold > 999) {
      setError("The low-stock alert must be between 1 and 999 items.");
      setSection("Preferences");
      return;
    }

    try {
      saveSiteSettings({
        ...draft,
        siteName: draft.siteName.trim(),
        tagline: draft.tagline.trim(),
        profileName: draft.profileName.trim(),
        profileEmail: draft.profileEmail.trim(),
        supportEmail: draft.supportEmail.trim(),
        supportPhone: draft.supportPhone.trim(),
        officeAddress: draft.officeAddress.trim(),
        city: draft.city.trim(),
        state: draft.state.trim(),
      });
      setNotice("Your settings were saved in this browser.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Your settings could not be saved: ${saveError.message}`
          : "Your settings could not be saved in this browser.",
      );
    }
  }

  function resetBusiness() {
    try {
      resetBrowserBusinessData();
      setDraftOverride(newBusinessSettings);
      setSection("Profile");
      setConfirmReset(false);
      setNotice("Browser data cleared. Add your new business name, profile, and products to get started.");
      setError("");
    } catch (resetError) {
      setError(
        resetError instanceof Error
          ? `Business data could not be completely cleared: ${resetError.message}`
          : "Business data could not be completely cleared.",
      );
    }
  }

  return (
    <StoreShell activeNav="Settings">
      <div className="settings-title-row">
        <div>
          <p className="screen-kicker">ADMINISTRATION / PREFERENCES</p>
          <h1>Settings</h1>
          <p>Personalize your business identity, account, and workspace.</p>
        </div>
        <span className="settings-title-badge">Workspace setup</span>
      </div>

      <div className="settings-storage-note" role="note">
        <strong>Browser-saved settings</strong>
        <span>
          Changes apply throughout this browser. Admin sign-in and shared
          account storage have not been set up yet.
        </span>
      </div>

      {(storageError || notice || error) && (
        <div
          className={error || storageError ? "screen-error" : "screen-notice"}
          role={error || storageError ? "alert" : "status"}
        >
          {error || storageError || notice}
        </div>
      )}

      <div className="settings-layout">
        <nav aria-label="Settings sections" className="settings-nav">
          {sections.map((item) => (
            <button
              aria-current={section === item ? "page" : undefined}
              className={section === item ? "is-active" : ""}
              key={item}
              onClick={() => setSection(item)}
              type="button"
            >
              <span>{sectionIcon(item)}</span>
              {item}
            </button>
          ))}
        </nav>

        <form className="settings-panel" onSubmit={save}>
          {section === "Profile" && (
            <SettingsGroup
              description="Your display name and contact email appear across the admin workspace."
              title="Administrator profile"
            >
              <div className="form-grid">
                <label>
                  Full name
                  <input
                    autoComplete="name"
                    maxLength={100}
                    name="profileName"
                    onChange={update}
                    required
                    value={draft.profileName}
                  />
                </label>
                <label>
                  Email address
                  <input
                    autoComplete="email"
                    maxLength={255}
                    name="profileEmail"
                    onChange={update}
                    required
                    type="email"
                    value={draft.profileEmail}
                  />
                </label>
                <label>
                  Role
                  <input
                    maxLength={80}
                    name="jobTitle"
                    onChange={update}
                    value={draft.jobTitle}
                  />
                </label>
              </div>
            </SettingsGroup>
          )}

          {section === "Branding" && (
            <>
              <SettingsGroup
                description="Change the identity, colors and description shown around the site."
                title="Site identity"
              >
                <div className="form-grid">
                  <label>
                    Site name
                    <input
                      autoComplete="organization"
                      maxLength={80}
                      name="siteName"
                      onChange={update}
                      required
                      value={draft.siteName}
                    />
                  </label>
                  <label>
                    Tagline
                    <input
                      maxLength={120}
                      name="tagline"
                      onChange={update}
                      value={draft.tagline}
                    />
                  </label>
                </div>
              </SettingsGroup>
              <SettingsGroup
                description="Choose accessible brand and highlight colors for the dashboard."
                title="Brand colors"
              >
                <div className="color-settings">
                  <ColorField
                    label="Primary brand color"
                    name="accentColor"
                    onChange={update}
                    value={draft.accentColor}
                  />
                  <ColorField
                    label="Highlight color"
                    name="highlightColor"
                    onChange={update}
                    value={draft.highlightColor}
                  />
                </div>
                <div
                  className="brand-preview"
                  style={{
                    background: draft.accentColor,
                    borderColor: draft.highlightColor,
                  }}
                >
                  <strong>{draft.siteName || "Your site name"}</strong>
                  <span>{draft.tagline || "Your site tagline"}</span>
                </div>
              </SettingsGroup>
            </>
          )}

          {section === "Contact" && (
            <SettingsGroup
              description="These business contact details are used in your workspace and support links."
              title="Business contact"
            >
              <div className="form-grid">
                <label>
                  Support email
                  <input
                    autoComplete="email"
                    maxLength={255}
                    name="supportEmail"
                    onChange={update}
                    required
                    type="email"
                    value={draft.supportEmail}
                  />
                </label>
                <label>
                  Phone
                  <input
                    autoComplete="tel"
                    maxLength={32}
                    name="supportPhone"
                    onChange={update}
                    type="tel"
                    value={draft.supportPhone}
                  />
                </label>
                <label className="form-span">
                  Street address
                  <input
                    autoComplete="street-address"
                    maxLength={160}
                    name="officeAddress"
                    onChange={update}
                    value={draft.officeAddress}
                  />
                </label>
                <label>
                  City
                  <input
                    autoComplete="address-level2"
                    maxLength={80}
                    name="city"
                    onChange={update}
                    value={draft.city}
                  />
                </label>
                <label>
                  State
                  <select name="state" onChange={update} value={draft.state}>
                    {nigerianStates.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </label>
              </div>
            </SettingsGroup>
          )}

          {section === "Preferences" && (
            <>
              <SettingsGroup
                description="Keep regional formatting consistent across products, reports and orders."
                title="Regional preferences"
              >
                <div className="form-grid">
                  <label>
                    Currency
                    <input aria-readonly="true" readOnly value="Nigerian Naira (₦ · NGN)" />
                    <small className="settings-field-help">
                      All site prices and payments are displayed in Naira.
                    </small>
                  </label>
                  <label>
                    Time zone
                    <select
                      name="timeZone"
                      onChange={update}
                      value={draft.timeZone}
                    >
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                    </select>
                  </label>
                  <label>
                    Date format
                    <select
                      name="dateFormat"
                      onChange={update}
                      value={draft.dateFormat}
                    >
                      <option value="DD MMM YYYY">24 Oct 2026</option>
                      <option value="DD/MM/YYYY">24/10/2026</option>
                    </select>
                  </label>
                </div>
              </SettingsGroup>
              <SettingsGroup
                description="Adjust how inventory and lists behave for your team."
                title="Workspace preferences"
              >
                <div className="form-grid">
                  <label>
                    Low-stock alert threshold
                    <input
                      max={999}
                      min={1}
                      name="lowStockThreshold"
                      onChange={update}
                      required
                      type="number"
                      value={draft.lowStockThreshold}
                    />
                  </label>
                  <label>
                    Rows per page
                    <select
                      name="pageSize"
                      onChange={update}
                      value={draft.pageSize}
                    >
                      <option value={10}>10 rows</option>
                      <option value={20}>20 rows</option>
                      <option value={50}>50 rows</option>
                    </select>
                  </label>
                </div>
              </SettingsGroup>
            </>
          )}

          {section === "Notifications" && (
            <SettingsGroup
              description="Choose which activity updates you want to receive."
              title="Notification preferences"
            >
              <NotificationToggle
                description="Receive important account and payment updates by email."
                label="Email notifications"
                name="emailNotifications"
                onChange={update}
                value={draft.emailNotifications}
              />
              <NotificationToggle
                description="Be notified when a new store order is placed."
                label="New order updates"
                name="orderNotifications"
                onChange={update}
                value={draft.orderNotifications}
              />
              <NotificationToggle
                description="Get an alert when any product reaches your stock threshold."
                label="Low-stock alerts"
                name="inventoryAlerts"
                onChange={update}
                value={draft.inventoryAlerts}
              />
              <NotificationToggle
                description="Receive a weekly summary of your store activity."
                label="Weekly report summary"
                name="weeklyReports"
                onChange={update}
                value={draft.weeklyReports}
              />
            </SettingsGroup>
          )}

          <div className="settings-actions">
            <button
              className="button button--outline"
              onClick={() => setDraftOverride(null)}
              type="button"
            >
              Discard changes
            </button>
            <button className="button button--primary" type="submit">
              Save settings
            </button>
          </div>
        </form>
      </div>

      <section aria-labelledby="reset-business-title" className="settings-danger-zone">
        <div>
          <p className="screen-kicker">DANGER ZONE</p>
          <h2 id="reset-business-title">Start a new business</h2>
          <p>
            Clear saved settings, products, plan preference, and store
            registration drafts from this browser. Laravel/MySQL dashboard
            records and data in other browsers are not changed.
          </p>
        </div>
        <button
          className="button button--danger"
          onClick={() => setConfirmReset(true)}
          type="button"
        >
          Clear browser business data
        </button>
      </section>

      {confirmReset && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmReset(false);
          }}
        >
          <section
            aria-labelledby="confirm-reset-title"
            aria-modal="true"
            className="editor-modal reset-confirm-modal"
            role="dialog"
          >
            <h2 id="confirm-reset-title">Start over with a new business?</h2>
            <p>
              This permanently removes this browser&apos;s saved settings,
              products, subscription choice, and registration draft. It does
              not erase Laravel/MySQL dashboard records.
            </p>
            <div className="modal-actions">
              <button
                className="button button--outline"
                onClick={() => setConfirmReset(false)}
                type="button"
              >
                Keep my data
              </button>
              <button
                className="button button--danger"
                onClick={resetBusiness}
                type="button"
              >
                Clear browser data
              </button>
            </div>
          </section>
        </div>
      )}
    </StoreShell>
  );
}

function SettingsGroup({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="settings-group">
      <div className="settings-group-heading">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {children}
    </section>
  );
}

function ColorField({
  label,
  name,
  onChange,
  value,
}: {
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: string;
}) {
  return (
    <label className="color-field">
      <span>{label}</span>
      <span className="color-input-wrap">
        <input
          aria-label={label}
          name={name}
          onChange={onChange}
          type="color"
          value={value}
        />
        <code>{value.toUpperCase()}</code>
      </span>
    </label>
  );
}

function NotificationToggle({
  description,
  label,
  name,
  onChange,
  value,
}: {
  description: string;
  label: string;
  name: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  value: boolean;
}) {
  return (
    <label className="notification-setting">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        checked={value}
        name={name}
        onChange={onChange}
        type="checkbox"
      />
    </label>
  );
}

function sectionIcon(section: Section) {
  const icons: Record<Section, string> = {
    Profile: "◉",
    Branding: "✦",
    Contact: "⌖",
    Preferences: "⚙",
    Notifications: "♧",
  };

  return icons[section];
}

const nigerianStates = [
  "Lagos",
  "Abuja",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

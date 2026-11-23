"use client";

import { useEffect, useState } from "react";

export type SiteSettings = {
  siteName: string;
  tagline: string;
  profileName: string;
  profileEmail: string;
  jobTitle: string;
  supportEmail: string;
  supportPhone: string;
  officeAddress: string;
  city: string;
  state: string;
  accentColor: string;
  highlightColor: string;
  timeZone: string;
  dateFormat: "DD MMM YYYY" | "DD/MM/YYYY";
  lowStockThreshold: number;
  pageSize: number;
  emailNotifications: boolean;
  orderNotifications: boolean;
  inventoryAlerts: boolean;
  weeklyReports: boolean;
  isStoreOpen: boolean;
};

export const SITE_SETTINGS_STORAGE_KEY = "lincoln-estate-site-settings";

const settingsEventName = "lincoln-estate-settings-updated";

export const defaultSiteSettings: SiteSettings = {
  siteName: "Lincoln Estate",
  tagline: "A better way to manage your estate",
  profileName: "Administrator",
  profileEmail: "admin@lincolnestate.ng",
  jobTitle: "Estate Manager",
  supportEmail: "support@lincolnestate.ng",
  supportPhone: "+234 802 555 0148",
  officeAddress: "14 Ahmadu Bello Way",
  city: "Victoria Island",
  state: "Lagos",
  accentColor: "#8B0000",
  highlightColor: "#D4AF37",
  timeZone: "Africa/Lagos",
  dateFormat: "DD MMM YYYY",
  lowStockThreshold: 10,
  pageSize: 10,
  emailNotifications: true,
  orderNotifications: true,
  inventoryAlerts: true,
  weeklyReports: false,
  isStoreOpen: true,
};

export const newBusinessSettings: SiteSettings = {
  ...defaultSiteSettings,
  siteName: "",
  tagline: "",
  profileName: "",
  profileEmail: "",
  jobTitle: "",
  supportEmail: "",
  supportPhone: "",
  officeAddress: "",
  city: "",
  state: "",
  isStoreOpen: false,
};

export function getOriginalSiteUrl() {
  const fallback = new URL("/", window.location.origin).toString();
  const referrer = document.referrer;

  if (!referrer) {
    return fallback;
  }

  try {
    const source = new URL(referrer);
    if (
      (source.protocol === "http:" || source.protocol === "https:") &&
      source.origin !== window.location.origin
    ) {
      return source.origin;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

function readSettings(): SiteSettings {
  const saved = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY);

  if (!saved) {
    return defaultSiteSettings;
  }

  const value: unknown = JSON.parse(saved);

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Saved site settings are invalid. Reset them to continue.");
  }

  const candidate = { ...defaultSiteSettings, ...value } as SiteSettings;
  const stringFields: (keyof SiteSettings)[] = [
    "siteName",
    "tagline",
    "profileName",
    "profileEmail",
    "jobTitle",
    "supportEmail",
    "supportPhone",
    "officeAddress",
    "city",
    "state",
    "accentColor",
    "highlightColor",
    "timeZone",
    "dateFormat",
  ];

  if (
    stringFields.some((field) => typeof candidate[field] !== "string") ||
    typeof candidate.lowStockThreshold !== "number" ||
    typeof candidate.pageSize !== "number" ||
    typeof candidate.emailNotifications !== "boolean" ||
    typeof candidate.orderNotifications !== "boolean" ||
    typeof candidate.inventoryAlerts !== "boolean" ||
    typeof candidate.weeklyReports !== "boolean" ||
    typeof candidate.isStoreOpen !== "boolean" ||
    !/^#[\da-f]{6}$/i.test(candidate.accentColor) ||
    !/^#[\da-f]{6}$/i.test(candidate.highlightColor)
  ) {
    throw new Error("Saved site settings are invalid. Reset them to continue.");
  }

  return candidate;
}

function applyBrandColors(settings: SiteSettings) {
  document.documentElement.style.setProperty("--green", settings.accentColor);
  document.documentElement.style.setProperty("--primary", settings.accentColor);
  document.documentElement.style.setProperty(
    "--green-bright",
    settings.highlightColor,
  );
  document.documentElement.style.setProperty("--accent", settings.highlightColor);
}

export function saveSiteSettings(settings: SiteSettings) {
  window.localStorage.setItem(
    SITE_SETTINGS_STORAGE_KEY,
    JSON.stringify(settings),
  );
  window.dispatchEvent(
    new CustomEvent<SiteSettings>(settingsEventName, { detail: settings }),
  );
}

export function resetSiteSettings() {
  window.localStorage.removeItem(SITE_SETTINGS_STORAGE_KEY);
  window.dispatchEvent(
    new CustomEvent<SiteSettings>(settingsEventName, {
      detail: defaultSiteSettings,
    }),
  );
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(defaultSiteSettings);
  const [storageError, setStorageError] = useState("");

  useEffect(() => {
    function updateSettings(next: SiteSettings) {
      setSettings(next);
      setStorageError("");
    }

    function reloadSettings() {
      try {
        updateSettings(readSettings());
      } catch (error) {
        setStorageError(
          error instanceof Error
            ? error.message
            : "Saved site settings could not be loaded.",
        );
      }
    }

    function handleStorageChange(event: StorageEvent) {
      if (event.key === SITE_SETTINGS_STORAGE_KEY || event.key === null) {
        reloadSettings();
      }
    }

    function handleSettingsChange(event: Event) {
      const settingsEvent = event as CustomEvent<SiteSettings>;
      updateSettings(settingsEvent.detail);
    }

    reloadSettings();
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(settingsEventName, handleSettingsChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(settingsEventName, handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    applyBrandColors(settings);
  }, [settings]);

  return { settings, storageError };
}

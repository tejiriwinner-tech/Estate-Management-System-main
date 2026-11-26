"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Crosshair, ExternalLink, MapPin, Navigation, Radio, Users } from "lucide-react";
import { parseCodedAlert } from "@/lib/emergencyCodes";

export interface MapEmergencyItem {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at: string;
}

export interface LiveTrackedUser {
  id: number;
  user_email: string;
  user_name: string;
  user_role: string;
  label: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  updated_at: string;
}

// Default Post Army Housing Estate coordinates (Abuja, Nigeria) when no device GPS lock is attached
const DEFAULT_ESTATE_LAT = 9.076479;
const DEFAULT_ESTATE_LNG = 7.398574;

export function SecurityDispatchMap({ alerts = [] }: { alerts?: MapEmergencyItem[] }) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [trackedUsers, setTrackedUsers] = useState<LiveTrackedUser[]>([]);

  const loadTracked = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/location/track", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setTrackedUsers(Array.isArray(json?.data) ? json.data : []);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void loadTracked();
    const t = setInterval(loadTracked, 5000);
    return () => clearInterval(t);
  }, [loadTracked]);

  const parsedAlerts = useMemo(
    () =>
      alerts.map((a) => ({
        raw: a,
        key: `alert-${a.source}-${a.id}`,
        parsed: parseCodedAlert(a.message),
      })),
    [alerts]
  );

  const selectedAlert =
    parsedAlerts.find((item) => item.key === selectedKey) ??
    (!selectedKey ? parsedAlerts.find((item) => item.parsed.gpsLat !== null) ?? parsedAlerts[0] ?? null : null);

  const selectedUser =
    trackedUsers.find((u) => `user-${u.id}` === selectedKey) ??
    (!selectedAlert && trackedUsers.length > 0 ? trackedUsers[0] : null);

  let lat = DEFAULT_ESTATE_LAT;
  let lng = DEFAULT_ESTATE_LNG;
  let hasDeviceGps = false;
  let accuracyText = "";
  let targetTitle = "Post Army Housing Estate";
  let targetSubtitle = "Live GPS tracking ready — users with device location ON appear here automatically";

  if (selectedAlert) {
    hasDeviceGps = selectedAlert.parsed.gpsLat !== null && selectedAlert.parsed.gpsLng !== null;
    if (hasDeviceGps) {
      lat = selectedAlert.parsed.gpsLat!;
      lng = selectedAlert.parsed.gpsLng!;
      accuracyText = selectedAlert.parsed.gpsAccuracy ? ` (±${selectedAlert.parsed.gpsAccuracy}m)` : "";
      targetTitle = `${selectedAlert.parsed.spec.label} • ${selectedAlert.parsed.sender} (${selectedAlert.parsed.role})`;
      targetSubtitle = `GPS Locked: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText} — ${selectedAlert.raw.location}`;
    } else {
      targetTitle = `${selectedAlert.parsed.spec.label} • ${selectedAlert.parsed.sender} (${selectedAlert.parsed.role})`;
      targetSubtitle = `Reported location: ${selectedAlert.raw.location}`;
    }
  } else if (selectedUser) {
    hasDeviceGps = true;
    lat = Number(selectedUser.latitude);
    lng = Number(selectedUser.longitude);
    accuracyText = selectedUser.accuracy ? ` (±${selectedUser.accuracy}m)` : "";
    targetTitle = `${selectedUser.user_name} (${selectedUser.user_role})`;
    targetSubtitle = `Live Device GPS: ${lat.toFixed(5)}, ${lng.toFixed(5)}${accuracyText}${
      selectedUser.label ? ` • ${selectedUser.label}` : ""
    }`;
  }

  const googleEmbedUrl = hasDeviceGps
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=17&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(
        selectedAlert?.raw.location || "Post Army Housing Estate Abuja"
      )}&z=16&output=embed`;

  const directionsUrl = hasDeviceGps
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        selectedAlert?.raw.location || "Post Army Housing Estate"
      )}`;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-[#B22222] text-white flex items-center justify-center shrink-0">
            <Crosshair className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-extrabold text-slate-900 truncate">
              Live Google Maps GPS Tracker
            </h3>
            <p className="text-[11px] text-slate-500 truncate">{targetSubtitle}</p>
          </div>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#991B1B] shadow-2xs shrink-0"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{hasDeviceGps ? "Follow GPS Route" : "Open in Google Maps"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {(parsedAlerts.length > 0 || trackedUsers.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-white">
          {parsedAlerts.map((item) => {
            const isSel = selectedAlert?.key === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedKey(item.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isSel
                    ? "bg-[#B22222] text-white border-[#B22222]"
                    : "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
                }`}
              >
                <Radio className="w-3 h-3 animate-pulse" />
                <span>{item.parsed.spec.shortLabel}</span>
                <span className="opacity-80">• {item.parsed.sender}</span>
              </button>
            );
          })}

          {trackedUsers.map((u) => {
            const uKey = `user-${u.id}`;
            const isSel = !selectedAlert && selectedUser?.id === u.id;
            return (
              <button
                key={uKey}
                type="button"
                onClick={() => setSelectedKey(uKey)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isSel
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <Users className="w-3 h-3" />
                <span>{u.user_name}</span>
                <span className="opacity-75">({u.user_role})</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="relative w-full h-80 bg-slate-100">
        <iframe
          title="Security Command Live Google Map"
          src={googleEmbedUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-slate-900 truncate">{targetTitle}</p>
            <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 text-[#B22222] shrink-0" />
              <span className="truncate">{targetSubtitle}</span>
            </p>
          </div>
          <span
            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold shrink-0 ${
              hasDeviceGps
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-amber-50 text-amber-800 border border-amber-200"
            }`}
          >
            {hasDeviceGps ? "LIVE GPS" : "ESTATE MAP"}
          </span>
        </div>
      </div>
    </div>
  );
}

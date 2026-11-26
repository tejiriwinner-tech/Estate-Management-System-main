"use client";

import React, { useMemo, useState } from "react";
import { Crosshair, ExternalLink, MapPin, Navigation, Radio } from "lucide-react";
import { parseCodedAlert } from "@/lib/emergencyCodes";

export interface MapEmergencyItem {
  id: number;
  source: string;
  message: string;
  location: string;
  status: string;
  created_at: string;
}

// Default Post Army Housing Estate coordinates (Abuja, Nigeria) when no device GPS lock is attached
const DEFAULT_ESTATE_LAT = 9.076479;
const DEFAULT_ESTATE_LNG = 7.398574;

export function SecurityDispatchMap({ alerts }: { alerts: MapEmergencyItem[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const parsedAlerts = useMemo(
    () =>
      alerts.map((a) => ({
        raw: a,
        key: `${a.source}-${a.id}`,
        parsed: parseCodedAlert(a.message),
      })),
    [alerts]
  );

  const active =
    parsedAlerts.find((item) => item.key === selectedId) ??
    parsedAlerts.find((item) => item.parsed.gpsLat !== null) ??
    parsedAlerts[0] ??
    null;

  const hasDeviceGps = active?.parsed.gpsLat !== null && active?.parsed.gpsLng !== null;
  const lat = hasDeviceGps && active ? active.parsed.gpsLat! : DEFAULT_ESTATE_LAT;
  const lng = hasDeviceGps && active ? active.parsed.gpsLng! : DEFAULT_ESTATE_LNG;

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.006}%2C${lat - 0.006}%2C${lng + 0.006}%2C${lat + 0.006}&layer=mapnik&marker=${lat}%2C${lng}`;
  const directionsUrl = hasDeviceGps
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        active?.raw.location || "Post Army Housing Estate"
      )}`;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200 bg-slate-50/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#B22222] text-white flex items-center justify-center shrink-0">
            <Crosshair className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">
              Live GPS Dispatch &amp; Pinpoint Map
            </h3>
            <p className="text-[11px] text-slate-500">
              {active
                ? hasDeviceGps
                  ? `Locked on ${active.parsed.sender} (${active.parsed.role}) — ${lat.toFixed(5)}, ${lng.toFixed(5)}${
                      active.parsed.gpsAccuracy ? ` (±${active.parsed.gpsAccuracy}m)` : ""
                    }`
                  : `Tracking reported location: ${active.raw.location} (device GPS not shared by sender)`
                : "Post Army Housing Estate perimeter map — incoming GPS alerts pin here automatically"}
            </p>
          </div>
        </div>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#B22222] px-3.5 py-2 text-xs font-extrabold text-white hover:bg-[#991B1B] shadow-2xs"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>{hasDeviceGps ? "Follow GPS Route" : "Open in Google Maps"}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {parsedAlerts.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 border-b border-slate-100 bg-white">
          <span className="text-[11px] font-bold text-slate-500">Pin Alert:</span>
          {parsedAlerts.map((item) => {
            const isSel = active?.key === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setSelectedId(item.key)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border transition-colors ${
                  isSel
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Radio className="w-3 h-3 text-red-500" />
                <span>{item.parsed.spec.shortLabel}</span>
                <span className="opacity-75">• {item.raw.location}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="relative w-full h-72 bg-slate-100">
        <iframe
          title="Security Command Live GPS Map"
          src={embedUrl}
          className="w-full h-full border-0"
          loading="lazy"
        />
        {active && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md rounded-xl bg-white/95 backdrop-blur-xs border border-slate-200 p-3 shadow-lg flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${active.parsed.spec.badgeClass}`}>
                  {active.parsed.spec.label}
                </span>
                <span className="text-xs font-extrabold text-slate-900 truncate">
                  {active.parsed.sender} ({active.parsed.role})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-1 truncate">
                <MapPin className="w-3 h-3 text-[#B22222] shrink-0" />
                <span className="truncate">{active.raw.location}</span>
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded-lg text-[10px] font-extrabold shrink-0 ${
                hasDeviceGps
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {hasDeviceGps ? "GPS LOCKED" : "ESTATE PIN"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

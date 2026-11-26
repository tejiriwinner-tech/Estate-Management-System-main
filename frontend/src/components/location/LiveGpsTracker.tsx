"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Crosshair, ExternalLink } from "lucide-react";

export const GPS_STORAGE_KEY = "pahe_live_gps";

export interface StoredGps {
  lat: number;
  lng: number;
  accuracy: number;
  updatedAt: number;
}

export function readStoredGps(): StoredGps | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GPS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.lat === "number" && typeof parsed?.lng === "number") {
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

interface LiveGpsTrackerProps {
  userEmail?: string;
  userName: string;
  userRole: string;
  label?: string;
  compact?: boolean;
}

export function LiveGpsTracker({
  userEmail,
  userName,
  userRole,
  label = "",
  compact = false,
}: LiveGpsTrackerProps) {
  const [status, setStatus] = useState<"locking" | "locked" | "off">("locking");
  const [coords, setCoords] = useState<StoredGps | null>(() => readStoredGps());
  const lastPushRef = useRef<number>(0);

  const pushToServer = useCallback(
    async (lat: number, lng: number, accuracy: number) => {
      const now = Date.now();
      if (now - lastPushRef.current < 15000) return;
      lastPushRef.current = now;
      const email = userEmail || `${userRole.toLowerCase().replace(/\s+/g, ".")}@pahe.local`;
      try {
        await fetch("/api/v1/location/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_email: email,
            user_name: userName,
            user_role: userRole,
            label,
            latitude: lat,
            longitude: lng,
            accuracy,
          }),
        });
      } catch {
        // ignore transient network errors
      }
    },
    [userEmail, userName, userRole, label]
  );

  const handlePosition = useCallback(
    (pos: GeolocationPosition) => {
      const next: StoredGps = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy || 0),
        updatedAt: Date.now(),
      };
      setCoords(next);
      setStatus("locked");
      try {
        sessionStorage.setItem(GPS_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      void pushToServer(next.lat, next.lng, next.accuracy);
    },
    [pushToServer]
  );

  const requestNow = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("off");
      return;
    }
    setStatus("locking");
    navigator.geolocation.getCurrentPosition(
      handlePosition,
      () => setStatus("off"),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 15000 }
    );
  }, [handlePosition]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("off");
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      handlePosition,
      () => setStatus("off"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 20000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, [handlePosition]);

  if (status === "locked" && coords) {
    return (
      <a
        href={`https://www.google.com/maps?q=${coords.lat},${coords.lng}`}
        target="_blank"
        rel="noopener noreferrer"
        title={`Live GPS Locked (${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} ±${coords.accuracy}m)`}
        className={
          compact
            ? "inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
            : "flex items-center justify-between gap-2 w-full rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition-colors"
        }
      >
        <span className="inline-flex items-center gap-1.5 truncate">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="truncate">GPS Live (±{coords.accuracy}m)</span>
        </span>
        <ExternalLink className="w-3 h-3 shrink-0" />
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={requestNow}
      className={
        compact
          ? "inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-200 transition-colors"
          : "flex items-center justify-between gap-2 w-full rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition-colors"
      }
    >
      <span className="inline-flex items-center gap-1.5 truncate">
        <Crosshair className="w-3.5 h-3.5 text-[#B22222] shrink-0" />
        <span>{status === "locking" ? "Locking GPS..." : "Enable Device GPS"}</span>
      </span>
    </button>
  );
}

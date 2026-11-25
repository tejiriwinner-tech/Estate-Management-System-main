"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  MapPin,
  Navigation,
  ShieldAlert,
  Save,
  CheckCircle2,
  Compass,
  Building2,
  Crosshair,
} from "lucide-react";
import { readSession } from "@/components/auth/session";

const SECTORS = [
  { name: "Army Estate Phase 1", x: 24, y: 34, w: 32, h: 28, color: "bg-red-50/90 border-[#B22222]/30" },
  { name: "Army Estate Phase 2", x: 60, y: 20, w: 34, h: 28, color: "bg-amber-50/90 border-[#C9A227]/40" },
  { name: "Army Estate Phase 3", x: 60, y: 52, w: 34, h: 28, color: "bg-slate-100/90 border-slate-300" },
  { name: "Army Estate Phase 4", x: 18, y: 66, w: 36, h: 24, color: "bg-emerald-50/80 border-emerald-300" },
  { name: "Army Estate Phase 5", x: 58, y: 82, w: 36, h: 14, color: "bg-blue-50/80 border-blue-300" },
];

const LANDMARKS = [
  { label: "Main Gate & ANPR", x: 8, y: 18, kind: "gate" },
  { label: "Security Command HQ", x: 14, y: 48, kind: "security" },
  { label: "Commercial Plaza", x: 48, y: 16, kind: "store" },
];

export default function DirectionPage() {
  const session = readSession();
  const [phase, setPhase] = useState("Army Estate Phase 1");
  const [unitNumber, setUnitNumber] = useState("Villa A-402");
  const [pinX, setPinX] = useState(34);
  const [pinY, setPinY] = useState(44);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [landmarkNotes, setLandmarkNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const loadPin = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/resident/location", {
        cache: "no-store",
        headers: session?.email ? { "X-User-Email": session.email } : {},
      });
      const json = await res.json();
      if (json?.data) {
        setPhase(json.data.phase || "Army Estate Phase 1");
        setUnitNumber(json.data.unit_number || "Villa A-402");
        setPinX(Number(json.data.pin_x ?? 34));
        setPinY(Number(json.data.pin_y ?? 44));
        setLat(json.data.latitude ?? null);
        setLng(json.data.longitude ?? null);
        setLandmarkNotes(json.data.landmark_notes || "");
      }
    } catch {
      // keep defaults
    }
  }, [session?.email]);

  useEffect(() => {
    void loadPin();
  }, [loadPin]);

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(4, Math.min(96, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(6, Math.min(94, ((e.clientY - rect.top) / rect.height) * 100));
    setPinX(Number(x.toFixed(1)));
    setPinY(Number(y.toFixed(1)));

    const matched = SECTORS.find(
      (s) => x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h
    );
    if (matched) setPhase(matched.name);
  };

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      setStatusMsg("Geolocation is not supported by this browser.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocating(false);
        setStatusMsg(
          `Live GPS locked: ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        );
      },
      () => {
        setLocating(false);
        setStatusMsg("Could not read GPS. Click directly on the estate map to drop your pin.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const saveLocation = async (dispatchEmergency: boolean) => {
    if (dispatchEmergency) setDispatching(true);
    else setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/v1/resident/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_email: session?.email || "resident@lincolnestate.ng",
          resident_name: session?.name || "Chinedu Resident",
          unit_number: unitNumber,
          phase,
          pin_x: pinX,
          pin_y: pinY,
          latitude: lat,
          longitude: lng,
          landmark_notes: landmarkNotes,
          dispatch_emergency: dispatchEmergency,
        }),
      });
      const json = await res.json();
      setStatusMsg(json.message || "Location updated.");
    } catch {
      setStatusMsg("Could not save location right now.");
    } finally {
      setSaving(false);
      setDispatching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B22222]">
            <Compass className="w-4 h-4" />
            <span>Emergency &amp; Visitor Navigation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">
            Estate Map &amp; Location Pinpointer
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Click anywhere on the estate map or lock your GPS coordinates so Security HQ and visitors can locate you immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleUseGps}
            disabled={locating}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition-colors"
          >
            <Crosshair className="w-4 h-4 text-[#B22222]" />
            <span>{locating ? "Locating GPS…" : "Pin My Live GPS"}</span>
          </button>

          <button
            type="button"
            onClick={() => void saveLocation(true)}
            disabled={dispatching}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B22222] hover:bg-[#8F1A1A] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{dispatching ? "Sending Pin…" : "Send Emergency Pin to Security"}</span>
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Estate Sector Map */}
        <div className="lg:col-span-8 rounded-2xl border border-gray-200/80 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Navigation className="w-4 h-4 text-[#B22222]" />
              <span>Interactive Lincoln Estate Layout (Click to Drop Pin)</span>
            </h2>
            <span className="font-mono text-[11px] font-bold text-slate-500">
              Pin: ({pinX}%, {pinY}%)
            </span>
          </div>

          <div
            onClick={handleMapClick}
            role="button"
            tabIndex={0}
            aria-label="Interactive estate map — click to set your pin"
            className="relative w-full h-[380px] rounded-2xl border border-slate-200 bg-[#F4F6F9] overflow-hidden cursor-crosshair select-none"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(148,163,184,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.15) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          >
            {/* Main Estate Boulevard Roads */}
            <div className="absolute inset-y-0 left-[55%] w-2.5 bg-slate-300/70" />
            <div className="absolute inset-x-0 top-[48%] h-2.5 bg-slate-300/70" />

            {/* Phases 1-5 */}
            {SECTORS.map((sec) => (
              <div
                key={sec.name}
                style={{
                  left: `${sec.x}%`,
                  top: `${sec.y}%`,
                  width: `${sec.w}%`,
                  height: `${sec.h}%`,
                }}
                className={`absolute rounded-xl border p-2.5 transition-all ${sec.color} ${
                  phase === sec.name ? "ring-2 ring-[#B22222]" : ""
                }`}
              >
                <span className="text-[11px] font-extrabold text-slate-800 block leading-tight">
                  {sec.name}
                </span>
              </div>
            ))}

            {/* Key Landmarks */}
            {LANDMARKS.map((lm) => (
              <div
                key={lm.label}
                style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-bold shadow-sm whitespace-nowrap"
              >
                {lm.label}
              </div>
            ))}

            {/* Active Resident Pin */}
            <div
              style={{ left: `${pinX}%`, top: `${pinY}%` }}
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none flex flex-col items-center z-10"
            >
              <div className="px-2 py-0.5 rounded-md bg-[#B22222] text-white text-[10px] font-extrabold shadow-md whitespace-nowrap mb-1">
                {unitNumber || "My Pin"}
              </div>
              <MapPin className="w-8 h-8 text-[#B22222] fill-[#FEF2F2] drop-shadow-md" />
            </div>
          </div>

          {lat !== null && lng !== null && (
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-4 py-2 text-[11px] font-bold text-slate-600 flex items-center justify-between border-b border-slate-200">
                <span>Live GPS Satellite Coordinates</span>
                <span className="font-mono text-[#B22222]">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>
              <iframe
                title="Resident GPS Location"
                className="w-full h-44 border-0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.004}%2C${lat - 0.004}%2C${lng + 0.004}%2C${lat + 0.004}&layer=mapnik&marker=${lat}%2C${lng}`}
              />
            </div>
          )}
        </div>

        {/* Location Details Form */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <h2 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#C9A227]" />
              <span>Pinned Residence Details</span>
            </h2>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Estate Zone / Phase</label>
              <select
                value={phase}
                onChange={(e) => setPhase(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-900"
              >
                {SECTORS.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">House / Villa Number</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Emergency Landmark / Gate Directions
              </label>
              <textarea
                rows={4}
                value={landmarkNotes}
                onChange={(e) => setLandmarkNotes(e.target.value)}
                placeholder="e.g. 2nd street off Palm Crescent, corner house with black gate..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs text-slate-900"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => void saveLocation(false)}
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4 text-[#C9A227]" />
            <span>{saving ? "Saving Pin…" : "Save Location Pin"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

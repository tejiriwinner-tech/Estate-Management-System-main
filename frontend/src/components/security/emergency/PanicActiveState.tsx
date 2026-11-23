"use client";

import { useState, useEffect } from "react";
import { Phone, X, MapPin, Truck } from "lucide-react";

interface Props {
  dispatchUnit: string;
  etaMins: number;
  residentLocation: string;
  alertTime: string;
  onCancel?: () => void;
  onCallSecurity?: () => void;
}

export default function PanicActiveState({
  dispatchUnit,
  etaMins,
  residentLocation,
  alertTime,
  onCancel,
  onCallSecurity,
}: Props) {
  const [elapsed, setElapsed] = useState(0); // seconds

  useEffect(() => {
    const t = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const secs = String(elapsed % 60).padStart(2, "0");

  const SAFETY = [
    { n: 1, title: "Stay where you are.",       body: "Security has your exact location."        },
    { n: 2, title: "Keep your phone visible.",   body: "Ensure your ringtone is on."              },
    { n: 3, title: "Do not engage.",             body: "Avoid contact with suspicious individuals."},
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-white">
      {/* Emergency header */}
      <div className="flex items-center justify-between bg-[--color-danger] text-white px-6 py-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          <span className="text-base font-black uppercase tracking-widest">Emergency Active</span>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wide opacity-80">Time Elapsed</p>
          <p className="text-xl font-black tabular-nums">{mins}:{secs}</p>
        </div>
      </div>

      {/* Map + dispatch */}
      <div className="flex flex-col lg:flex-row flex-1 gap-0">
        {/* Map placeholder */}
        <div className="relative flex-1 bg-gray-100 min-h-[300px] flex items-center justify-center">
          <div className="absolute inset-0 bg-[url('/images/map-placeholder.png')] bg-cover bg-center opacity-70" />
          <div className="relative z-10 flex flex-col gap-3">
            {/* Resident pin */}
            <div className="bg-white border border-[--color-border] rounded-xl px-4 py-3 shadow-lg flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[--color-danger] mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[--color-text]">Resident Location</p>
                <p className="text-xs text-[--color-text-muted]">{residentLocation}</p>
                <p className="text-[10px] text-[--color-danger] font-semibold mt-0.5">Alert triggered at {alertTime}</p>
              </div>
            </div>
            {/* Dispatch status */}
            <div className="bg-[--color-primary] text-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3">
              <Truck className="w-5 h-5 shrink-0" />
              <div className="flex-1">
                <p className="text-[10px] uppercase font-semibold opacity-80">Dispatch Status</p>
                <p className="text-sm font-bold">{dispatchUnit} En Route</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black">{etaMins}</p>
                <p className="text-[9px] uppercase font-semibold opacity-80">Mins</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-72 p-6 flex flex-col gap-5 border-l border-[--color-border]">
          {/* Safety instructions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[--color-danger]" />
              <h3 className="text-sm font-bold text-[--color-text]">Safety Instructions</h3>
            </div>
            <ol className="space-y-4">
              {SAFETY.map((s) => (
                <li key={s.n} className="flex gap-3">
                  <span className="w-6 h-6 rounded-full bg-[--color-primary] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {s.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[--color-text]">{s.title}</p>
                    <p className="text-xs text-[--color-text-muted] mt-0.5">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-3 mt-auto">
            <button
              onClick={onCallSecurity}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[--color-primary] text-white font-bold text-sm hover:bg-[--color-primary-dark] transition-colors"
            >
              <Phone className="w-4 h-4" /> Call Security Now
            </button>
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[--color-border] text-[--color-text-muted] font-semibold text-sm hover:bg-gray-50 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel Alert
            </button>
          </div>

          <p className="text-[10px] text-center text-[--color-text-subtle]">
            SYSTEM STATUS<br />Dispatch recorded. Live tracking active.
          </p>
        </div>
      </div>
    </div>
  );
}

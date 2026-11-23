"use client";

import { useState, useRef } from "react";
import { Phone } from "lucide-react";
import { cn } from "@/lib/security/utils";

interface Contact {
  name: string;
  number: string;
  icon?: "security" | "medical" | "fire" | "police";
}

interface PanicButtonProps {
  contacts: Contact[];
  onActivate?: () => void;
}

const ICON_MAP: Record<string, string> = {
  security: "🛡️",
  medical:  "🏥",
  fire:     "🔥",
  police:   "👮",
};

const HOLD_DURATION = 3000;

export default function PanicButton({ contacts, onActivate }: PanicButtonProps) {
  const [progress, setProgress] = useState(0);
  const [activated, setActivated] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  function startHold() {
    if (activated) return;
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        clearInterval(intervalRef.current!);
        setActivated(true);
        onActivate?.();
      }
    }, 50);
  }

  function endHold() {
    if (activated) return;
    clearInterval(intervalRef.current!);
    setProgress(0);
  }

  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {/* SOS button */}
      <div className="relative flex items-center justify-center">
        {/* Pulse rings */}
        {activated && (
          <>
            <span className="absolute w-56 h-56 rounded-full bg-[--color-danger] opacity-20 animate-ping" />
            <span className="absolute w-44 h-44 rounded-full bg-[--color-danger] opacity-30 animate-ping [animation-delay:0.3s]" />
          </>
        )}

        {/* Progress ring */}
        <svg className="absolute w-48 h-48 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#e5e7eb" strokeWidth="4" />
          <circle
            cx="50" cy="50" r="46"
            fill="none"
            stroke={activated ? "#16a34a" : "#dc2626"}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 46}`}
            strokeDashoffset={`${2 * Math.PI * 46 * (1 - progress / 100)}`}
            className="transition-all duration-50"
          />
        </svg>

        <button
          onMouseDown={startHold}
          onMouseUp={endHold}
          onMouseLeave={endHold}
          onTouchStart={startHold}
          onTouchEnd={endHold}
          className={cn(
            "w-40 h-40 rounded-full text-white font-black text-2xl tracking-widest select-none transition-all duration-200 shadow-lg active:scale-95",
            activated
              ? "bg-[--color-success] shadow-green-300"
              : "bg-[--color-danger] shadow-red-300"
          )}
        >
          {activated ? "SENT" : "SOS"}
        </button>
      </div>

      <p className="text-sm font-medium text-[--color-text-muted]">
        {activated ? "Emergency alert sent. Help is on the way." : "Tap to send Emergency Alert"}
      </p>

      {/* Contacts */}
      <div className="w-full max-w-sm">
        <p className="text-sm font-semibold text-[--color-text] mb-3">Emergency Contacts</p>
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.name} className="flex items-center justify-between p-3 rounded-xl border border-[--color-border] bg-white">
              <div className="flex items-center gap-3">
                <span className="text-lg">{ICON_MAP[c.icon ?? "security"] ?? "📞"}</span>
                <div>
                  <p className="text-sm font-semibold text-[--color-text]">{c.name}</p>
                  <p className="text-xs text-[--color-text-muted]">{c.number}</p>
                </div>
              </div>
              <a
                href={`tel:${c.number}`}
                className="p-2.5 rounded-xl bg-[--color-primary-light] text-[--color-primary] hover:bg-[--color-primary] hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

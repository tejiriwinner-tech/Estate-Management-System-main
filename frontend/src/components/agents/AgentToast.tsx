"use client";

import React, { useEffect } from "react";
import { CheckCircle2, X } from "lucide-react";

interface AgentToastProps {
  message: string | null;
  onDismiss: () => void;
}

export function AgentToast({ message, onDismiss }: AgentToastProps) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-[60] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl bg-dark px-4 py-3 text-white shadow-2xl md:bottom-6 md:left-auto md:right-6 md:translate-x-0"
    >
      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-400" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

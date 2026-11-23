"use client";

import { useCallback, useEffect, useState } from "react";
import { chatApi, type Summary } from "./api";

const EMPTY: Summary = { unread_messages: 0, unread_alerts: 0, unread_total: 0 };

/** Polls unread counts so the shell badges stay current. Fails quietly (badges just stay at 0). */
export function useChatSummary(intervalMs = 20000) {
  const [summary, setSummary] = useState<Summary>(EMPTY);
  const refresh = useCallback(async () => {
    try { setSummary(await chatApi.summary()); } catch { /* offline or signed out */ }
  }, []);
  useEffect(() => {
    refresh();
    const t = setInterval(refresh, intervalMs);
    return () => clearInterval(t);
  }, [refresh, intervalMs]);
  return { summary, refresh };
}

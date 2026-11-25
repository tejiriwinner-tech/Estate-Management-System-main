"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChatCenter } from "@/components/chat/ChatCenter";

function Inner() {
  const tab = useSearchParams().get("tab");
  const initial = tab === "alerts" ? "ALERTS" : tab === "meeting" ? "MEETING" : "CHAT";
  return <ChatCenter initialTab={initial} />;
}

export default function AgentMessagesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading messages…</div>}>
      <Inner />
    </Suspense>
  );
}

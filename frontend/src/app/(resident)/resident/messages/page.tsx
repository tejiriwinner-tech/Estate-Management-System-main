"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatCenter } from "@/components/chat/ChatCenter";

function Inner() {
  const tab = useSearchParams().get("tab");
  const initial = tab === "alerts" ? "ALERTS" : tab === "meeting" ? "MEETING" : "CHAT";
  return <ChatCenter initialTab={initial} />;
}

export default function MessagesPage() {
  return <Suspense fallback={null}><Inner /></Suspense>;
}

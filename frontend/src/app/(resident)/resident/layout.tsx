"use client";

import React from "react";
import { ResidentShell } from "@/components/resident/ResidentShell";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return <ResidentShell>{children}</ResidentShell>;
}

"use client";

import type { ComponentProps } from "react";

import EmergencyCommandCenter from "@/components/security/hq/EmergencyCommandCenter";
import ResidentAccessTable, { type ResidentRow } from "@/components/security/hq/ResidentAccessTable";
import IntelFeedCard, { type IntelItem } from "@/components/security/hq/IntelFeedCard";
import { SecurityError, useSecurityData } from "@/lib/security/useSecurity";

interface HqData {
  alerts: ComponentProps<typeof EmergencyCommandCenter>["alerts"];
  highPriorityCount: number;
  residents: ResidentRow[];
  intel: IntelItem[];
}

export default function SecurityHQPage() {
  const { data, error } = useSecurityData<HqData>("/security/hq", { alerts: [], highPriorityCount: 0, residents: [], intel: [] });
  return (
    <div className="flex flex-col gap-5">
      <SecurityError message={error} />
      {/* Top row: command center + right column */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left + Center — Emergency Command Center */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          <EmergencyCommandCenter alerts={data.alerts} highPriorityCount={data.highPriorityCount} />
          <ResidentAccessTable rows={data.residents} />
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          <IntelFeedCard items={data.intel} />
        </div>
      </div>
    </div>
  );
}

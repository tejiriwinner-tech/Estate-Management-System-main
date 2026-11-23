"use client";

import React from "react";
import { PipelineStageData } from "@/types/agent";

interface LeadPipelineCardProps {
  pipeline: PipelineStageData[];
}

export function LeadPipelineCard({ pipeline }: LeadPipelineCardProps) {
  const top = pipeline[0]?.count || 1;
  const won = pipeline[pipeline.length - 1]?.count ?? 0;
  const conversion = ((won / top) * 100).toFixed(1);

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between pb-5">
        <h2 className="text-base font-bold text-slate-800">Lead Pipeline</h2>
        <div className="text-right">
          <p className="text-lg font-extrabold text-emerald-600">{conversion}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Conversion
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between gap-4">
        {pipeline.map((stage) => {
          const pct = Math.round((stage.count / top) * 100);
          return (
            <div key={stage.stage}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-600">{stage.stage}</span>
                <span className="font-bold text-slate-800">{stage.count}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

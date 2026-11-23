"use client";

// KAN-36 estate map. Figma only has the "Direction" nav icon, no screen, so this lists the resident's own
// units and the estate sectors until the map artwork is designed.
import React from "react";
import { Card, StateMsg } from "@/components/resident/ui";
import { Property } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

export default function DirectionPage() {
  const { data, error, loading } = useResident<Property[]>("/properties");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-brand">Direction</h1>
      <Card className="p-6">
        <p className="text-muted">The estate map is not designed yet. Your registered units are listed below so security and visitors can be pointed to the right sector.</p>
        <StateMsg loading={loading} error={error} />
        {data && <ul className="mt-4 divide-y divide-row">{data.filter((p) => p.type === "house").map((p) => <li key={p.id} className="py-3"><span className="font-semibold">{p.name}</span> <span className="text-muted">{p.sector ?? "Sector not set"} · {p.property_number}</span></li>)}</ul>}
      </Card>
    </div>
  );
}

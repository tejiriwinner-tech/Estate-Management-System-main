"use client";

// Figma "user properties": Type, Name, Properties Number, Colour, Others + "Add Properties".
import Link from "next/link";
import React from "react";
import { Trash2 } from "lucide-react";
import { StateMsg, Table } from "@/components/resident/ui";
import { Property, send } from "@/lib/resident/api";
import { useResident } from "@/lib/resident/useResident";

export default function PropertiesTab() {
  const { data, error, loading, reload } = useResident<Property[]>("/properties");
  const remove = async (id: number) => { await send(`/properties/${id}`, "DELETE"); await reload(); };
  return (
    <div>
      <StateMsg loading={loading} error={error} />
      {data && <Table empty="No properties registered yet." head={["Type", "Name", "Properties Number", "Colour", "Others", ""]}
        rows={data.map((p) => [<span key="t" className="capitalize">{p.type}</span>, p.name, p.property_number, p.colour ?? "-", p.others ?? "-",
          <button key={p.id} aria-label={`Remove ${p.name}`} onClick={() => remove(p.id)} className="text-alert"><Trash2 className="h-5 w-5" /></button>])} />}
      <div className="mt-8 flex justify-end">
        <Link href="/resident/properties/register" className="rounded-md bg-brand px-5 py-2.5 text-base text-white hover:bg-brand-dark">Add Properties</Link>
      </div>
    </div>
  );
}

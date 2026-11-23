"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { ArrowLeft, BedDouble, Bath, MapPin } from "lucide-react";
import { ApiListing, fetchPublicListing, sendInquiry } from "@/services/listingsApi";
import { formatNaira } from "@/components/agent-portal/portalUtils";

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [l, setL] = useState<ApiListing | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [form, setForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    fetchPublicListing(id).then((r) => { setL(r.data); setState("ready"); }).catch(() => setState("missing"));
  }, [id]);

  if (state === "loading") return <p className="p-10 text-center text-sm text-slate-500">Loading…</p>;
  if (state === "missing" || !l) return (
    <div className="p-10 text-center">
      <p className="text-sm text-slate-600">This listing is not available.</p>
      <Link href="/" className="mt-3 inline-block text-sm font-bold text-primary">Back to listings</Link>
    </div>
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await sendInquiry(l.id, form); setSent("Thanks. The agent has been notified and will contact you."); }
    catch (err) { setSent(err instanceof Error ? err.message : "Could not send. Try again."); }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/" className="mb-4 inline-flex items-center gap-1 text-xs font-bold text-primary"><ArrowLeft className="h-4 w-4" />All listings</Link>
      <div className="h-64 rounded-2xl bg-gradient-to-br from-rose-200 to-red-300" />
      <div className="mt-6 grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <h1 className="text-2xl font-extrabold text-slate-800">{l.title}</h1>
          <p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-4 w-4" />{l.address}, {l.zone}</p>
          <p className="mt-4 text-2xl font-extrabold text-primary">{formatNaira(l.price)}{l.price_period === "per_year" && <span className="text-sm font-semibold text-slate-400"> / year</span>}</p>
          <p className="mt-3 flex gap-4 text-sm text-slate-600">
            <span>{l.property_type}</span>
            {l.beds != null && <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" />{l.beds} beds</span>}
            {l.baths != null && <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{l.baths} baths</span>}
          </p>
          {l.description && <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-slate-700">{l.description}</p>}
          {l.agent && <p className="mt-6 text-xs text-slate-500">Listed by {l.agent.name}</p>}
        </div>
        <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-100 bg-white p-5">
          <h2 className="text-sm font-bold text-slate-800">Interested?</h2>
          <input required aria-label="Your name" placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <input required aria-label="Phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <textarea aria-label="Message" placeholder="Message (optional)" rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm" />
          <button type="submit" className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-hover">Contact agent</button>
          {sent && <p role="status" className="text-xs font-medium text-slate-600">{sent}</p>}
        </form>
      </div>
    </main>
  );
}

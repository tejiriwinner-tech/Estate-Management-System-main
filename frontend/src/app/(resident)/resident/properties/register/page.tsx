"use client";

// Figma "register properties": Register New Property, step 1 (sector, unit number, unit type, ownership)
// and step 2 (supporting documents, max 5MB PDF/JPG), Save Draft / Submit Registration.
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { Card } from "@/components/resident/ui";
import { residentFetch } from "@/lib/resident/api";

const SECTORS = ["Sector A", "Sector B", "Sector C", "Sector D"];
const UNIT_TYPES = ["Villa", "Apartment", "Terrace", "Duplex", "Detached", "Car", "Other"];
const OWNERSHIP = ["Owner (Resident)", "Tenant", "Landlord"];

export default function RegisterProperty() {
  const router = useRouter();
  const file = useRef<HTMLInputElement>(null);
  const [f, setF] = useState({ sector: "", unit: "", unit_type: "", ownership_status: "" });
  const [doc, setDoc] = useState<File | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const field = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const x = e.target.files?.[0] ?? null;
    if (x && x.size > 5 * 1024 * 1024) { setErr("The file is larger than 5MB."); return; }
    setErr(null); setDoc(x);
  };

  const submit = async (draft: boolean) => {
    if (!f.unit || !f.unit_type) { setErr("Enter the unit number and choose a unit type."); return; }
    setBusy(true); setErr(null);
    const body = new FormData();
    body.set("type", f.unit_type === "Car" ? "car" : f.unit_type === "Other" ? "other" : "house");
    body.set("name", [f.sector, f.unit].filter(Boolean).join(" "));
    body.set("property_number", f.unit);
    if (f.sector) body.set("sector", f.sector);
    body.set("unit_type", f.unit_type);
    if (f.ownership_status) body.set("ownership_status", f.ownership_status);
    if (draft) body.set("draft", "1");
    if (doc) body.set("document", doc);
    try { await residentFetch("/properties", { method: "POST", body }); router.push("/resident/profile/properties"); }
    catch (e) { setErr(e instanceof Error ? e.message : "Could not submit."); setBusy(false); }
  };

  const cls = "w-full rounded-md border border-muted/50 bg-white px-3 py-2.5";
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/resident/profile/properties" className="inline-flex items-center gap-1 text-sm font-semibold text-brand"><ArrowLeft className="h-4 w-4" />My properties</Link>
      <Card className="space-y-5 p-6">
        <div><h1 className="text-2xl font-bold">Register New Property</h1><p className="text-xs font-semibold tracking-wide text-muted">STEP 1 OF 2</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Sector / Block<select value={f.sector} onChange={field("sector")} className={`${cls} mt-1`}><option value="">Select Sector...</option>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="text-sm font-semibold">Unit / House Number<input value={f.unit} onChange={field("unit")} placeholder="e.g. A-104" className={`${cls} mt-1`} /></label>
          <label className="text-sm font-semibold">Unit Type<select value={f.unit_type} onChange={field("unit_type")} className={`${cls} mt-1`}><option value="">Select Type...</option>{UNIT_TYPES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label className="text-sm font-semibold">Ownership Status<select value={f.ownership_status} onChange={field("ownership_status")} className={`${cls} mt-1`}><option value="">Select Status...</option>{OWNERSHIP.map((s) => <option key={s}>{s}</option>)}</select></label>
        </div>
        <div><h2 className="text-lg font-bold">Supporting Documents</h2><p className="text-xs font-semibold tracking-wide text-muted">STEP 2 OF 2</p></div>
        <p className="text-sm text-muted">Upload Title Deed, Tenancy Agreement, or NOC. Max size 5MB (PDF/JPG).</p>
        <button type="button" onClick={() => file.current?.click()} className="flex w-full flex-col items-center gap-2 rounded-lg border-2 border-dashed border-brand/50 bg-mint/40 py-8 text-sm text-brand">
          <UploadCloud className="h-8 w-8" />{doc ? doc.name : "Click to browse or drag files here"}
        </button>
        <input ref={file} type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={pick} className="sr-only" aria-label="Supporting document" />
        {err && <p role="alert" className="text-sm text-alert">{err}</p>}
        <div className="flex justify-end gap-3">
          <button disabled={busy} onClick={() => submit(true)} className="rounded-md border border-muted/60 px-5 py-2.5 disabled:opacity-60">Save Draft</button>
          <button disabled={busy} onClick={() => submit(false)} className="rounded-md bg-brand px-5 py-2.5 text-white hover:bg-brand-dark disabled:opacity-60">Submit Registration</button>
        </div>
      </Card>
    </div>
  );
}

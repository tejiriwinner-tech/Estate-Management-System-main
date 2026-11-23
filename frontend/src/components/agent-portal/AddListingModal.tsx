"use client";

import React, { useEffect, useState } from "react";
import { Home, X } from "lucide-react";
import { AGENT_ZONES } from "@/types/agent";
import { ListingKind, NewListingInput, PROPERTY_TYPES } from "@/types/agentPortal";
import { useOverlay } from "@/components/agents/useOverlay";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: NewListingInput) => void;
}

interface FormState {
  title: string;
  type: NewListingInput["type"];
  zone: string;
  address: string;
  beds: string;
  baths: string;
  rent: string;
  listingType: ListingKind;
}

const EMPTY: FormState = {
  title: "",
  type: "Apartment",
  zone: AGENT_ZONES[0],
  address: "",
  beds: "2",
  baths: "2",
  rent: "",
  listingType: "rent",
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.title.trim().length < 5) e.title = "Give the listing a short title, e.g. “3-Bed Terrace”.";
  if (f.address.trim().length < 5) e.address = "Enter the street or block address.";
  const beds = Number(f.beds);
  const baths = Number(f.baths);
  if (!Number.isInteger(beds) || beds < 1 || beds > 12) e.beds = "1–12 bedrooms.";
  if (!Number.isInteger(baths) || baths < 1 || baths > 12) e.baths = "1–12 bathrooms.";
  const rent = Number(f.rent.replace(/[,\s]/g, ""));
  if (!rent || rent < 100_000) e.rent = "Enter the yearly rent in naira (at least ₦100,000).";
  return e;
}

export function AddListingModal({ isOpen, onClose, onCreate }: AddListingModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  useOverlay(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY);
      setErrors({});
      setSubmitted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    onCreate({
      title: form.title.trim(),
      type: form.type,
      zone: form.zone,
      address: form.address.trim(),
      beds: Number(form.beds),
      baths: Number(form.baths),
      rentPerYear: Number(form.rent.replace(/[,\s]/g, "")),
      listingType: form.listingType,
    });
  };

  const cls = (k: keyof FormState) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 ${
      errors[k] ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100" : "border-slate-200 focus:border-primary/40 focus:ring-primary/10"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div role="dialog" aria-modal="true" aria-labelledby="add-listing-title" className="my-auto w-full max-w-[520px] rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 id="add-listing-title" className="text-base font-bold text-slate-800">Add a Listing</h3>
              <p className="text-xs font-medium text-slate-500">It is sent to the estate admin for approval before it appears on the public page.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4 p-5 sm:p-6">
          <Field label="Title" htmlFor="l-title" error={errors.title}>
            <input id="l-title" autoFocus value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. 3-Bed Terrace, Pool View" className={cls("title")} />
          </Field>

          <Field label="Listing for" htmlFor="l-kind">
            <select id="l-kind" value={form.listingType} onChange={(e) => update("listingType", e.target.value as ListingKind)} className={cls("listingType")}>
              <option value="rent">Rent</option>
              <option value="sale">Sale</option>
              <option value="other">Other property</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Property type" htmlFor="l-type">
              <select id="l-type" value={form.type} onChange={(e) => update("type", e.target.value as FormState["type"])} className={cls("type")}>
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Zone" htmlFor="l-zone">
              <select id="l-zone" value={form.zone} onChange={(e) => update("zone", e.target.value)} className={cls("zone")}>
                {AGENT_ZONES.map((z) => <option key={z}>{z}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Address" htmlFor="l-address" error={errors.address}>
            <input id="l-address" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="e.g. Block C12, Admiralty Way" className={cls("address")} />
          </Field>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Bedrooms" htmlFor="l-beds" error={errors.beds}>
              <input id="l-beds" type="number" min={1} max={12} value={form.beds} onChange={(e) => update("beds", e.target.value)} className={cls("beds")} />
            </Field>
            <Field label="Bathrooms" htmlFor="l-baths" error={errors.baths}>
              <input id="l-baths" type="number" min={1} max={12} value={form.baths} onChange={(e) => update("baths", e.target.value)} className={cls("baths")} />
            </Field>
            <Field label={form.listingType === "rent" ? "Rent / year (₦)" : "Price (₦)"} htmlFor="l-rent" error={errors.rent}>
              <input id="l-rent" inputMode="numeric" value={form.rent} onChange={(e) => update("rent", e.target.value)} placeholder="3,500,000" className={cls("rent")} />
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-dark hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover">
              Submit for approval
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

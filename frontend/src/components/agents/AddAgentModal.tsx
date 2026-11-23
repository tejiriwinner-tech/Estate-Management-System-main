"use client";

import React, { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import {
  AGENT_STATUSES,
  AGENT_ZONES,
  Agent,
  NewAgentInput,
} from "@/types/agent";
import { useOverlay } from "./useOverlay";

interface AddAgentModalProps {
  isOpen: boolean;
  existingAgents: Agent[];
  onClose: () => void;
  onCreate: (input: NewAgentInput) => void;
}

const EMPTY: NewAgentInput = {
  name: "",
  email: "",
  phone: "",
  zone: AGENT_ZONES[0],
  status: "Active",
};

type Errors = Partial<Record<keyof NewAgentInput, string>>;

function validate(form: NewAgentInput, existing: Agent[]): Errors {
  const errors: Errors = {};
  const name = form.name.trim();
  const email = form.email.trim().toLowerCase();
  const phoneDigits = form.phone.replace(/\D/g, "");

  if (name.split(/\s+/).filter(Boolean).length < 2)
    errors.name = "Enter the agent's first and last name.";

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = "Enter a valid email address.";
  else if (existing.some((a) => a.email.toLowerCase() === email))
    errors.email = "An agent with this email already exists.";

  if (phoneDigits.length < 10 || phoneDigits.length > 14)
    errors.phone = "Enter a valid phone number, e.g. +234 803 000 0000.";

  return errors;
}

export function AddAgentModal({
  isOpen,
  existingAgents,
  onClose,
  onCreate,
}: AddAgentModalProps) {
  const [form, setForm] = useState<NewAgentInput>(EMPTY);
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

  const update = <K extends keyof NewAgentInput>(key: K, value: NewAgentInput[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    if (submitted) setErrors(validate(next, existingAgents));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const found = validate(form, existingAgents);
    setErrors(found);
    if (Object.keys(found).length) return;
    onCreate({
      ...form,
      name: form.name.trim().replace(/\s+/g, " "),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
    });
  };

  const inputClass = (field: keyof NewAgentInput) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
        : "border-slate-200 focus:border-primary/40 focus:ring-primary/10"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-agent-title"
        className="relative w-full max-w-[480px] rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 id="add-agent-title" className="text-base font-bold text-slate-800">
                Add New Agent
              </h3>
              <p className="text-xs font-medium text-slate-500">
                They&apos;ll appear in the directory straight away.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4 p-5 sm:p-6">
          <Field label="Full name" error={errors.name} htmlFor="agent-name">
            <input
              id="agent-name"
              autoFocus
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Adaeze Okonkwo"
              className={inputClass("name")}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Email address" error={errors.email} htmlFor="agent-email">
              <input
                id="agent-email"
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="name@lincolnestate.ng"
                className={inputClass("email")}
              />
            </Field>
            <Field label="Phone number" error={errors.phone} htmlFor="agent-phone">
              <input
                id="agent-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+234 803 000 0000"
                className={inputClass("phone")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Assigned zone" htmlFor="agent-zone">
              <select
                id="agent-zone"
                value={form.zone}
                onChange={(e) => update("zone", e.target.value)}
                className={inputClass("zone")}
              >
                {AGENT_ZONES.map((z) => (
                  <option key={z}>{z}</option>
                ))}
              </select>
            </Field>
            <Field label="Status" htmlFor="agent-status">
              <select
                id="agent-status"
                value={form.status}
                onChange={(e) => update("status", e.target.value as NewAgentInput["status"])}
                className={inputClass("status")}
              >
                {AGENT_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-dark hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-primary/25 hover:bg-primary-hover transition-colors"
            >
              Add Agent
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-rose-500">{error}</p>}
    </div>
  );
}

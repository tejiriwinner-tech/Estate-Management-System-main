"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export type LoginRole = "Admin" | "Agent" | "User" | "Security" | "Store Owner";
export const LOGIN_ROLES: LoginRole[] = ["Admin", "Agent", "User", "Security", "Store Owner"];

interface RoleSelectProps {
  value: LoginRole | null;
  onChange: (role: LoginRole) => void;
  hasError?: boolean;
}

/** Custom "Login as" dropdown matching the design (list with brand-red divider lines). */
export function RoleSelect({ value, onChange, hasError }: RoleSelectProps) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openList = () => {
    setActive(Math.max(0, value ? LOGIN_ROLES.indexOf(value) : 0));
    setOpen(true);
  };

  const choose = (role: LoginRole) => {
    onChange(role);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      openList();
      return;
    }
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % LOGIN_ROLES.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + LOGIN_ROLES.length) % LOGIN_ROLES.length);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      choose(LOGIN_ROLES[active]);
    } else if (e.key === "Escape" || e.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label="Login as"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full items-center justify-between rounded-lg bg-primary-light px-3.5 py-2.5 text-left text-sm outline-none transition focus:ring-2 ${
          hasError ? "ring-2 ring-rose-300 focus:ring-rose-300" : "focus:ring-primary/30"
        }`}
      >
        <span className={value ? "font-medium text-slate-800" : "text-slate-500"}>
          {value ? `As ${value}` : "Login as"}
        </span>
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/70">
          <ChevronDown
            className={`h-4 w-4 text-slate-700 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Login as"
          className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg bg-white py-1 shadow-xl ring-1 ring-slate-200"
        >
          {LOGIN_ROLES.map((role, i) => {
            const selected = value === role;
            return (
              <li
                key={role}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(role);
                }}
                className={`mx-2 flex cursor-pointer items-center justify-between border-b border-primary/30 px-1.5 py-2 text-sm last:border-b-0 ${
                  active === i ? "bg-primary-light text-primary" : "text-slate-700"
                }`}
              >
                As {role}
                {selected && <Check className="h-4 w-4 text-primary" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

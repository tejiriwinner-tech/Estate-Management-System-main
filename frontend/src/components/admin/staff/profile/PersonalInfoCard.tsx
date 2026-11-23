"use client";

import React from "react";
import { User, Mail, Phone, MapPin } from "lucide-react";

interface PersonalInfoCardProps {
  email: string;
  phone: string;
  address: string;
}

export function PersonalInfoCard({ email, phone, address }: PersonalInfoCardProps) {
  const rows = [
    { icon: Mail, label: "Email Address", value: email, href: `mailto:${email}` },
    { icon: Phone, label: "Phone Number", value: phone, href: `tel:${phone.replace(/[^+\d]/g, "")}` },
    { icon: MapPin, label: "Home Address", value: address },
  ];

  return (
    <div className="bg-surface-card rounded-2xl p-5 sm:p-6 border border-border/80 shadow-card h-full">
      <h2 className="flex items-center gap-2 text-base sm:text-lg font-extrabold text-dark tracking-tight">
        <User className="w-5 h-5 text-accent" />
        Personal Info
      </h2>

      <ul className="mt-5 space-y-5">
        {rows.map(({ icon: Icon, label, value, href }) => (
          <li key={label} className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-accent-light text-accent flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-muted uppercase tracking-wider">{label}</div>
              {href ? (
                <a
                  href={href}
                  className="block text-sm font-semibold text-dark mt-0.5 break-all hover:text-primary transition-colors"
                >
                  {value}
                </a>
              ) : (
                <div className="text-sm font-semibold text-dark mt-0.5 leading-snug">{value}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

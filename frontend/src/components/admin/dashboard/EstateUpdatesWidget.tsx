"use client";

import React from "react";
import Image from "next/image";
import { Megaphone, Calendar, Shield } from "lucide-react";
import { EstateUpdate } from "@/types/admin/dashboard";

interface EstateUpdatesWidgetProps {
  update?: EstateUpdate;
}

export function EstateUpdatesWidget({ update }: EstateUpdatesWidgetProps) {
  const defaultUpdate: EstateUpdate = {
    id: "1",
    headlinePrefix: "Update From ",
    headlineHighlight: "Estate Admin",
    imageUrl:
      "https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Estate Security Patrol Vehicles",
    leadParagraph:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    bodyParagraph:
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
    publishedAt: "Today, 11:00 AM",
    author: "Chief Security Officer",
  };

  const currentUpdate = update || defaultUpdate;

  return (
    <div className="flex flex-col p-6 sm:p-8 bg-surface-card rounded-2xl border border-border/80 shadow-card">
      {/* Featured Photo Banner matching Figma */}
      <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden bg-surface-subtle mb-6 border border-border/50">
        <img
          src={currentUpdate.imageUrl}
          alt={currentUpdate.imageAlt}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-dark/80 backdrop-blur-md text-white text-[11px] font-semibold">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>Security & Operations</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Headline matching Figma style with brand colors */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-dark tracking-tight mb-4">
            {currentUpdate.headlinePrefix}
            <span className="text-primary">{currentUpdate.headlineHighlight}</span>
          </h2>

          {/* Lead Paragraph */}
          <p className="text-sm leading-relaxed text-muted font-medium mb-4">
            {currentUpdate.leadParagraph}
          </p>

          {/* Body Paragraph */}
          <p className="text-sm leading-relaxed text-muted/80">
            {currentUpdate.bodyParagraph}
          </p>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border/60 text-xs text-muted">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{currentUpdate.publishedAt}</span>
          </div>
          <span className="font-semibold text-dark">
            By {currentUpdate.author}
          </span>
        </div>
      </div>
    </div>
  );
}


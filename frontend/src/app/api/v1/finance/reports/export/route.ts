import { NextRequest, NextResponse } from "next/server";
import type { RecentExportItem } from "@/types/reportCenter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const format = (body.format || "PDF") as "PDF" | "XLSX" | "CSV";
  const titleSlug = String(body.templateId || body.title || "Lincoln_Estate_Report")
    .replace(/[^a-zA-Z0-9_-]+/g, "_");

  const item: RecentExportItem = {
    id: `exp-${Date.now()}`,
    fileName: `${titleSlug}_${new Date().toISOString().slice(0, 10)}.${format.toLowerCase()}`,
    generatedBy: "Estate Administrator",
    dateTime: "Just now",
    format,
    downloadUrl: "#",
  };

  return NextResponse.json({ data: { export: item }, export: item });
}

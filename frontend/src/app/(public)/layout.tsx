import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LincolnEstate - Homes and properties",
  description: "Houses and properties for rent or sale from agents within the estate.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}

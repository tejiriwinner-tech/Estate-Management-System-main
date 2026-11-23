import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LincolnEstate - Admin Dashboard",
  description: "Real Estate & Estate Community Management System",
  icons: {
    icon: "/icon.svg?v=lincoln",
    shortcut: "/icon.svg?v=lincoln",
    apple: "/icon.svg?v=lincoln",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-surface text-dark">
        {children}
      </body>
    </html>
  );
}


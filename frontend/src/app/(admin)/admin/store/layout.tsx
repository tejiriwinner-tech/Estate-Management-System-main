import "@/app/(store)/globals.css";
import React from "react";

export default function AdminStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="store-content-wrapper">{children}</div>;
}

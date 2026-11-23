import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LincolnEstate - Agent Dashboard",
  description: "Agent performance, listings, leads and viewings for Lincoln Estate.",
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Army Housing Estate - Agent Dashboard",
  description: "Agent performance, listings, leads and viewings for Post Army Housing Estate.",
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

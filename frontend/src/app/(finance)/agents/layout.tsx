import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post Army House Estate - Agent Dashboard",
  description: "Agent performance, listings, leads and viewings for Post Army House Estate.",
};

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

import type { Metadata } from "next";
import { AgentPortalShell } from "@/components/agent-portal/AgentPortalShell";

export const metadata: Metadata = {
  title: "LincolnEstate - Agent Portal",
  description: "Manage your rental listings, client requests, viewings and commission.",
};

export default function AgentPortalLayout({ children }: { children: React.ReactNode }) {
  return <AgentPortalShell>{children}</AgentPortalShell>;
}

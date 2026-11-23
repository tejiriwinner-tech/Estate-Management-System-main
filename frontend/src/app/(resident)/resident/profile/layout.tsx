import React from "react";
import { ProfileFrame } from "@/components/resident/ProfileFrame";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <ProfileFrame>{children}</ProfileFrame>;
}

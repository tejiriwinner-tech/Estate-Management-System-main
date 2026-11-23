import { redirect } from "next/navigation";

// The sidebar's "Reports" entry lands on the estate activity report.
export default function SecurityReportsIndex() {
  redirect("/security/reports/activity");
}

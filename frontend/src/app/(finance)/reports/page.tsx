import { redirect } from "next/navigation";

export default function FinanceReportsFallback() {
  redirect("/finance/reports");
}

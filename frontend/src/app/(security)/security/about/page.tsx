import { redirect } from "next/navigation";

// The About page is the same as Security Members — it's the About tab.
// Redirect there so both nav links land on the same page.
export default function AboutPage() {
  redirect("/security/members");
}

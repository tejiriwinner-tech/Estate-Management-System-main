import type { Metadata } from "next";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Post Army Housing Estate - Sign In",
  description: "Sign in to the Post Army Housing Estate management system.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={poppins.className}>{children}</div>;
}

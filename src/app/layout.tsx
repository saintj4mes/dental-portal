import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dentalpin — Clinic management",
  description: "A calm, connected workspace for Philippine dental clinics.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}

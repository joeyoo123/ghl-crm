import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GHL CRM - Sales & Marketing Platform",
  description: "All-in-one CRM for small businesses",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

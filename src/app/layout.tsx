import type { Metadata } from "next";
import "./globals.css";
import "./phase2.css";

export const metadata: Metadata = {
  title: "Mortusoft | Facility overview",
  description: "A considered operating system for modern mortuaries and funeral homes.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}


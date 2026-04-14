import type { Metadata } from "next";
import "./globals.css";
import LayoutShell from "./_components/LayoutShell";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "BOU CSE Study Pilot",
  description: "AI-Powered Academic Companion for Bangladesh Open University BSc in CSE Students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
        <Providers>
          <LayoutShell>{children}</LayoutShell>
        </Providers>
      </body>
    </html>
  );
}

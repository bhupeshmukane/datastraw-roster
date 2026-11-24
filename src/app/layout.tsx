=import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppNav } from "@/components/AppNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Datastraw Smart Roster Management System",
  description:
    "Workforce operations and deterministic monthly roster management across employees, D2C brands, pods, and operational processes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#F8FAFC] font-sans text-[#0F172A] antialiased selection:bg-[#4F46E5]/15 selection:text-[#3525CD]">
        <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
          <AppNav />
          <main className="min-w-0 p-4 sm:p-6">
            <div className="mx-auto max-w-7xl space-y-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
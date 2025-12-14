// src/app/(owner)/layout.tsx

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import DashboardSidebar from "@/components/DashboardSideBar";
import DashboardHeader from "@/components/DashboardHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-row-1 min-h-screen">
      <DashboardSidebar />

      <div className="flex-1 flex flex-col max-h-screen">
        <DashboardHeader />

        <div className="flex-1 w-full overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

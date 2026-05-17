import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WallDecor",
  description: "CRM для торговли стройматериалами — Қарағанды",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full">
      <body className={`${geist.className} h-full bg-background text-foreground antialiased`}>
        <div className="flex h-full overflow-hidden">
          <div className="hidden md:flex md:flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}

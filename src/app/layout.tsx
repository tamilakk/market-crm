import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Рынок CRM",
  description: "CRM для торговли строительными материалами",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${geist.className} bg-gray-50`}>
        <div className="flex h-screen overflow-hidden">
          <div className="hidden md:flex md:flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden">
            <MobileHeader />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}

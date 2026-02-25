import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import { LanguageProvider } from "../context/LanguageContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WALA Antigravity Media Studio",
  description: "AI-Powered Video & Media Production Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased selection:bg-blue-500/30`}>
        <LanguageProvider>
          <div className="flex h-screen bg-[#050508] text-[#f8fafc]">
            <Sidebar />
            <main className="flex-1 ml-64 p-8 overflow-y-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}

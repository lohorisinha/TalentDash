import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TalentDash — Salary transparency for Indian tech",
  description: "Stop guessing. See real base, bonus, and stock breakdowns across L3–L5 levels at top Indian tech companies.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="bg-[#f5f4f0] text-[#0f0f0f] antialiased">
        <nav className="bg-[#0f0f0f] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="font-bold text-lg tracking-tight text-white">
              Talent<span className="text-[#c8f135]">Dash</span>
            </a>
            <div className="flex items-center gap-1">
              <a href="/" className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/10">Salaries</a>
              <a href="/compare" className="text-sm font-medium text-white/60 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-white/10">Compare</a>
              <a href="/submit" className="text-sm font-bold text-[#0f0f0f] bg-[#c8f135] hover:bg-[#d4f550] transition-colors px-3 py-1.5 rounded-md">Submit salary</a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
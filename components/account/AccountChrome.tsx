"use client";

import Link from "next/link";
import { PublicBrandLogo } from "@/components/PublicBrandLogo";

export function AccountChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="border-b border-border bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tighter hover:opacity-90">
            <PublicBrandLogo imgClassName="h-8 w-auto max-w-[min(200px,55vw)] object-contain object-left sm:h-9" />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/" className="text-neutral-400 hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/tyres" className="text-neutral-400 hover:text-white transition-colors">
              Tyres
            </Link>
          </nav>
        </div>
      </header>
      <div className="flex-1">{children}</div>
    </div>
  );
}

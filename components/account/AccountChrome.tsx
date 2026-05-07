"use client";

import Link from "next/link";

export function AccountChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <header className="border-b border-border bg-black text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tighter hover:opacity-90">
            <span className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-black text-sm">
              N
            </span>
            <span className="hidden sm:inline">Matrix</span>
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

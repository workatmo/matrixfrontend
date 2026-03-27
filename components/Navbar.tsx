"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  const links = [
    { name: "Home", href: "/" },
    { name: "Tyres", href: "/tyres" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className="bg-black text-white border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 h-16 grid grid-cols-3 items-center">
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-black">
              N
            </div>
            <span className="hidden sm:inline-block">Matrix</span>
          </Link>
        </div>
        
        <div className="flex items-center justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-white",
                pathname === link.href ? "text-white" : "text-neutral-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Empty div to balance the grid for centering */}
        <div className="flex justify-end"></div>
      </div>
    </nav>
  );
}

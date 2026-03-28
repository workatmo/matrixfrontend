"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-black text-white border-t border-neutral-800 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tighter hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-black">
              N
            </div>
            <span>Matrix</span>
          </Link>
          <p className="text-sm text-neutral-400 max-w-xs mt-2 leading-relaxed">
            Find the perfect tyres for your vehicle in seconds. Premium quality, expertly fitted whenever and wherever you need them.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-white tracking-wide">Quick Links</h3>
          <Link href="/" className="text-sm text-neutral-400 hover:text-white transition-colors">Home</Link>
          <Link href="/tyres" className="text-sm text-neutral-400 hover:text-white transition-colors">Buy Tyres</Link>
          <Link href="/about-us" className="text-sm text-neutral-400 hover:text-white transition-colors">About Us</Link>
          <Link href="/contact-us" className="text-sm text-neutral-400 hover:text-white transition-colors">Contact Us</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-white tracking-wide">Services</h3>
          <Link href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Mobile Fitting</Link>
          <Link href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Branch Fitting</Link>
          <Link href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">Wheel Alignment</Link>
          <Link href="#" className="text-sm text-neutral-400 hover:text-white transition-colors">MOT Checks</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-white tracking-wide">Contact</h3>
          <p className="text-sm text-neutral-400">123 Tyre Street, Auto Zone</p>
          <p className="text-sm text-neutral-400">London, UK W1T 3RX</p>
          <a href="mailto:support@matrix.com" className="text-sm text-neutral-400 hover:text-white transition-colors mt-2">support@matrix.com</a>
          <a href="tel:08001234567" className="text-sm text-neutral-400 hover:text-white transition-colors">0800 123 4567</a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 mt-12 pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-neutral-500">
          &copy; {new Date().getFullYear()} Matrix Tyres. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Terms of Service</Link>
          <Link href="#" className="text-sm text-neutral-500 hover:text-white transition-colors">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

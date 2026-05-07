"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, MapPin, Menu, Phone, PhoneCall, Star, X } from "lucide-react";
import { getCustomerToken } from "@/lib/customer-api";
import { clientApiUrl } from "@/lib/public-api-url";
import { cn } from "@/lib/utils";
import { getCartCount, onCartUpdated } from "@/lib/cart";

export function Navbar() {
  const pathname = usePathname();
  const [customerSignedIn, setCustomerSignedIn] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandName, setBrandName] = useState("Matrix");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCustomerSignedIn(Boolean(getCustomerToken()));
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    setCartCount(getCartCount());
    return onCartUpdated(() => setCartCount(getCartCount()));
  }, []);

  useEffect(() => {
    const loadBrandSettings = async () => {
      try {
        const response = await fetch(clientApiUrl("/public/contact"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const source =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data
            : payload;

        const nextBrandName = source?.brand_name;
        const nextBrandLogoUrl = source?.logo_url;

        if (typeof nextBrandName === "string" && nextBrandName.trim() !== "") {
          setBrandName(nextBrandName.trim());
        }
        if (typeof nextBrandLogoUrl === "string" && nextBrandLogoUrl.trim() !== "") {
          setBrandLogoUrl(nextBrandLogoUrl.trim());
        }
      } catch {
        // Keep default brand label and icon when public settings are unavailable.
      }
    };

    void loadBrandSettings();
  }, []);

  if (!mounted) return null;
  if (pathname.startsWith("/admin")) return null;
  if (pathname.startsWith("/account")) return null;

  const links = [
    { name: "Home", href: "/" },
    { name: "Tyres", href: "/tyres" },
    { name: "TPMS Service", href: "/tpms-service" },
    { name: "Areas We Cover", href: "/areas-we-cover" },
    { name: "About Us", href: "/about-us" },
    { name: "Contact Us", href: "/contact-us" },
  ];

  return (
    <nav className="sticky top-0 z-40 border-b border-neutral-200 bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] text-neutral-900 backdrop-blur-xl">
      <div className="bg-[#0a1f44] text-white">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-sm sm:px-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5 font-semibold text-white">
                <Phone className="h-3.5 w-3.5" />
                24/7 Emergency Mobile Tyre Fitting
              </span>
              <span className="hidden items-center gap-1.5 font-semibold text-white/90 sm:inline-flex">
                <MapPin className="h-3.5 w-3.5" />
                We Come To You - 30-60 Min Response
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold text-white/90 sm:hidden">
                <MapPin className="h-3.5 w-3.5" />
                30-60 Min Response
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-white/95">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Fast Service
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-white/95">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                Available Now
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <div className="hidden items-center gap-1 text-amber-300 sm:flex">
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <Star className="h-3.5 w-3.5 fill-amber-300" />
                <span className="ml-1 text-xs font-semibold text-white">Rated by 200+ customers</span>
              </div>
              <a
                href="tel:+447721570075"
                className="inline-flex h-8 items-center rounded-full bg-emerald-500 px-4 text-xs font-extrabold uppercase tracking-wide text-white transition-colors hover:bg-emerald-400"
              >
                <PhoneCall className="mr-1.5 h-3.5 w-3.5" />
                Call Now
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-6 sm:px-10">
        <div className="flex items-center">
          <Link href="/" className="flex items-center py-1 text-xl font-bold tracking-tighter transition-opacity hover:opacity-80">
            {brandLogoUrl ? (
              <div className="h-16 w-28 overflow-hidden">
                <Image
                  src={brandLogoUrl}
                  alt={`${brandName} logo`}
                  className="h-full w-full scale-150 object-cover object-left"
                  width={112}
                  height={64}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white font-black text-black">
                N
              </div>
            )}
          </Link>
        </div>

        <div className="hidden items-center justify-center gap-6 md:flex">
          {links.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-neutral-900",
                pathname === link.href ? "text-neutral-900" : "text-neutral-600"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden items-center justify-end md:flex">
          <Link
            href="/cart"
            className="mr-3 inline-flex items-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
          >
            Cart
            {cartCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={customerSignedIn ? "/account" : "/account/login"}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {customerSignedIn ? "Dashboard" : "Login / Sign Up"}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-neutral-300 text-neutral-900 transition-colors hover:bg-neutral-100 md:hidden"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen ? (
        <div className="border-t border-neutral-200 bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-100 hover:text-neutral-900",
                  pathname === link.href ? "bg-neutral-100 text-neutral-900" : "text-neutral-700"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <Link
            href="/cart"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
            aria-label={cartCount > 0 ? `Cart (${cartCount} items)` : "Cart"}
          >
            Cart
            {cartCount > 0 ? (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href={customerSignedIn ? "/account" : "/account/login"}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {customerSignedIn ? "Dashboard" : "Login / Sign Up"}
          </Link>
        </div>
      ) : null}
    </nav>
  );
}

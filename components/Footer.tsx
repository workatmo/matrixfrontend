"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { clientApiUrl } from "@/lib/public-api-url";

export function Footer() {
  const pathname = usePathname();
  const shouldHideFooter =
    pathname.startsWith("/admin") || pathname.startsWith("/account");
  const [isMounted, setIsMounted] = useState(false);
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");
  const [brandName, setBrandName] = useState("Matrix");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadContactNumber = async () => {
      try {
        const response = await fetch(clientApiUrl("/public/contact"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = await response.json().catch(() => ({}));
        const value =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.contact_number
            : payload.contact_number;
        if (typeof value === "string" && value.trim() !== "") {
          setContactNumber(value.trim());
        }
        const emailValue =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.contact_email
            : payload.contact_email;
        if (typeof emailValue === "string" && emailValue.trim() !== "") {
          setContactEmail(emailValue.trim());
        }
        const addressValue =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.address
            : payload.address;
        if (typeof addressValue === "string" && addressValue.trim() !== "") {
          setAddress(addressValue.trim());
        }
        const brandNameValue =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.brand_name
            : payload.brand_name;
        if (typeof brandNameValue === "string" && brandNameValue.trim() !== "") {
          setBrandName(brandNameValue.trim());
        }
        const brandLogoUrlValue =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.logo_url
            : payload.logo_url;
        if (typeof brandLogoUrlValue === "string" && brandLogoUrlValue.trim() !== "") {
          setBrandLogoUrl(brandLogoUrlValue.trim());
        }
      } catch {
        // Keep defaults when public settings are unavailable.
      }
    };

    void loadContactNumber();
  }, []);

  const sanitizedContactNumber = useMemo(
    () => contactNumber.replace(/[^\d]/g, ""),
    [contactNumber]
  );
  const whatsappHref = sanitizedContactNumber
    ? `https://wa.me/${sanitizedContactNumber}`
    : undefined;
  const telHref = sanitizedContactNumber ? `tel:${sanitizedContactNumber}` : undefined;
  const emailHref = contactEmail ? `mailto:${contactEmail}` : undefined;

  if (!isMounted || shouldHideFooter) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-neutral-200 bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] py-14 text-black">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 sm:px-10 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tighter transition-opacity hover:opacity-80">
            {brandLogoUrl ? (
              <div className="h-12 w-20 overflow-hidden">
                <Image
                  src={brandLogoUrl}
                  alt={`${brandName} logo`}
                  className="h-full w-full scale-150 object-cover object-left"
                  width={80}
                  height={48}
                  unoptimized
                />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-300 bg-white font-black text-black">
                N
              </div>
            )}
          </Link>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-600">
            Find the perfect tyres for your vehicle in seconds. Premium quality, expertly fitted whenever and wherever you need them.
          </p>
          <p className="text-sm text-neutral-600">Chat with us instantly on WhatsApp.</p>
        </div>
        
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-black tracking-wide">Quick Links</h3>
          <Link href="/" className="text-sm text-neutral-600 hover:text-black transition-colors">Home</Link>
          <Link href="/tyres" className="text-sm text-neutral-600 hover:text-black transition-colors">Buy Tyres</Link>
          <Link href="/about-us" className="text-sm text-neutral-600 hover:text-black transition-colors">About Us</Link>
          <Link href="/contact-us" className="text-sm text-neutral-600 hover:text-black transition-colors">Contact Us</Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-black tracking-wide">Services</h3>
          <ul className="space-y-1 text-sm text-neutral-600">
            <li>Mobile Tyre Fitting</li>
            <li>TPMS Sensors Replacement</li>
            <li>24/7 Emergency Callout</li>
            <li>Wheel Balancing</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-black tracking-wide">Contact</h3>
          <p className="text-sm whitespace-pre-line text-neutral-600">
            {address || "Address unavailable"}
          </p>
          <p className="text-sm text-neutral-600">
            {contactNumber || "Contact number unavailable"}
          </p>
          {emailHref ? (
            <a href={emailHref} className="mt-2 text-sm text-neutral-600 transition-colors hover:text-black">
              {contactEmail}
            </a>
          ) : (
            <p className="mt-2 text-sm text-neutral-600">Email unavailable</p>
          )}
          {telHref ? (
            <a href={telHref} className="text-sm text-neutral-600 transition-colors hover:text-black">
              Call now: {contactNumber}
            </a>
          ) : null}
        </div>
      </div>
      
      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-neutral-200 px-6 pt-8 sm:px-10 md:flex-row">
        <p className="text-sm text-neutral-600">
          &copy; {new Date().getFullYear()} Matrix Tyres. All rights reserved.
        </p>
        <div className="flex gap-4">
          <Link href="/terms-of-service" className="text-sm text-neutral-600 hover:text-black transition-colors">Terms of Service</Link>
          <Link href="/privacy-policy" className="text-sm text-neutral-600 hover:text-black transition-colors">Privacy Policy</Link>
        </div>
      </div>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_14px_36px_-12px_rgba(37,211,102,0.8)] transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_45px_-14px_rgba(37,211,102,0.85)]"
        >
          <svg
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="h-7 w-7 fill-current"
          >
            <path d="M19.11 17.43c-.29-.15-1.69-.83-1.95-.92-.26-.1-.45-.14-.64.14-.18.29-.73.92-.9 1.11-.16.2-.33.22-.62.08-.29-.15-1.2-.44-2.29-1.42-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.33.43-.5.14-.16.19-.29.29-.48.1-.2.05-.37-.02-.52-.08-.15-.64-1.54-.87-2.11-.23-.55-.47-.48-.64-.49h-.55c-.19 0-.49.07-.75.37-.26.29-1 1-1 2.44 0 1.43 1.03 2.82 1.18 3.01.15.2 2.03 3.09 4.92 4.34.69.3 1.23.48 1.65.61.69.22 1.31.19 1.8.12.55-.08 1.69-.69 1.93-1.35.24-.66.24-1.23.17-1.35-.06-.12-.24-.2-.53-.34z" />
            <path d="M16 3C8.82 3 3 8.74 3 15.83c0 2.5.73 4.95 2.1 7.06L3 29l6.3-2.07A13.13 13.13 0 0 0 16 28.67c7.18 0 13-5.74 13-12.84C29 8.74 23.18 3 16 3zm0 23.45c-2.14 0-4.23-.57-6.06-1.64l-.43-.25-3.73 1.23 1.22-3.62-.28-.45a11.43 11.43 0 0 1-1.74-5.89c0-6.28 5.16-11.39 11.5-11.39S27.98 9.55 27.98 15.83c0 6.28-5.16 11.39-11.5 11.39z" />
          </svg>
        </a>
      ) : null}
    </footer>
  );
}

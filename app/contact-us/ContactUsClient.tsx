"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { clientApiUrl } from "@/lib/public-api-url";

export default function ContactUsClient() {
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    const loadContactDetails = async () => {
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

        const number = source?.contact_number;
        const email = source?.contact_email;
        const addr = source?.address;

        if (typeof number === "string" && number.trim()) setContactNumber(number.trim());
        if (typeof email === "string" && email.trim()) setContactEmail(email.trim());
        if (typeof addr === "string" && addr.trim()) setAddress(addr.trim());
      } catch {
        // Keep safe fallbacks when API is unavailable.
      }
    };

    void loadContactDetails();
  }, []);

  const sanitizedNumber = useMemo(
    () => contactNumber.replace(/[^\d]/g, ""),
    [contactNumber]
  );
  const telHref = sanitizedNumber ? `tel:${sanitizedNumber}` : undefined;

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 py-20 text-black sm:px-10 sm:py-24">
        <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
        <div className="relative mx-auto max-w-6xl text-center">
          <p className="mx-auto inline-flex rounded-full border border-[#3e66f3]/30 bg-[#3e66f3]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4eb8]">
            Support & Assistance
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-6xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-base text-neutral-700 sm:text-xl">
            We are here to help with tyre advice, booking support, and service queries.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Fast response", "Trusted support team", "Same day service"].map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-emerald-800 shadow-[0_8px_24px_-20px_rgba(16,185,129,0.95)]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-8 px-6 py-16 sm:px-10 lg:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">Get in Touch</h2>
          <p className="text-lg leading-relaxed text-neutral-700">
            Have a question about which tyre is right for you? Want an update on your order?
            We&apos;re always happy to assist. Fill out the form or use our contact details below.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 rounded-xl border border-[#dbe5ff] bg-white/95 p-4 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                <Phone className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-neutral-500">Call us</p>
                <p className="font-medium text-black">{contactNumber || "Contact number unavailable"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#dbe5ff] bg-white/95 p-4 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-neutral-500">Email</p>
                <p className="font-medium text-black">{contactEmail || "Email unavailable"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-[#dbe5ff] bg-white/95 p-4 shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-white">
                <MapPin className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm text-neutral-500">Address</p>
                <p className="whitespace-pre-line font-medium text-black">{address || "Address unavailable"}</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            {telHref ? (
              <a
                href={telHref}
                className="inline-flex items-center rounded-full bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_-16px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
              >
                Call Now
              </a>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-[#dbe5ff] bg-white/95 p-8 shadow-[0_30px_60px_-40px_rgba(52,88,219,0.6)]">
          <h3 className="text-2xl font-semibold tracking-tight text-black">Send us a message</h3>
          <p className="mt-2 text-sm text-neutral-500">
            We usually reply quickly during working hours.
          </p>
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-neutral-700">Full Name</label>
              <input
                type="text"
                id="name"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5a74dd]/40"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-neutral-700">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5a74dd]/40"
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label htmlFor="message" className="mb-1 block text-sm font-medium text-neutral-700">Message</label>
              <textarea
                id="message"
                rows={4}
                className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-black placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#5a74dd]/40"
                placeholder="How can we help you?"
              />
            </div>
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-4 py-3 text-base font-semibold text-white shadow-[0_18px_35px_-18px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
            >
              Send Message
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

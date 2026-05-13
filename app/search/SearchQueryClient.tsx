"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import SearchResultsClient from "./[registration]/search-results-client";
import { clientApiUrl } from "@/lib/public-api-url";
import { formatRegistrationSlug } from "@/lib/seo";

type LookupPayload = Record<string, unknown> | null;

export default function SearchQueryClient() {
  const searchParams = useSearchParams();
  const rawRegistration = searchParams.get("registration") ?? "";

  const registration = useMemo(() => {
    const trimmed = rawRegistration.trim();
    if (!trimmed) return "";
    return formatRegistrationSlug(trimmed);
  }, [rawRegistration]);

  const [payload, setPayload] = useState<LookupPayload>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!registration) {
        setPayload(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(clientApiUrl("/vehicle/lookup"), {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ registration_number: registration }),
          cache: "no-store",
        });

        const json = await res.json().catch(() => null);
        if (cancelled) return;
        setPayload(res.ok ? json : null);
      } catch {
        if (cancelled) return;
        setPayload(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [registration]);

  if (!registration) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#fcfcff] to-neutral-50 px-6 py-10 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d64c8]">Tyre Search</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">Enter a registration</h1>
          <p className="mt-3 text-sm text-neutral-700">
            Use the search box on the homepage, or open this page with{" "}
            <span className="font-semibold">?registration=AB12CDE</span>.
          </p>
        </div>
      </main>
    );
  }

  if (loading && !payload) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#fcfcff] to-neutral-50 px-6 py-10 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border border-neutral-200 bg-white/80 p-7 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d64c8]">Tyre Search</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Searching {registration.toUpperCase()}…
          </h1>
          <p className="mt-3 text-sm text-neutral-700">Fetching vehicle details and tyre options.</p>
        </div>
      </main>
    );
  }

  return <SearchResultsClient registration={registration} initialPayload={payload} />;
}


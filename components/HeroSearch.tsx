"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car, Gauge, LoaderCircle, MoveRight, Ruler, ScanSearch, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { clientApiUrl } from "@/lib/public-api-url";
import { formatRegistrationSlug } from "@/lib/seo";

interface HeroSearchProps {
  onSearch: (payload: { registrationNumber?: string; tyreSize?: string; speedRating?: string }) => void;
  isLoading: boolean;
}

export function HeroSearch({ onSearch, isLoading }: HeroSearchProps) {
  const router = useRouter();
  const [regInput, setRegInput] = useState("");
  const [debouncedRegInput, setDebouncedRegInput] = useState("");
  const [width, setWidth] = useState("");
  const [ratio, setRatio] = useState("");
  const [rim, setRim] = useState("");
  const [widths, setWidths] = useState<string[]>([]);
  const [ratios, setRatios] = useState<string[]>([]);
  const [rims, setRims] = useState<string[]>([]);
  const [speedRating, setSpeedRating] = useState("");
  const [speedRatings, setSpeedRatings] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and remove spaces
    setRegInput(e.target.value.toUpperCase().replace(/\s/g, ""));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debouncedRegInput.trim()) {
      const normalized = formatRegistrationSlug(debouncedRegInput.trim());
      router.push(`/search?registration=${encodeURIComponent(normalized)}`);
    }
  };

  const handleTyreSizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (width && ratio && rim) {
      // Backend size matching is based on width/profile/rim label.
      const baseTyreSize = `${width}/${ratio} R${rim}`.toUpperCase();
      onSearch({ tyreSize: baseTyreSize, ...(speedRating ? { speedRating } : {}) });
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedRegInput(regInput);
    }, 300);
    return () => window.clearTimeout(timeoutId);
  }, [regInput]);

  useEffect(() => {
    const loadOptions = async () => {
      const candidateUrls = [
        clientApiUrl("/public/tyre-search-options"),
        clientApiUrl("/vehicle/search-options"),
      ];

      try {
        for (const url of candidateUrls) {
          const response = await fetch(url, {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            cache: "no-store",
          });
          const payload = await response.json().catch(() => ({}));
          if (!response.ok) {
            continue;
          }

          const raw =
            payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
              ? payload.data
              : payload;

          setWidths(Array.isArray(raw.widths) ? raw.widths.map(String) : []);
          setRatios(Array.isArray(raw.ratios) ? raw.ratios.map(String) : []);
          setRims(Array.isArray(raw.rims) ? raw.rims.map(String) : []);
          setSpeedRatings(Array.isArray(raw.speed_ratings) ? raw.speed_ratings.map(String) : []);
          return;
        }
      } catch {
        // Keep empty dropdown data if backend options are unavailable.
      }
    };

    loadOptions();
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 pb-20 pt-12 text-black sm:px-10 sm:pb-24 sm:pt-14">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
      <div className="relative mx-auto max-w-6xl space-y-10">
        <div className="space-y-6 text-center">
          <p className="mx-auto inline-flex rounded-full border border-[#3e66f3]/30 bg-[#3e66f3]/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#2f4eb8]">
            Premium Tyre Booking
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Find the{" "}
            <span className="bg-gradient-to-r from-[#3458db] via-[#7646f6] to-[#d946ef] bg-clip-text text-transparent">
              Perfect Tyres
            </span>{" "}
            for Your Car
          </h1>
          <p className="mx-auto max-w-3xl text-base text-neutral-700 sm:text-xl">
            Enter your registration number and get instant tyre recommendations, pricing, and booking in seconds.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto flex w-full max-w-4xl flex-col items-stretch gap-4 rounded-2xl border border-white/70 bg-white/90 p-3 shadow-[0_20px_50px_-30px_rgba(52,88,219,0.55)] backdrop-blur-sm sm:flex-row sm:items-center"
        >
          <div className="relative w-full">
            <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
              <Car className="h-5 w-5 text-neutral-400" />
            </div>
            <Input
              type="text"
              placeholder="Enter Registration (e.g., AB12CDE)"
              className="h-14 w-full rounded-xl border border-[#cad8ff] bg-white pl-11 pr-4 text-base uppercase text-black placeholder:text-neutral-500 focus-visible:ring-[#5a74dd]/40"
              value={regInput}
              onChange={handleInputChange}
              disabled={isLoading}
              maxLength={10}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-8 text-base font-bold text-white shadow-[0_16px_35px_-18px_rgba(53,88,223,0.95)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6] sm:w-auto"
            disabled={!debouncedRegInput.trim() || isLoading}
          >
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-5 w-5 animate-spin" />
                Searching...
              </>
            ) : (
              <>
                Find My Tyres
                <MoveRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-white/80 bg-white/92 p-6 shadow-[0_32px_80px_-55px_rgba(53,88,223,0.65)] backdrop-blur-sm">
          <h2 className="text-left text-2xl font-semibold tracking-tight text-black">
            Search by Tyre Size
          </h2>
          <p className="mt-2 text-sm text-neutral-600">
            Prefer searching manually? Choose your tyre dimensions and see matching options instantly.
          </p>
          <form
            onSubmit={handleTyreSizeSubmit}
            className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5"
          >
            <div className="rounded-xl border border-[#d6e0ff] bg-white px-3">
              <label className="flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-wide text-[#4760b9]">
                <Ruler className="h-4 w-4" /> Width
              </label>
              <select
                className="h-10 w-full bg-transparent text-sm text-black outline-none"
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                disabled={isLoading}
              >
                <option value="" className="bg-white">
                  Select Width
                </option>
                {widths.map((value) => (
                  <option key={value} value={value} className="bg-white">
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-[#d6e0ff] bg-white px-3">
              <label className="flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-wide text-[#4760b9]">
                <Gauge className="h-4 w-4" /> Ratio
              </label>
              <select
                className="h-10 w-full bg-transparent text-sm text-black outline-none"
                value={ratio}
                onChange={(e) => setRatio(e.target.value)}
                disabled={isLoading}
              >
                <option value="" className="bg-white">
                  Select Ratio
                </option>
                {ratios.map((value) => (
                  <option key={value} value={value} className="bg-white">
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-[#d6e0ff] bg-white px-3">
              <label className="flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-wide text-[#4760b9]">
                <ScanSearch className="h-4 w-4" /> Rim
              </label>
              <select
                className="h-10 w-full bg-transparent text-sm text-black outline-none"
                value={rim}
                onChange={(e) => setRim(e.target.value)}
                disabled={isLoading}
              >
                <option value="" className="bg-white">
                  Select Rim
                </option>
                {rims.map((value) => (
                  <option key={value} value={value} className="bg-white">
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="rounded-xl border border-[#d6e0ff] bg-white px-3">
              <label className="flex items-center gap-2 pt-2 text-xs font-medium uppercase tracking-wide text-[#4760b9]">
                <Gauge className="h-4 w-4" /> Speed Rating
              </label>
              <select
                className="h-10 w-full bg-transparent text-sm text-black outline-none"
                value={speedRating}
                onChange={(e) => setSpeedRating(e.target.value)}
                disabled={isLoading}
              >
                <option value="" className="bg-white">
                  Any Speed
                </option>
                {speedRatings.map((value) => (
                  <option key={value} value={value} className="bg-white">
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <Button
              type="submit"
              className="h-14 rounded-xl bg-gradient-to-r from-[#3558df] to-[#8f46f8] text-base font-semibold text-white hover:from-[#2a46b7] hover:to-[#7733e6]"
              disabled={!width || !ratio || !rim || isLoading}
            >
              {isLoading ? "Searching..." : "Search Size"}
            </Button>
          </form>
        </div>

        <div className="space-y-2">
          <p className="text-center text-sm font-medium text-neutral-600">
            Trusted by 1,000+ drivers
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {["Fast Fitting", "Best Prices", "Same Day Service"].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50/90 px-3 py-1.5 text-emerald-800 shadow-[0_8px_24px_-20px_rgba(16,185,129,0.95)]"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

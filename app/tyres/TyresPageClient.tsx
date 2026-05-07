"use client";

import { useEffect, useMemo, useState } from "react";
import { getPublicTyres, type PublicTyreListResult } from "@/lib/api";
import { clientApiUrl } from "@/lib/public-api-url";
import { TyreGrid } from "@/components/TyreGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

export default function TyresPageClient() {
  const [data, setData] = useState<PublicTyreListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("all");
  const [contactNumber, setContactNumber] = useState("");

  useEffect(() => {
    async function loadTyres() {
      setIsLoading(true);
      try {
        const result = await getPublicTyres();
        setData(result);
      } catch (error) {
        toast.error("Failed to load tyres. Please try again later.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTyres();
  }, []);

  useEffect(() => {
    async function loadContactNumber() {
      try {
        const response = await fetch(clientApiUrl("/public/contact"), {
          method: "GET",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!response.ok) return;

        const payload = await response.json().catch(() => ({}));
        const value =
          payload && typeof payload === "object" && payload.data && typeof payload.data === "object"
            ? payload.data.contact_number
            : payload.contact_number;
        if (typeof value === "string" && value.trim() !== "") {
          setContactNumber(value.trim());
        }
      } catch {
        // Leave contact number empty if endpoint is unavailable.
      }
    }

    void loadContactNumber();
  }, []);

  // Map the backend typed data to match what the frontend TyreGrid component expects
  const formattedTyres =
    data?.data.map((tyre) => ({
      id: tyre.id.toString(),
      brand: tyre.brand?.name || "Unknown Brand",
      model: tyre.model,
      size: tyre.size?.label || "Unknown Size",
      season: tyre.season?.name || "All-Season",
      fuelRating: tyre.fuel_efficiency?.rating || "N/A",
      price: Number.isFinite(parseFloat(tyre.price)) ? parseFloat(tyre.price) : null,
      image: tyre.image_url || "default",
    })) || [];

  const seasonOptions = useMemo(() => {
    const values = Array.from(new Set(formattedTyres.map((tyre) => tyre.season)));
    return values.sort((a, b) => a.localeCompare(b));
  }, [formattedTyres]);

  const filteredTyres = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return formattedTyres.filter((tyre) => {
      const matchesSearch =
        !query ||
        tyre.brand.toLowerCase().includes(query) ||
        tyre.model.toLowerCase().includes(query) ||
        tyre.size.toLowerCase().includes(query);
      const matchesSeason =
        selectedSeason === "all" || tyre.season.toLowerCase() === selectedSeason.toLowerCase();
      return matchesSearch && matchesSeason;
    });
  }, [formattedTyres, searchTerm, selectedSeason]);

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <div className="w-full flex-1">
        <section className="relative overflow-hidden border-b border-[#dbe5ff] bg-gradient-to-br from-[#fff8fb] via-[#fdf2ff] to-[#fff6ef] px-6 py-16 text-black sm:px-10">
          <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-[#f9a8d4]/25 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-24 h-72 w-72 rounded-full bg-[#fda4af]/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-[#86efac]/20 blur-3xl" />
          <div className="relative mx-auto max-w-7xl">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Premium Tyres for Every Journey
            </h1>
            <p className="mt-4 max-w-3xl text-base text-neutral-700 sm:text-lg">
              Compare trusted brands, sizes, and seasonal options with transparent pricing and instant booking.
            </p>
          </div>
        </section>

        {isLoading ? (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-20 space-y-8">
            <div className="flex justify-between items-end mb-8 border-b border-transparent">
              <div>
                <Skeleton className="h-10 w-64 mb-2 rounded-lg" />
                <Skeleton className="h-5 w-80 rounded-lg" />
              </div>
              <Skeleton className="h-5 w-32 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              <Skeleton className="h-[380px] w-full rounded-xl" />
              <Skeleton className="h-[380px] w-full rounded-xl" />
              <Skeleton className="h-[380px] w-full rounded-xl hidden sm:block" />
              <Skeleton className="h-[380px] w-full rounded-xl hidden lg:block" />
            </div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <section className="border-b border-[#dbe5ff] bg-[#f8faff] px-6 py-6 sm:px-10">
              <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by brand, model, or size"
                    className="h-11 w-full rounded-xl border border-[#cad8ff] bg-white pl-10 pr-4 text-sm text-black outline-none transition focus:border-[#5a74dd] focus:ring-2 focus:ring-[#5a74dd]/20"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-neutral-500" />
                  <select
                    value={selectedSeason}
                    onChange={(event) => setSelectedSeason(event.target.value)}
                    className="h-11 rounded-xl border border-[#cad8ff] bg-white px-3 text-sm text-black outline-none transition focus:border-[#5a74dd] focus:ring-2 focus:ring-[#5a74dd]/20"
                  >
                    <option value="all">All Seasons</option>
                    {seasonOptions.map((season) => (
                      <option key={season} value={season}>
                        {season}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <TyreGrid
              tyres={filteredTyres}
              vehicle={{
                registration: "TYRE LIST",
                make: "General",
                model: "Selection",
                year: new Date().getFullYear(),
              }}
              contactNumber={contactNumber}
            />
          </>
        ) : (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-20">
            <div className="mt-8 flex flex-col items-center justify-center space-y-6 rounded-2xl border border-[#dbe5ff] bg-white/95 py-20 text-center shadow-[0_20px_45px_-35px_rgba(52,88,219,0.55)]">
              <Search className="h-16 w-16 text-neutral-300" />
              <h2 className="text-2xl font-bold text-black">No Tyres Found</h2>
              <p className="text-neutral-500 max-w-md">
                We couldn&apos;t find any tyres matching your criteria at this moment. Please check back later or contact support.
              </p>
              <Link
                href="/"
                className="mt-4 rounded-lg bg-gradient-to-r from-[#3558df] to-[#8f46f8] px-8 py-3 font-medium text-white shadow-[0_16px_30px_-16px_rgba(53,88,223,0.85)] transition-all duration-300 hover:-translate-y-0.5 hover:from-[#2a46b7] hover:to-[#7733e6]"
              >
                Search by Registration Instead
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}


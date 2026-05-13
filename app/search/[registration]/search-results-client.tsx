"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { VehicleCard } from "@/components/VehicleCard";
import { TyreGrid } from "@/components/TyreGrid";

type SearchResultsClientProps = {
  registration: string;
  initialPayload: Record<string, unknown> | null;
};

export default function SearchResultsClient({
  registration,
  initialPayload,
}: SearchResultsClientProps) {
  const payload =
    initialPayload &&
    typeof initialPayload === "object" &&
    initialPayload.data &&
    typeof initialPayload.data === "object"
      ? (initialPayload.data as Record<string, unknown>)
      : initialPayload;

  const vehicleData = (payload?.vehicle as Record<string, unknown>) ?? null;
  const tyreData = (payload?.tyre as Record<string, unknown>) ?? null;
  const tyreItems = Array.isArray(payload?.tyres) ? payload.tyres : [];
  const contactNumber = typeof payload?.contact_number === "string" ? payload.contact_number : "";
  const hasLikelySizes = Array.isArray(tyreData?.likely_sizes) && tyreData.likely_sizes.length > 0;
  const tyreError = (payload?.tyre_error as Record<string, unknown>) ?? null;
  const tyreErrorMessage =
    tyreError && typeof tyreError.error === "string"
      ? tyreError.error
      : tyreError && typeof tyreError.message === "string"
        ? tyreError.message
        : "";

  const vehicle = vehicleData
    ? {
        registration: registration.toUpperCase(),
        make: (vehicleData.make as string) || "Unknown Make",
        model: ((vehicleData.model as string) || (vehicleData.modelVariant as string) || "").trim(),
        year: (vehicleData.yearOfManufacture as number) || new Date().getFullYear(),
      }
    : null;

  const tyres =
    tyreItems.length > 0
      ? tyreItems.map((item, index) => {
          const source = item as Record<string, unknown>;
          const priceValue =
            typeof source.price === "string"
              ? Number.parseFloat(source.price)
              : typeof source.price === "number"
                ? source.price
                : Number.NaN;
          return {
            id: String(source.id ?? index),
            brand: ((source.brand as { name?: string } | undefined)?.name || "Unknown Brand").trim(),
            model: (source.model as string) || "Tyre",
            size: ((source.size as { label?: string } | undefined)?.label || "Unknown Size").trim(),
            season: ((source.season as { name?: string } | undefined)?.name || "All-Season").trim(),
            fuelRating:
              (source.fuel_efficiency as { rating?: string } | undefined)?.rating ||
              (source.fuelEfficiency as { rating?: string } | undefined)?.rating ||
              "N/A",
            price: Number.isFinite(priceValue) ? priceValue : null,
            image: (source.image_url as string) || "default",
          };
        })
      : Array.isArray(tyreData?.likely_sizes)
        ? (tyreData.likely_sizes as unknown[]).map((size, index) => ({
            id: `suggested_${index}`,
            brand: "Recommended",
            model: "Tyre Option",
            size: typeof size === "string" ? size : "Unknown Size",
            season: "All-Season",
            fuelRating: "N/A",
            price: null,
            image: "default",
          }))
        : [];
  const showingFallbackSizes = tyreItems.length === 0 && hasLikelySizes;

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#f8f9ff] via-[#fcfcff] to-neutral-50 px-6 py-10 sm:px-10 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-neutral-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#4d64c8]">Tyre Search</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Search results for {registration.toUpperCase()}
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to homepage
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#2f4eb8] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#243f97]"
            >
              <Search className="h-4 w-4" />
              New search
            </Link>
          </div>
        </div>
        {!vehicle ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-7">
            <h2 className="text-xl font-semibold text-red-800">Vehicle not found</h2>
            <p className="mt-2 text-sm text-red-700">
              We could not find details for <span className="font-semibold">{registration.toUpperCase()}</span>.
              Please check the registration and try again.
            </p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-800 transition-colors hover:bg-red-100"
            >
              <Search className="h-4 w-4" />
              Try another registration
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8">
              <VehicleCard vehicle={vehicle} />
            </div>
            {tyreErrorMessage ? (
              <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                <p className="font-semibold">Tyre AI is not returning recommendations.</p>
                <p className="mt-1">{tyreErrorMessage}</p>
              </div>
            ) : null}
            {showingFallbackSizes ? (
              <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                Showing likely tyre sizes for this vehicle. Final tyre availability and pricing will be
                confirmed by our team.
              </div>
            ) : null}
            <div className="mt-10">
              <TyreGrid tyres={tyres} vehicle={vehicle} contactNumber={contactNumber} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

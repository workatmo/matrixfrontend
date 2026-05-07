"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { VehicleCard } from "@/components/VehicleCard";
import { TyreGrid } from "@/components/TyreGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { clientApiUrl } from "@/lib/public-api-url";
import { FaqSection } from "@/components/FaqSection";
import { HeroSearch } from "@/components/HeroSearch";
import { HowItWorks } from "@/components/HowItWorks";
import { WhyChooseUs } from "@/components/WhyChooseUs";

interface Vehicle {
  registration: string;
  make: string;
  model: string;
  year: number;
}

interface Tyre {
  id: string;
  brand: string;
  model: string;
  size: string;
  season: string;
  fuelRating?: string;
  price: number | null;
  image: string;
}

export default function HomePageClient() {
  const resultsRef = useRef<HTMLElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [contactNumber, setContactNumber] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSearch = async ({
    registrationNumber,
    tyreSize,
    speedRating,
  }: {
    registrationNumber?: string;
    tyreSize?: string;
    speedRating?: string;
  }) => {
    setIsLoading(true);
    setHasSearched(true);
    setVehicle(null);
    setTyres([]);
    setContactNumber("");
    setErrorMessage("");

    try {
      const vehicleRes = await fetch(clientApiUrl("/vehicle/lookup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          tyreSize
            ? { tyre_size: tyreSize, ...(speedRating ? { speed_rating: speedRating } : {}) }
            : { registration_number: registrationNumber }
        ),
      });

      if (!vehicleRes.ok) {
        const errorData = await vehicleRes.json().catch(() => ({}));
        const message =
          (typeof errorData?.error === "string" && errorData.error) ||
          (typeof errorData?.message === "string" && errorData.message) ||
          "Vehicle not found";
        throw new Error(message);
      }

      const responsePayload = await vehicleRes.json();
      const payload =
        responsePayload &&
        typeof responsePayload === "object" &&
        responsePayload.data &&
        typeof responsePayload.data === "object"
          ? responsePayload.data
          : responsePayload;

      const vData = payload.vehicle || {};
      const tData = payload.tyre || null;
      const backendTyres = Array.isArray(payload.tyres) ? payload.tyres : [];
      const isTyreSizeSearch = payload.search_type === "tyre_size";
      const backendContactNumber =
        typeof payload.contact_number === "string" ? payload.contact_number : "";
      setContactNumber(backendContactNumber);

      setVehicle({
        registration: registrationNumber || "TYRE SIZE SEARCH",
        make: vData.make || "Unknown Make",
        model: vData.model || vData.modelVariant || "",
        year: vData.yearOfManufacture || new Date().getFullYear(),
      });

      const realTyres: Tyre[] = [];
      if (Array.isArray(backendTyres) && backendTyres.length > 0) {
        backendTyres.forEach((item: Record<string, unknown>, index: number) => {
          const brand = (item.brand as { name?: string } | undefined)?.name || "Unknown Brand";
          const size =
            (item.size as { label?: string } | undefined)?.label || tyreSize || "Unknown Size";
          const season = (item.season as { name?: string } | undefined)?.name || "All-Season";
          const model = typeof item.model === "string" ? item.model : "Tyre";
          const fuelRating =
            (item.fuel_efficiency as { rating?: string } | undefined)?.rating ||
            (item.fuelEfficiency as { rating?: string } | undefined)?.rating ||
            (typeof item.fuel_rating === "string" ? item.fuel_rating : undefined);
          const image =
            typeof item.image_url === "string" && item.image_url.trim() !== ""
              ? item.image_url
              : "default";
          const numericPrice =
            typeof item.price === "string"
              ? Number.parseFloat(item.price)
              : typeof item.price === "number"
                ? item.price
                : Number.NaN;

          realTyres.push({
            id:
              typeof item.id === "number" || typeof item.id === "string"
                ? String(item.id)
                : `${isTyreSizeSearch ? "ts" : "vrm"}_${index}`,
            brand,
            model,
            size,
            season,
            fuelRating,
            price: Number.isFinite(numericPrice) ? numericPrice : null,
            image,
          });
        });
      } else if (!isTyreSizeSearch && tData && Array.isArray(tData.likely_sizes)) {
        tData.likely_sizes.forEach((size: string, index: number) => {
          realTyres.push({
            id: `suggested_${index}`,
            brand: "Recommended",
            model: "Tyre Option",
            size,
            season: "All-Season",
            fuelRating: "N/A",
            price: null,
            image: "default",
          });
        });
      }

      setTyres(realTyres);
    } catch (error: unknown) {
      const fallbackMessage = "Vehicle not found. Try again.";
      const message = error instanceof Error ? error.message || fallbackMessage : fallbackMessage;
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      window.setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-neutral-50 font-sans">
      <HeroSearch onSearch={handleSearch} isLoading={isLoading} />
      {!hasSearched && !isLoading && (
        <>
          <HowItWorks />
          <WhyChooseUs />
          <section className="bg-transparent px-6 pb-2 pt-4 sm:px-10 sm:pt-6">
            <div className="mx-auto max-w-6xl">
              <div className="rounded-xl border border-white/70 bg-gradient-to-br from-[#eef4ff]/90 via-[#f4f0ff]/90 to-[#ffeef7]/90 p-6 shadow-[0_18px_50px_-35px_rgba(53,88,223,0.6)] backdrop-blur-sm sm:p-8">
                <h2 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                  Tyre fitting in London / Manchester
                </h2>
                <p className="mt-3 max-w-3xl text-neutral-700">
                  We offer mobile tyre fitting across major UK cities. Book online and choose a
                  fast slot at your home, workplace, or roadside location.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {["london", "manchester", "birmingham", "leeds"].map((city) => (
                    <Link
                      key={city}
                      href={`/tyre-fitting/${city}`}
                      className="rounded-full border border-[#c9d7ff] bg-white/90 px-4 py-2 text-sm font-semibold text-[#1f2d66] shadow-[0_10px_24px_-18px_rgba(53,88,223,0.9)] transition-all hover:-translate-y-0.5 hover:border-[#aebff8] hover:bg-white"
                    >
                      Tyre fitting in {city.charAt(0).toUpperCase() + city.slice(1)}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
          <FaqSection />
        </>
      )}
      {isLoading && (
        <section ref={resultsRef} className="mx-auto w-full max-w-5xl space-y-8 px-6 py-16 sm:px-10">
          <Skeleton className="mx-auto h-[120px] w-full max-w-xl rounded-xl" />
          <div className="grid grid-cols-1 gap-6 pt-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Skeleton className="h-[380px] w-full rounded-xl" />
            <Skeleton className="h-[380px] w-full rounded-xl" />
            <Skeleton className="hidden h-[380px] w-full rounded-xl sm:block" />
            <Skeleton className="hidden h-[380px] w-full rounded-xl lg:block" />
          </div>
        </section>
      )}
      {!isLoading && errorMessage ? (
        <section ref={resultsRef} className="mx-auto w-full max-w-3xl px-6 py-14 text-center sm:px-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8">
            <h3 className="text-xl font-semibold text-red-700">Vehicle not found. Try again.</h3>
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          </div>
        </section>
      ) : null}
      {!isLoading && vehicle && (
        <section ref={resultsRef} className="fade-in animate-in flex-1 pb-20">
          <div className="px-6 sm:px-10">
            <VehicleCard vehicle={vehicle} />
          </div>
          <div className="mt-12">
            <TyreGrid tyres={tyres} vehicle={vehicle} contactNumber={contactNumber} />
          </div>
        </section>
      )}
    </main>
  );
}

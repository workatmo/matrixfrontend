"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HeroSearch } from "@/components/HeroSearch";
import { HowItWorks } from "@/components/HowItWorks";
import { VehicleCard } from "@/components/VehicleCard";
import { TyreGrid } from "@/components/TyreGrid";
import { Skeleton } from "@/components/ui/skeleton";

interface Vehicle {
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
  price: number;
  image: string;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (registrationNumber: string) => {
    setIsLoading(true);
    setHasSearched(true);
    setVehicle(null);
    setTyres([]);

    try {
      // 1. Fetch Vehicle & Tyre Details (Single backend call)
      const vehicleRes = await fetch("/api/vehicle/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registration_number: registrationNumber }),
      });

      if (!vehicleRes.ok) {
        const errorData = await vehicleRes.json();
        throw new Error(errorData.error || "Vehicle not found");
      }

      const responsePayload = await vehicleRes.json();
      
      const vData = responsePayload.vehicle || {};
      const tData = responsePayload.tyre || null;
      
      setVehicle({
        make: vData.make || "Unknown Make",
        model: vData.model || vData.modelVariant || "",
        year: vData.yearOfManufacture || new Date().getFullYear(),
      });

      // Map real likely sizes to our tyre cards. 
      // Since the backend only provides sizes via OpenAI, we generate dynamic product cards for each real size.
      const realTyres: Tyre[] = [];
      if (tData && tData.likely_sizes && Array.isArray(tData.likely_sizes)) {
         tData.likely_sizes.forEach((size: string, index: number) => {
           realTyres.push({
             id: `t_${index}`,
             brand: index % 2 === 0 ? "Michelin" : "Pirelli",
             model: index % 2 === 0 ? "Pro Performance" : "Eco Grip",
             size: size,
             season: index % 2 === 0 ? "Summer" : "All-Season",
             price: 120 + (index * 15),
             image: "default",
           });
         });
      }

      setTyres(realTyres);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "An unexpected error occurred");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
      // Smooth scroll to results if on mobile/desktop (optional enhancement)
      setTimeout(() => {
        window.scrollTo({
          top: window.innerHeight * 0.8,
          behavior: "smooth",
        });
      }, 100);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col font-sans">
      <HeroSearch onSearch={handleSearch} isLoading={isLoading} />
      
      {!hasSearched && !isLoading && <HowItWorks />}

      {/* Loading State */}
      {isLoading && (
        <section className="py-16 px-6 sm:px-10 max-w-5xl mx-auto w-full space-y-8">
          <Skeleton className="h-[120px] w-full max-w-xl mx-auto rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-8">
             <Skeleton className="h-[380px] w-full rounded-xl" />
             <Skeleton className="h-[380px] w-full rounded-xl" />
             <Skeleton className="h-[380px] w-full rounded-xl hidden sm:block" />
             <Skeleton className="h-[380px] w-full rounded-xl hidden lg:block" />
          </div>
        </section>
      )}

      {/* Results State */}
      {!isLoading && vehicle && (
        <div className="flex-1 pb-20 fade-in animate-in">
          <div className="px-6 sm:px-10">
            <VehicleCard vehicle={vehicle} />
          </div>
          <div className="mt-12">
            <TyreGrid tyres={tyres} />
          </div>
        </div>
      )}
    </main>
  );
}

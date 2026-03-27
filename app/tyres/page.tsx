"use client";

import { useEffect, useState } from "react";
import { getPublicTyres, type PublicTyreListResult } from "@/lib/api";
import { TyreGrid } from "@/components/TyreGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search } from "lucide-react";

export default function TyresPage() {
  const [data, setData] = useState<PublicTyreListResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  // Map the backend typed data to match what the frontend TyreGrid component expects
  const formattedTyres = data?.data.map((tyre, index) => ({
    id: tyre.id.toString(),
    brand: tyre.brand?.name || "Unknown Brand",
    model: tyre.model,
    size: tyre.size?.name || "Unknown Size",
    season: tyre.season?.name || "All-Season",
    price: parseFloat(tyre.price) || 0,
    image: tyre.image_url || "default",
  })) || [];

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col font-sans mb-20">
      <div className="bg-black text-white py-16 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-6">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Browse Our Premium Tyres
          </h1>
          <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
            Find the perfect tyres for your vehicle. Explore top brands, high-performance models, and reliable treads for any season.
          </p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-12 w-full flex-1">
        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-[40px] w-[250px] rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-4">
              <Skeleton className="h-[380px] w-full rounded-xl" />
              <Skeleton className="h-[380px] w-full rounded-xl" />
              <Skeleton className="h-[380px] w-full rounded-xl hidden sm:block" />
              <Skeleton className="h-[380px] w-full rounded-xl hidden lg:block" />
            </div>
          </div>
        ) : data && data.data.length > 0 ? (
          <div className="space-y-6">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-200">
                <h2 className="text-2xl font-bold text-neutral-800">
                  Showing {data.total} Available Tyres
                </h2>
                <div className="hidden sm:flex text-sm text-neutral-500 items-center justify-center space-x-2">
                   {/* We can add filter buttons here in the future */}
                </div>
              </div>
              <TyreGrid 
                tyres={formattedTyres} 
                vehicle={{
                    registration: "Browsing Mode",
                    make: "Unknown",
                    model: "Unknown",
                    year: new Date().getFullYear()
                }} // Pass a dummy vehicle since we don't know the exact vehicle here, TyreCard uses vehicle details for checkout routing
              />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-6 text-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm mt-8">
            <Search className="h-16 w-16 text-neutral-300" />
            <h2 className="text-2xl font-bold text-black">No Tyres Found</h2>
            <p className="text-neutral-500 max-w-md">
              We couldn't find any tyres matching your criteria at this moment. Please check back later or contact support.
            </p>
            <a
              href="/"
              className="mt-4 px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
            >
              Search by Registration Instead
            </a>
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { getPublicTyres, type PublicTyreListResult } from "@/lib/api";
import { TyreGrid } from "@/components/TyreGrid";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Search } from "lucide-react";
import Link from "next/link";

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
  const formattedTyres = data?.data.map((tyre) => ({
    id: tyre.id.toString(),
    brand: tyre.brand?.name || "Unknown Brand",
    model: tyre.model,
    size: tyre.size?.label || "Unknown Size",
    season: tyre.season?.name || "All-Season",
    price: parseFloat(tyre.price) || 0,
    image: tyre.image_url || "default",
  })) || [];

  return (
    <main className="min-h-screen bg-white flex flex-col font-sans">
      <div className="w-full flex-1">
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
          <TyreGrid 
            tyres={formattedTyres} 
            vehicle={{
              registration: "",
              make: "",
              model: "",
              year: new Date().getFullYear(),
            }}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-6 sm:px-10 pt-20 pb-20">
            <div className="flex flex-col items-center justify-center space-y-6 text-center py-20 bg-white rounded-2xl border border-neutral-200 shadow-sm mt-8">
              <Search className="h-16 w-16 text-neutral-300" />
              <h2 className="text-2xl font-bold text-black">No Tyres Found</h2>
              <p className="text-neutral-500 max-w-md">
                We couldn&apos;t find any tyres matching your criteria at this moment. Please check back later or contact support.
              </p>
              <Link
                href="/"
                className="mt-4 px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition-colors"
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

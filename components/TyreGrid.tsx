import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TyreCard = dynamic(
  () => import("./TyreCard").then((mod) => mod.TyreCard),
  {
    loading: () => (
      <div className="rounded-xl border border-neutral-200 bg-white p-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="mt-4 h-5 w-2/3" />
        <Skeleton className="mt-2 h-4 w-1/2" />
        <Skeleton className="mt-6 h-10 w-full" />
      </div>
    ),
    ssr: false,
  }
);

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

interface TyreGridProps {
  tyres: Tyre[];
  vehicle: Vehicle;
  contactNumber: string;
}

export function TyreGrid({ tyres, vehicle, contactNumber }: TyreGridProps) {
  if (!tyres || tyres.length === 0) {
    return (
      <div className="text-center py-20 px-6 max-w-2xl mx-auto">
        <h3 className="text-xl font-medium text-neutral-900 mb-2">
          No tyres found
        </h3>
        <p className="text-neutral-500">
          We couldn&apos;t find any specific tyre recommendations for this vehicle.
        </p>
      </div>
    );
  }

  return (
    <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight text-black">Recommended Tyres</h2>
            <p className="text-neutral-500">
              The best fitting options for your vehicle
            </p>
            <p className="mt-2 text-sm font-semibold text-neutral-800">⭐ 4.8 Rating from 500+ customers</p>
          </div>
          <p className="mt-4 text-sm font-medium text-neutral-400 sm:mt-0">
            Showing {tyres.length} results
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tyres.map((tyre) => (
            <TyreCard
              key={tyre.id}
              tyre={tyre}
              vehicle={vehicle}
              contactNumber={contactNumber}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

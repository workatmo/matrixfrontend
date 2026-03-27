import { TyreCard } from "./TyreCard";

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
  price: number;
  image: string;
}

interface TyreGridProps {
  tyres: Tyre[];
  vehicle: Vehicle;
}

export function TyreGrid({ tyres, vehicle }: TyreGridProps) {
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
    <section className="py-16 px-6 sm:px-10 bg-neutral-50 border-t border-neutral-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Recommended Tyres</h2>
            <p className="text-neutral-500">
              The best fitting options for your vehicle
            </p>
          </div>
          <p className="text-sm font-medium text-neutral-400 mt-4 sm:mt-0">
            Showing {tyres.length} results
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tyres.map((tyre) => (
            <TyreCard key={tyre.id} tyre={tyre} vehicle={vehicle} />
          ))}
        </div>
      </div>
    </section>
  );
}

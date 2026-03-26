import { Card, CardContent } from "@/components/ui/card";
import { Car } from "lucide-react";

interface Vehicle {
  make: string;
  model: string;
  year: number;
}

interface VehicleCardProps {
  vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <Card className="max-w-xl mx-auto border-neutral-200 shadow-sm bg-white overflow-hidden mt-8">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neutral-100 rounded-lg">
            <Car className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide">
              Vehicle Detected
            </p>
            <h3 className="text-2xl font-bold text-black mt-1">
              {vehicle.make} {vehicle.model ? `${vehicle.model} ` : ""}({vehicle.year})
            </h3>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

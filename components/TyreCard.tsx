import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface Tyre {
  id: string;
  brand: string;
  model: string;
  size: string;
  season: string;
  price: number;
  image: string; // 'summer' | 'allseason'
}

interface TyreCardProps {
  tyre: Tyre;
}

export function TyreCard({ tyre }: TyreCardProps) {
  const isSummer = tyre.season.toLowerCase().includes("summer");

  return (
    <Card className="flex flex-col h-full bg-white border-neutral-200 transition-all hover:shadow-lg hover:-translate-y-1 group">
      <CardHeader className="bg-neutral-50 rounded-t-lg border-b border-neutral-100 p-6 flex flex-col items-center justify-center min-h-[160px] relative overflow-hidden">
        {/* Abstract tyre icon / graphic since we don't have actual images */}
        <div className="w-32 h-32 rounded-full border-8 border-neutral-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
           <div className="w-16 h-16 rounded-full border-4 border-neutral-600 bg-neutral-200"></div>
        </div>
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-semibold px-2 py-1 flex rounded-full ${isSummer ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
            {tyre.season}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6 flex-grow flex flex-col justify-between">
        <div>
          <p className="text-sm text-neutral-500 font-semibold tracking-wide uppercase mb-1">
            {tyre.brand}
          </p>
          <h3 className="text-lg font-bold text-black leading-tight mb-3 line-clamp-2">
            {tyre.model}
          </h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Size</span>
            <span className="font-semibold text-black">{tyre.size}</span>
          </div>
          
          <div className="pt-4 border-t border-neutral-100 flex items-end justify-between">
             <div className="flex flex-col">
               <span className="text-xs text-neutral-500">Price per tyre</span>
               <span className="text-2xl font-bold text-black">£{tyre.price.toFixed(2)}</span>
             </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button className="w-full bg-black text-white hover:bg-neutral-800 transition-colors">
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
}

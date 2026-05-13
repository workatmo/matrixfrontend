"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { MessageCircleMore } from "lucide-react";
import { buildTyrePath } from "@/lib/seo";
import { addToCart } from "@/lib/cart";

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

interface TyreCardProps {
  tyre: Tyre;
  vehicle: Vehicle;
  contactNumber: string;
}

const fallbackTyreImage = "/tyre.png";

export function TyreCard({ tyre, vehicle, contactNumber }: TyreCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [tyreQuantity, setTyreQuantity] = useState(1);
  const numericPrice =
    typeof tyre.price === "number" && Number.isFinite(tyre.price) ? tyre.price : null;
  const hasPrice = numericPrice !== null;

  const handleBookNow = () => {
    const tyrePrice = numericPrice;
    if (typeof tyrePrice !== "number" || !Number.isFinite(tyrePrice)) {
      return;
    }

    addToCart({
      tyre_id: tyre.id,
      tyre_brand: tyre.brand,
      tyre_model: tyre.model,
      tyre_size: tyre.size,
      tyre_price: tyrePrice,
      tyre_quantity: tyreQuantity,
      vehicle_reg: vehicle.registration,
      vehicle_make: vehicle.make,
      vehicle_model: vehicle.model,
    });
    toast.success("Added to cart");
    router.push("/cart");
  };

  const handleContactUs = () => {
    const sanitizedContactNumber = contactNumber.replace(/[^\d]/g, "");
    if (!sanitizedContactNumber) {
      toast.error("Contact number is not configured yet. Please contact the admin.");
      return;
    }

    setIsRedirecting(true);
    const message = [
      "Hi, I need help with this tyre.",
      `Registration: ${vehicle.registration}`,
      `Tyre: ${tyre.brand} ${tyre.model}`,
      `Size: ${tyre.size}`,
      `Season: ${tyre.season}`,
      `Fuel Rating: ${tyre.fuelRating ?? "N/A"}`,
    ].join("\n");

    const whatsappUrl = `https://wa.me/${sanitizedContactNumber}?text=${encodeURIComponent(message)}`;
    window.setTimeout(() => {
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      setIsRedirecting(false);
    }, 700);
  };

  const showImage = tyre.image && tyre.image !== "default" && !imageError;
  const tyreHref = buildTyrePath(tyre.id, tyre.brand, tyre.model, tyre.size);

  return (
    <Card className="relative flex h-full flex-col gap-0 border-neutral-200 bg-white p-0 shadow-sm transition-all duration-300 hover:scale-[1.015] hover:shadow-2xl group">
      {isRedirecting ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-black/70 text-sm font-medium text-white backdrop-blur-sm">
          <MessageCircleMore className="mr-2 h-4 w-4" />
          Redirecting to WhatsApp...
        </div>
      ) : null}
      <Link href={tyreHref} className="block">
        <CardHeader className="relative flex min-h-[160px] flex-col items-center justify-center overflow-hidden rounded-t-lg border-b border-neutral-100 bg-neutral-50 p-6">
          {showImage ? (
            <div className="flex h-32 w-32 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image
                src={tyre.image}
                alt={`${tyre.brand} ${tyre.model} ${tyre.size} tyre`}
                className="w-full h-full object-contain drop-shadow-md"
                width={128}
                height={128}
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="flex h-32 w-32 items-center justify-center transition-transform duration-300 group-hover:scale-105">
              <Image
                src={fallbackTyreImage}
                alt="Tyre placeholder"
                className="h-full w-full rounded-xl object-contain"
                width={128}
                height={128}
              />
            </div>
          )}
        </CardHeader>
      </Link>

      <CardContent className="flex flex-grow flex-col justify-between p-6">
        <div>
          <Link href={tyreHref} className="block hover:underline underline-offset-2">
            <p className="mb-1 text-sm font-bold uppercase tracking-wide text-neutral-500">
              {tyre.brand}
            </p>
            <h3 className="mb-3 line-clamp-2 text-lg font-semibold leading-tight text-black">
              {tyre.model}
            </h3>
          </Link>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">Size</span>
            <span className="font-semibold text-black">{tyre.size}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label htmlFor={`tyre-qty-${tyre.id}`} className="text-neutral-500">
              Quantity
            </label>
            <select
              id={`tyre-qty-${tyre.id}`}
              value={tyreQuantity}
              onChange={(e) => setTyreQuantity(Number.parseInt(e.target.value, 10) || 1)}
              className="h-8 rounded-md border border-neutral-300 bg-white px-2 text-sm font-semibold text-black focus:border-neutral-500 focus:outline-none"
              aria-label={`Select quantity for ${tyre.brand} ${tyre.model}`}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((qty) => (
                <option key={qty} value={qty}>
                  {qty}
                </option>
              ))}
            </select>
          </div>

          {hasPrice ? (
            <div className="flex items-end justify-between border-t border-neutral-100 pt-4">
              <div className="flex flex-col">
                <span className="text-xs text-neutral-500">Price per tyre</span>
                <span className="text-3xl font-bold text-black">£{numericPrice.toFixed(0)}</span>
              </div>
            </div>
          ) : null}
        </div>
      </CardContent>

      <CardFooter className="border-none bg-transparent p-6 pt-0">
        <Button
          onClick={hasPrice ? handleBookNow : handleContactUs}
          className="w-full bg-black text-white transition-colors hover:bg-neutral-800"
        >
          {hasPrice ? "Book Now" : "Contact Us"}
        </Button>
      </CardFooter>
    </Card>
  );
}

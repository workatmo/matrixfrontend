"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getPublicTyre, type PublicTyreItem } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  Fuel,
  Gauge,
  Layers,
  PackageCheck,
  ShoppingCart,
  Sun,
  Snowflake,
  CloudSun,
} from "lucide-react";
import { addToCart } from "@/lib/cart";

/** First non-empty display value from a nested API object (speed ratings use `rating`, not `name`). */
function relAttr(rel: unknown, keys: string[]): string | null {
  if (rel == null || typeof rel !== "object") return null;
  const o = rel as Record<string, unknown>;
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim() !== "") return v.trim();
    if (typeof v === "number" && Number.isFinite(v)) return String(v);
  }
  return null;
}

export default function TyreDetailClient({ tyreId }: { tyreId?: string }) {
  const params = useParams();
  const router = useRouter();
  const paramId = params?.id as string | undefined;
  const id = tyreId ?? (paramId ? paramId.split("-")[0] : "");

  const [tyre, setTyre] = useState<PublicTyreItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!id || loadingRef.current) return;
    loadingRef.current = true;

    getPublicTyre(id)
      .then((data) => {
        setTyre(data);
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Could not load tyre details.");
        setIsLoading(false);
      });

    return () => {
      loadingRef.current = false;
    };
  }, [id]);

  const handleBookNow = () => {
    if (!tyre) return;
    const tyrePrice = Number.parseFloat(tyre.price);
    if (!Number.isFinite(tyrePrice) || tyrePrice <= 0) {
      toast.error("This tyre does not have a valid price.");
      return;
    }

    addToCart({
      tyre_id: tyre.id.toString(),
      tyre_brand: tyre.brand?.name || "Unknown Brand",
      tyre_model: tyre.model,
      tyre_size: tyre.size?.label || "Unknown Size",
      tyre_price: tyrePrice,
      tyre_quantity: 1,
      vehicle_reg: "Direct Booking",
      vehicle_make: "Unknown",
      vehicle_model: "Unknown",
    });
    toast.success("Added to cart");
    router.push("/cart");
  };

  const seasonName = relAttr(tyre?.season, ["name", "label", "title"]) ?? "";

  const seasonIcon = () => {
    const name = seasonName.toLowerCase();
    if (name.includes("summer")) return <Sun className="w-4 h-4 text-orange-500" />;
    if (name.includes("winter")) return <Snowflake className="w-4 h-4 text-blue-500" />;
    return <CloudSun className="w-4 h-4 text-indigo-500" />;
  };

  const isSummer = seasonName.toLowerCase().includes("summer");
  const seasonBadgeClass = isSummer
    ? "bg-orange-100 text-orange-800"
    : "bg-blue-100 text-blue-800";

  const showImage = tyre?.image_url && !imageError;

  // All rows always listed; missing API fields show N/A (production DB often has null FKs).
  const specs = tyre
    ? [
        {
          label: "Size",
          value: tyre.size?.label || null,
          icon: <Layers className="w-4 h-4 text-neutral-500" />,
        },
        {
          label: "Season",
          value: seasonName || null,
          icon: seasonName ? (
            seasonIcon()
          ) : (
            <CloudSun className="w-4 h-4 text-neutral-400" />
          ),
        },
        {
          label: "Type",
          value: relAttr(tyre.tyre_type, ["name", "label", "type_name"]),
          icon: <PackageCheck className="w-4 h-4 text-neutral-500" />,
        },
        {
          label: "Fuel Efficiency",
          value: relAttr(tyre.fuel_efficiency, ["rating", "name", "label"]),
          icon: <Fuel className="w-4 h-4 text-neutral-500" />,
        },
        {
          label: "Speed Rating",
          value: relAttr(tyre.speed_rating, ["rating", "name", "code", "label"]),
          icon: <Gauge className="w-4 h-4 text-neutral-500" />,
        },
        {
          label: "Stock",
          value: tyre.stock > 0 ? `${tyre.stock} available` : "Out of stock",
          icon: (
            <CheckCircle2
              className={`w-4 h-4 ${tyre.stock > 0 ? "text-green-500" : "text-red-400"}`}
            />
          ),
        },
      ]
    : [];

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-10">
        {isLoading ? (
          <TyreDetailSkeleton />
        ) : !tyre ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <p className="text-lg font-semibold text-neutral-700 mb-4">Tyre not found.</p>
            <Link
              href="/tyres"
              className="px-6 py-3 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors"
            >
              Browse All Tyres
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* ── Left: Image Panel ── */}
            <div className="flex flex-col gap-6">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm flex items-center justify-center p-12 min-h-[340px] relative overflow-hidden">
                {/* Decorative background ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-full border-[40px] border-neutral-50 opacity-60" />
                </div>

                {showImage ? (
                  <Image
                    src={tyre.image_url!}
                    alt={`${tyre.brand?.name || "Tyre"} ${tyre.model} ${tyre.size?.label || ""} tyre`}
                    className="relative z-10 w-56 h-56 object-contain drop-shadow-2xl transition-transform duration-500 hover:scale-105"
                    width={224}
                    height={224}
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="relative z-10 w-52 h-52 rounded-full border-[20px] border-neutral-800 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-neutral-600 bg-neutral-200" />
                  </div>
                )}

                {seasonName ? (
                  <div className="absolute top-5 right-5">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${seasonBadgeClass}`}
                    >
                      {seasonIcon()}
                      {seasonName}
                    </span>
                  </div>
                ) : null}
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Free Fitting", sub: "On all orders" },
                  { label: "Warranty", sub: "Manufacturer backed" },
                  { label: "Fast Delivery", sub: "Next day available" },
                ].map((b) => (
                  <div
                    key={b.label}
                    className="bg-white rounded-xl border border-neutral-200 p-4 text-center shadow-sm"
                  >
                    <p className="text-xs font-bold text-black">{b.label}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">{b.sub}</p>
                  </div>
                ))}
              </div>

              {tyre.description && (
                <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                  <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-3">
                    About this tyre
                  </h2>
                  <p className="text-sm text-neutral-600 leading-relaxed">{tyre.description}</p>
                </div>
              )}
            </div>

            {/* ── Right: Info Panel ── */}
            <div className="flex flex-col gap-6">
              {/* Brand + Model */}
              <div>
                <p className="text-sm font-semibold tracking-widest text-neutral-400 uppercase mb-1">
                  {tyre.brand?.name || "Unknown Brand"}
                </p>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-black leading-tight tracking-tight">
                  {tyre.model}
                </h1>
              </div>

              {/* Price block */}
              <div className="bg-black rounded-2xl p-6 flex items-center justify-between text-white">
                <div>
                  <p className="text-sm text-neutral-400">Price per tyre</p>
                  <p className="text-4xl font-extrabold mt-1">
                    £{parseFloat(tyre.price).toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-neutral-400">Stock</p>
                  <p
                    className={`text-lg font-bold mt-1 ${
                      tyre.stock > 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {tyre.stock > 0 ? `${tyre.stock} left` : "Out of stock"}
                  </p>
                </div>
              </div>

              {/* Specs grid */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6">
                <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">
                  Specifications
                </h2>
                <div className="divide-y divide-neutral-100">
                  {specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2 text-sm text-neutral-500">
                        {spec.icon}
                        <span>{spec.label}</span>
                      </div>
                      {spec.value ? (
                        <span className="text-sm font-semibold text-black">{spec.value}</span>
                      ) : (
                        <span className="text-xs font-medium text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">
                          N/A
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={handleBookNow}
                disabled={tyre.stock === 0}
                className="w-full py-6 text-base font-bold bg-black text-white hover:bg-neutral-800 transition-colors rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                {tyre.stock === 0 ? "Out of Stock" : "Book Now"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function TyreDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
      <div className="flex flex-col gap-6">
        <Skeleton className="w-full rounded-2xl h-[340px]" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-4 w-24 mb-2 rounded" />
          <Skeleton className="h-10 w-72 rounded-lg" />
        </div>
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}

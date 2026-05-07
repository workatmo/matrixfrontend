"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2, ShoppingCart, ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  buildCheckoutUrlFromCartItem,
  cartItemKey,
  clearCart,
  getCart,
  onCartUpdated,
  removeCartItem,
  updateCartItemQuantity,
  type CartItem,
} from "@/lib/cart";

function money(n: number): string {
  if (!Number.isFinite(n)) return "0.00";
  return n.toFixed(2);
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(999, Math.trunc(qty)));
}

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [qtyDrafts, setQtyDrafts] = useState<Record<string, string>>({});
  const debounceTimersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const initial = getCart();
    setItems(initial);

    const initialKey = initial[0] ? cartItemKey(initial[0]) : "";
    setSelectedKey(initialKey);

    const nextDrafts: Record<string, string> = {};
    for (const it of initial) {
      nextDrafts[cartItemKey(it)] = String(it.tyre_quantity);
    }
    setQtyDrafts(nextDrafts);

    return onCartUpdated(() => {
      const next = getCart();
      setItems(next);

      setSelectedKey((prev) => {
        if (!prev) return next[0] ? cartItemKey(next[0]) : "";
        return next.some((x) => cartItemKey(x) === prev) ? prev : next[0] ? cartItemKey(next[0]) : "";
      });

      setQtyDrafts((prev) => {
        const merged: Record<string, string> = { ...prev };
        for (const it of next) {
          const k = cartItemKey(it);
          if (!(k in merged)) merged[k] = String(it.tyre_quantity);
        }
        for (const k of Object.keys(merged)) {
          if (!next.some((x) => cartItemKey(x) === k)) delete merged[k];
        }
        return merged;
      });
    });
  }, []);

  const totals = useMemo(() => {
    const quantity = items.reduce((sum, x) => sum + x.tyre_quantity, 0);
    const subtotal = items.reduce((sum, x) => sum + x.tyre_quantity * x.tyre_price, 0);
    return { quantity, subtotal };
  }, [items]);

  const selectedItem = useMemo(() => {
    if (!selectedKey) return null;
    return items.find((x) => cartItemKey(x) === selectedKey) ?? null;
  }, [items, selectedKey]);

  const selectedLineTotal = useMemo(() => {
    if (!selectedItem) return 0;
    return selectedItem.tyre_quantity * selectedItem.tyre_price;
  }, [selectedItem]);

  const handleClear = () => {
    clearCart();
    toast.success("Cart cleared");
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-neutral-50 font-sans">
        <div className="mx-auto w-full max-w-5xl px-6 py-12 sm:px-10">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-neutral-600" />
            <h1 className="text-2xl font-bold text-neutral-900">Your cart</h1>
          </div>

          <Card className="border-neutral-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-neutral-900">Cart is empty</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-600">
              Add tyres from the tyres list to start your booking.
            </CardContent>
            <CardFooter className="flex justify-between border-t border-neutral-100 bg-neutral-50/50">
              <Button variant="outline" onClick={() => router.back()} className="gap-2">
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                className="bg-black text-white hover:bg-neutral-800"
                onClick={() => router.push("/tyres")}
              >
                Browse tyres
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 font-sans">
      <div className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5 text-neutral-600" />
            <h1 className="text-2xl font-bold text-neutral-900">Your cart</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
              onClick={() => router.push("/tyres")}
            >
              Continue shopping
            </Button>
            <Button variant="outline" onClick={() => router.back()} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={handleClear}
              className="gap-2 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear cart
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const key = cartItemKey(item);
              const lineTotal = item.tyre_quantity * item.tyre_price;
              const checked = key === selectedKey;

              return (
                <Card key={key} className="border-neutral-200 bg-white shadow-sm">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <CardTitle className="text-base text-neutral-900">
                          {item.tyre_brand} {item.tyre_model}
                        </CardTitle>
                        <div className="mt-1 text-xs text-neutral-500">
                          <span className="font-medium text-neutral-700">Size:</span> {item.tyre_size}{" "}
                          <span className="mx-2 text-neutral-300">•</span>
                          <span className="font-medium text-neutral-700">Vehicle:</span>{" "}
                          <span className="uppercase">{item.vehicle_reg}</span>
                        </div>
                      </div>
                      <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-neutral-700">
                        <input
                          type="radio"
                          name="selectedCartItem"
                          checked={checked}
                          onChange={() => setSelectedKey(key)}
                          className="h-4 w-4 accent-black"
                          aria-label={`Select ${item.tyre_brand} ${item.tyre_model} for checkout`}
                        />
                        Select
                      </label>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      {checked ? (
                        <span className="inline-flex items-center rounded-full bg-neutral-900 px-2 py-0.5 text-[11px] font-bold text-white">
                          Selected for checkout
                        </span>
                      ) : null}
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:items-end">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Unit price
                        </p>
                        <p className="mt-1 text-lg font-bold text-neutral-900">£{money(item.tyre_price)}</p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Quantity
                        </p>
                        <Input
                          inputMode="numeric"
                          value={qtyDrafts[key] ?? String(item.tyre_quantity)}
                          onChange={(e) => {
                            const digits = e.target.value.replace(/\D/g, "");
                            setQtyDrafts((prev) => ({ ...prev, [key]: digits === "" ? "" : digits }));

                            const n = clampQty(Number.parseInt(digits || "1", 10));
                            const existing = debounceTimersRef.current[key];
                            if (existing) window.clearTimeout(existing);
                            debounceTimersRef.current[key] = window.setTimeout(() => {
                              updateCartItemQuantity(key, n);
                            }, 250);
                          }}
                          onBlur={() => {
                            const raw = (qtyDrafts[key] ?? "").trim();
                            const n = clampQty(Number.parseInt(raw || String(item.tyre_quantity) || "1", 10));
                            setQtyDrafts((prev) => ({ ...prev, [key]: String(n) }));
                            updateCartItemQuantity(key, n);
                          }}
                          className="mt-1 h-10 w-28 bg-white text-neutral-900 border-neutral-300"
                          aria-label={`Quantity for ${item.tyre_brand} ${item.tyre_model}`}
                        />
                      </div>

                      <div className="sm:text-right">
                        <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                          Line total
                        </p>
                        <p className="mt-1 text-lg font-bold text-neutral-900">£{money(lineTotal)}</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 border-t border-neutral-100 bg-neutral-50/50 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      variant="outline"
                      onClick={() => {
                        if (debounceTimersRef.current[key]) {
                          window.clearTimeout(debounceTimersRef.current[key]);
                          delete debounceTimersRef.current[key];
                        }
                        removeCartItem(key);
                        toast.success("Removed from cart");
                      }}
                      className="w-full gap-2 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 sm:w-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </Button>

                    <Button
                      variant={checked ? "default" : "outline"}
                      onClick={() => router.push(buildCheckoutUrlFromCartItem(item))}
                      className={
                        checked
                          ? "w-full bg-black text-white hover:bg-neutral-800 sm:w-auto"
                          : "w-full border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100 sm:w-auto"
                      }
                    >
                      Checkout this item
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Card className="border-neutral-200 bg-white shadow-sm h-fit lg:sticky lg:top-28">
            <CardHeader>
              <CardTitle className="text-neutral-900">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Items</span>
                <span className="font-semibold text-neutral-900">{totals.quantity}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Subtotal</span>
                <span className="font-bold text-neutral-900">£{money(totals.subtotal)}</span>
              </div>
              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Selected for checkout
                </p>
                {selectedItem ? (
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-semibold text-neutral-900">
                      {selectedItem.tyre_brand} {selectedItem.tyre_model}
                    </p>
                    <p className="text-xs text-neutral-600">
                      Size {selectedItem.tyre_size} • Qty {selectedItem.tyre_quantity} •{" "}
                      <span className="uppercase">{selectedItem.vehicle_reg}</span>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span className="text-neutral-600">Selected total</span>
                      <span className="font-bold text-neutral-900">£{money(selectedLineTotal)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-neutral-500">Select an item from the list.</p>
                )}
              </div>
              <p className="text-xs text-neutral-500">
                Checkout is currently per cart item (the booking flow supports one tyre selection at a time).
              </p>
            </CardContent>
            <CardFooter className="border-t border-neutral-100 bg-neutral-50/50">
              <div className="w-full space-y-2">
                <Button
                  onClick={() => {
                    if (!selectedItem) {
                      toast.error("Please select an item to checkout.");
                      return;
                    }
                    router.push(buildCheckoutUrlFromCartItem(selectedItem));
                  }}
                  className="w-full bg-black text-white hover:bg-neutral-800"
                >
                  Checkout selected item
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClear}
                  className="w-full gap-2 border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-100"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear cart
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
}


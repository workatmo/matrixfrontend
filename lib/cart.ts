"use client";

export type CartItem = {
  tyre_id: string;
  tyre_brand: string;
  tyre_model: string;
  tyre_size: string;
  /** Price per tyre (GBP). */
  tyre_price: number;
  tyre_quantity: number;
  vehicle_reg: string;
  vehicle_make: string;
  vehicle_model: string;
};

export const CART_STORAGE_KEY = "matrix_cart";
const CART_UPDATED_EVENT = "matrix:cart-updated";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(999, Math.trunc(qty)));
}

export function cartItemKey(item: Pick<CartItem, "tyre_id" | "vehicle_reg">): string {
  return `${String(item.tyre_id)}|${String(item.vehicle_reg).trim().toUpperCase()}`;
}

function emitCartUpdated(): void {
  if (!isBrowser()) return;
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function onCartUpdated(cb: () => void): () => void {
  if (!isBrowser()) return () => {};
  window.addEventListener(CART_UPDATED_EVENT, cb);
  return () => window.removeEventListener(CART_UPDATED_EVENT, cb);
}

export function getCart(): CartItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    const cleaned: CartItem[] = [];
    for (const row of parsed) {
      if (!row || typeof row !== "object") continue;
      const r = row as Partial<CartItem>;
      const tyre_id = typeof r.tyre_id === "string" ? r.tyre_id : String(r.tyre_id ?? "");
      const tyre_brand = typeof r.tyre_brand === "string" ? r.tyre_brand : "";
      const tyre_model = typeof r.tyre_model === "string" ? r.tyre_model : "";
      const tyre_size = typeof r.tyre_size === "string" ? r.tyre_size : "";
      const tyre_price =
        typeof r.tyre_price === "number" && Number.isFinite(r.tyre_price)
          ? r.tyre_price
          : Number.parseFloat(String(r.tyre_price ?? "0")) || 0;
      const tyre_quantity = clampQty(Number(r.tyre_quantity ?? 1));
      const vehicle_reg = typeof r.vehicle_reg === "string" ? r.vehicle_reg : "";
      const vehicle_make = typeof r.vehicle_make === "string" ? r.vehicle_make : "";
      const vehicle_model = typeof r.vehicle_model === "string" ? r.vehicle_model : "";

      if (!tyre_id.trim()) continue;
      if (!vehicle_reg.trim()) continue;
      if (!Number.isFinite(tyre_price) || tyre_price <= 0) continue;

      cleaned.push({
        tyre_id: tyre_id.trim(),
        tyre_brand: tyre_brand.trim(),
        tyre_model: tyre_model.trim(),
        tyre_size: tyre_size.trim(),
        tyre_price,
        tyre_quantity,
        vehicle_reg: vehicle_reg.trim(),
        vehicle_make: vehicle_make.trim(),
        vehicle_model: vehicle_model.trim(),
      });
    }

    return cleaned;
  } catch {
    return [];
  }
}

export function setCart(items: CartItem[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    emitCartUpdated();
  } catch {
    // ignore quota/private mode
  }
}

export function addToCart(item: CartItem): void {
  const nextItem: CartItem = {
    ...item,
    tyre_id: String(item.tyre_id).trim(),
    tyre_brand: String(item.tyre_brand ?? "").trim(),
    tyre_model: String(item.tyre_model ?? "").trim(),
    tyre_size: String(item.tyre_size ?? "").trim(),
    tyre_price: Number(item.tyre_price),
    tyre_quantity: clampQty(item.tyre_quantity),
    vehicle_reg: String(item.vehicle_reg).trim(),
    vehicle_make: String(item.vehicle_make ?? "").trim(),
    vehicle_model: String(item.vehicle_model ?? "").trim(),
  };

  if (!isBrowser()) return;
  if (!nextItem.tyre_id || !nextItem.vehicle_reg) return;
  if (!Number.isFinite(nextItem.tyre_price) || nextItem.tyre_price <= 0) return;

  const cart = getCart();
  const key = cartItemKey(nextItem);
  const idx = cart.findIndex((x) => cartItemKey(x) === key);

  if (idx >= 0) {
    const prev = cart[idx]!;
    cart[idx] = {
      ...prev,
      ...nextItem,
      tyre_quantity: clampQty(prev.tyre_quantity + nextItem.tyre_quantity),
    };
  } else {
    cart.push(nextItem);
  }

  setCart(cart);
}

export function updateCartItemQuantity(key: string, qty: number): void {
  if (!isBrowser()) return;
  const cart = getCart();
  const idx = cart.findIndex((x) => cartItemKey(x) === key);
  if (idx < 0) return;
  cart[idx] = { ...cart[idx]!, tyre_quantity: clampQty(qty) };
  setCart(cart);
}

export function removeCartItem(key: string): void {
  if (!isBrowser()) return;
  const cart = getCart().filter((x) => cartItemKey(x) !== key);
  setCart(cart);
}

export function clearCart(): void {
  if (!isBrowser()) return;
  setCart([]);
}

export function buildCheckoutUrlFromCartItem(item: CartItem): string {
  const qs = new URLSearchParams({
    tyre_id: String(item.tyre_id),
    tyre_brand: item.tyre_brand,
    tyre_model: item.tyre_model,
    tyre_size: item.tyre_size,
    tyre_price: String(item.tyre_price),
    tyre_quantity: String(item.tyre_quantity),
    vehicle_reg: item.vehicle_reg,
    vehicle_make: item.vehicle_make,
    vehicle_model: item.vehicle_model,
  });
  return `/checkout?${qs.toString()}`;
}

export function getCartCount(): number {
  const cart = getCart();
  return cart.reduce((sum, x) => sum + clampQty(x.tyre_quantity), 0);
}


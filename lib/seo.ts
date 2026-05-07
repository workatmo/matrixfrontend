import { publicAppUrl } from "@/lib/config";

export const seoKeywords = [
  "car tyres",
  "car tyres online UK",
  "buy car tyres online",
  "buy tyres online",
  "tyres online UK",
  "tyre fitting",
  "mobile tyre service",
  "mobile tyre fitting",
  "tyre fitting near me",
  "cheap tyres UK",
  "Tyres near me",
  "Buy tyres online UK",
  "Mobile tyre fitting",
  "Cheap tyres UK",
];

export const localSeoCities = [
  "london",
  "manchester",
  "birmingham",
  "leeds",
  "coventry",
];

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildTyreSlug(brand: string, model: string, size: string): string {
  return slugify(`${brand} ${model} ${size}`);
}

export function buildTyrePath(id: string | number, brand: string, model: string, size: string): string {
  return `/tyres/${id}-${buildTyreSlug(brand, model, size)}`;
}

export function buildCanonical(path: string): string {
  const base = publicAppUrl.replace(/\/$/, "");
  const nextPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${nextPath}`;
}

export function formatRegistrationSlug(registration: string): string {
  return registration.toLowerCase().replace(/\s+/g, "");
}

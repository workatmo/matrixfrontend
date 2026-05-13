const BRAND_NAME_STORAGE_KEY = "matrix-brand-name";
const BRAND_LOGO_STORAGE_KEY = "matrix-brand-logo-url";

function readCachedValue(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const value = window.localStorage.getItem(key)?.trim();
    return value || null;
  } catch {
    return null;
  }
}

function writeCachedValue(key: string, value: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (value) {
      window.localStorage.setItem(key, value);
    } else {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Browser storage can be unavailable in private modes; the live API value is enough.
  }
}

export function readCachedBrandName(): string | null {
  return readCachedValue(BRAND_NAME_STORAGE_KEY);
}

export function readCachedBrandLogoUrl(): string | null {
  return readCachedValue(BRAND_LOGO_STORAGE_KEY);
}

export function cacheBrandSettings(brandName: string | null, logoUrl: string | null): void {
  writeCachedValue(BRAND_NAME_STORAGE_KEY, brandName);
  writeCachedValue(BRAND_LOGO_STORAGE_KEY, logoUrl);
}

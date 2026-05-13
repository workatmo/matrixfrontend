"use client";

import { useEffect, useMemo, useState } from "react";
import {
  cacheBrandSettings,
  readCachedBrandLogoUrl,
  readCachedBrandName,
} from "@/lib/brand-settings-cache";
import { fetchPublicContactSource, parseBrandFromContactSource } from "@/lib/public-contact-brand";
import { resolvePublicLogoUrl } from "@/lib/resolve-public-logo-url";

export function usePublicBrandSettings() {
  // Avoid localStorage in useState initializers: server has no window, so hydration would mismatch.
  const [brandName, setBrandName] = useState("Matrix");
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);

  const logoSrc = useMemo(
    () => resolvePublicLogoUrl(brandLogoUrl) ?? "/brand-logo.svg",
    [brandLogoUrl]
  );

  useEffect(() => {
    const cachedName = readCachedBrandName();
    const cachedLogo = readCachedBrandLogoUrl();
    if (cachedName) {
      setBrandName(cachedName);
    }
    if (cachedLogo) {
      setBrandLogoUrl(cachedLogo);
    }

    void (async () => {
      const source = await fetchPublicContactSource();
      if (!source) {
        return;
      }
      const { brandName: nextName, brandLogoUrl: nextLogo } = parseBrandFromContactSource(source);
      if (nextName) {
        setBrandName(nextName);
      }
      setBrandLogoUrl(nextLogo);
      cacheBrandSettings(nextName, nextLogo);
    })();
  }, []);

  return { brandName, logoSrc };
}

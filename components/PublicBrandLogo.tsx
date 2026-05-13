"use client";

import { cn } from "@/lib/utils";
import { usePublicBrandSettings } from "@/lib/use-public-brand-settings";

type PublicBrandLogoProps = {
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function PublicBrandLogo({ className, imgClassName, priority }: PublicBrandLogoProps) {
  const { brandName, logoSrc } = usePublicBrandSettings();

  return (
    <span className={cn("inline-flex items-center", className)}>
      <img
        src={logoSrc}
        alt={`${brandName} logo`}
        width={220}
        height={51}
        className={cn("object-contain object-left", imgClassName)}
        decoding="async"
        {...(priority ? { fetchPriority: "high" as const } : {})}
      />
    </span>
  );
}

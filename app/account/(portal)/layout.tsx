"use client";

import { CustomerDataProvider } from "@/components/account/CustomerDataContext";
import { CustomerLayout } from "@/components/account/CustomerLayout";
import { getCustomerToken } from "@/lib/customer-api";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export default function AccountPortalLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }
    if (!getCustomerToken()) {
      router.replace("/account/login");
    }
  }, [mounted, router]);

  if (!mounted || !getCustomerToken()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        {!mounted ? "Loading…" : "Redirecting to sign in…"}
      </div>
    );
  }

  return (
    <CustomerDataProvider>
      <CustomerLayout>{children}</CustomerLayout>
    </CustomerDataProvider>
  );
}

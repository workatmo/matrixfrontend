"use client";

import { getAdminToken } from "@/lib/api";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isLogin = pathname === "/admin/login";
    const token = getAdminToken();

    if (isLogin) {
      if (token) {
        router.replace("/admin/dashboard");
        return;
      }
      queueMicrotask(() => setReady(true));
      return;
    }

    if (!token) {
      const next = encodeURIComponent(pathname || "/admin/dashboard");
      router.replace(`/admin/login?next=${next}`);
      return;
    }

    queueMicrotask(() => setReady(true));
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

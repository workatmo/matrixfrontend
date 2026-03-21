"use client";

import { checkAdminSessionWithApi, getAdminToken } from "@/lib/api";
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
    let cancelled = false;
    const isLogin = pathname === "/admin/login";
    const nextParam = encodeURIComponent(pathname || "/admin/dashboard");

    void (async () => {
      if (isLogin) {
        const token = getAdminToken();
        if (!token) {
          if (!cancelled) {
            setReady(true);
          }
          return;
        }
        const sessionOk = await checkAdminSessionWithApi();
        if (cancelled) {
          return;
        }
        if (sessionOk) {
          router.replace("/admin/dashboard");
          return;
        }
        setReady(true);
        return;
      }

      if (!getAdminToken()) {
        if (!cancelled) {
          router.replace(`/admin/login?next=${nextParam}`);
        }
        return;
      }

      const sessionOk = await checkAdminSessionWithApi();
      if (cancelled) {
        return;
      }

      if (!sessionOk || !getAdminToken()) {
        router.replace(`/admin/login?next=${nextParam}`);
        return;
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
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

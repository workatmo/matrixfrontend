"use client";

import { checkAdminSessionWithApi, getAdminToken, type AdminUserPayload } from "@/lib/api";
import { AuthProvider } from "@/components/admin/AuthContext";
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
  const [user, setUser] = useState<AdminUserPayload | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const isLogin = pathname === "/admin/login";
    const nextParam = encodeURIComponent(pathname || "/admin/dashboard");

    void (async () => {
      if (isLogin) {
        // Show the login form immediately — no waiting.
        if (!cancelled) setReady(true);

        // Fire-and-forget: if there's a live session, redirect to dashboard.
        const token = getAdminToken();
        if (!token) return;
        const profile = await checkAdminSessionWithApi();
        if (!cancelled && profile) {
          setUser(profile);
          router.replace("/admin/dashboard");
        }
        return;
      }

      // Protected pages: need a token first.
      if (!getAdminToken()) {
        if (!cancelled) router.replace(`/admin/login?next=${nextParam}`);
        return;
      }

      const profile = await checkAdminSessionWithApi();
      if (cancelled) return;

      if (!profile || !getAdminToken()) {
        router.replace(`/admin/login?next=${nextParam}`);
        return;
      }

      let denied = false;
      if (pathname !== "/admin/login" && profile.role?.name !== "super_admin") {
        const permissionMap: Record<string, string> = {
          "/admin/dashboard": "dashboard",
          "/admin/users": "customers",
          "/admin/vehicles": "vehicles",
          "/admin/orders": "orders",
          "/admin/tyres": "tyres",
          "/admin/attributes": "attributes",
          "/admin/fuel-efficiency": "attributes",
          "/admin/speed-rating": "attributes",
          "/admin/tyre-types": "attributes",
          "/admin/sizes": "attributes",
          "/admin/season": "attributes",
          "/admin/settings": "settings",
          "/admin/notifications": "notifications",
          "/admin/test-dvla": "test_dvla",
          "/admin/api-settings": "api_settings",
          "/admin/update": "update",
        };

        const match = Object.entries(permissionMap).find(([path]) => pathname.startsWith(path));
        if (match) {
          const requiredPerm = match[1];
          if (!profile.permissions?.includes(requiredPerm)) {
            denied = true;
          }
        }
      }

      if (denied) {
        setAccessDenied(true);
      }

      setUser(profile);
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

  if (accessDenied) {
    return (
      <div className="flex h-screen bg-background overflow-hidden items-center justify-center flex-col gap-4">
        <h1 className="text-3xl font-bold text-foreground">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <button
          onClick={() => {
            setAccessDenied(false);
            router.push("/admin/dashboard");
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <AuthProvider user={user}>{children}</AuthProvider>;
}

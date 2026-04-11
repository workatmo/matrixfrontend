"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "@/components/theme-provider";
import { customerLogout } from "@/lib/customer-api";
import { useCustomerData } from "@/components/account/CustomerDataContext";
import { cn } from "@/lib/utils";
import { ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { useState } from "react";

function titleForPath(pathname: string): string {
  if (pathname === "/account" || pathname === "/account/") {
    return "Overview";
  }
  if (pathname.startsWith("/account/profile")) {
    return "Profile";
  }
  if (pathname.startsWith("/account/orders")) {
    return "Orders";
  }
  if (pathname.startsWith("/account/payments")) {
    return "Payments";
  }
  return "My account";
}

export function CustomerHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const title = titleForPath(pathname);
  const { user } = useCustomerData();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = (resolvedTheme ?? "dark") === "dark";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await customerLogout();
    } catch {
      /* cleared in finally */
    } finally {
      setLoggingOut(false);
      setDropdownOpen(false);
      router.push("/account/login");
      router.refresh();
    }
  };

  return (
    <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 shrink-0 z-10">
      <div>
        <h1 className="text-foreground font-semibold text-lg">{title}</h1>
        <p className="text-muted-foreground text-xs">Customer portal</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="hidden sm:block text-left max-w-[160px]">
              <p className="text-foreground text-sm font-medium leading-none truncate">{user?.name || "Account"}</p>
              <p className="text-muted-foreground text-xs mt-0.5 truncate">{user?.email || ""}</p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                dropdownOpen && "rotate-180",
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-popover-foreground text-sm font-medium truncate">{user?.name || "Account"}</p>
                <p className="text-muted-foreground text-xs truncate">{user?.email || ""}</p>
              </div>
              <div className="p-1">
                <Link
                  href="/account/profile"
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

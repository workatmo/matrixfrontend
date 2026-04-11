"use client";

import { adminLogout } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, ChevronDown, LogOut, Moon, Sun, User } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAdminAuth } from "@/components/admin/AuthContext";

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Super Admin" }: HeaderProps) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { user } = useAdminAuth();
  // resolvedTheme is undefined until hydration; default to "dark" so icon renders immediately
  const isDark = (resolvedTheme ?? "dark") === "dark";

  return (
    <header className="h-16 bg-sidebar border-b border-sidebar-border flex items-center justify-between px-6 sticky top-0 z-10">
      {/* Left: Page title */}
      <div>
        <h1 className="text-foreground font-semibold text-lg">{title}</h1>
        <p className="text-muted-foreground text-xs">Super Administrator Panel</p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-foreground rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-8 h-8 bg-muted border border-border rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-foreground text-sm font-medium leading-none">{user?.name || "Admin"}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{user?.email || ""}</p>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-border">
                <p className="text-popover-foreground text-sm font-medium">{user?.name || "Admin User"}</p>
                <p className="text-muted-foreground text-xs">{user?.email || ""}</p>
              </div>
              <div className="p-1">
                <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => {
                    void (async () => {
                      setLoggingOut(true);
                      try {
                        await adminLogout();
                      } finally {
                        setDropdownOpen(false);
                        router.replace("/admin/login");
                        router.refresh();
                      }
                    })();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? "Signing out…" : "Logout"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setDropdownOpen(false)}
        />
      )}
    </header>
  );
}

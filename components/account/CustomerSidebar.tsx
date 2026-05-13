"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, CreditCard, LayoutDashboard, LogOut, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { customerLogout } from "@/lib/customer-api";
import { buttonVariants } from "@/components/ui/button";
import { usePublicBrandSettings } from "@/lib/use-public-brand-settings";

const nav = [
  { label: "Overview", href: "/account", icon: LayoutDashboard },
  { label: "Orders", href: "/account/orders", icon: Package },
  { label: "Payments", href: "/account/payments", icon: CreditCard },
  { label: "Profile", href: "/account/profile", icon: User },
] as const;

export function CustomerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { brandName, logoSrc } = usePublicBrandSettings();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (href: string) =>
    href === "/account" ? pathname === "/account" || pathname === "/account/" : pathname.startsWith(href);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await customerLogout();
    } catch {
      /* token cleared */
    } finally {
      setLoggingOut(false);
      router.push("/account/login");
      router.refresh();
    }
  };

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border min-h-[64px]">
        <Link
          href="/account"
          className={cn(
            "flex min-w-0 flex-1 items-center gap-3 rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring",
            collapsed && "justify-center gap-0"
          )}
        >
          <img
            src={logoSrc}
            alt={`${brandName} logo`}
            width={220}
            height={51}
            className={cn(
              "object-contain object-left",
              collapsed ? "h-8 w-8 max-h-8 max-w-8" : "h-9 w-auto max-w-[min(180px,72%)]"
            )}
            decoding="async"
          />
          {!collapsed && (
            <div className="min-w-0 flex flex-col gap-0.5">
              <span className="text-sidebar-foreground font-bold text-lg tracking-tight truncate">{brandName}</span>
              <span className="text-[10px] text-sidebar-foreground/50">My account</span>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className={cn("w-4 h-4 shrink-0", collapsed && "mx-auto")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border space-y-1">
        <Link
          href="/tyres"
          title={collapsed ? "Return to tyres" : undefined}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-accent-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3">Return to tyres</span>}
        </Link>
        <button
          type="button"
          title={collapsed ? "Sign out" : undefined}
          disabled={loggingOut}
          onClick={() => void handleLogout()}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive",
            collapsed && "justify-center px-0",
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span className="ml-3">{loggingOut ? "Signing out…" : "Sign out"}</span>}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-20 z-20 w-6 h-6 rounded-full bg-card border border-border shadow flex items-center justify-center text-muted-foreground hover:text-foreground"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>
    </aside>
  );
}

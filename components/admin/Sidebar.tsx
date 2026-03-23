"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Car,
  ShoppingCart,
  CircleDot,
  FileSearch,
  Settings2,
  Settings,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Zap,
  Tags,
} from "lucide-react";
import { useState, type ComponentType } from "react";
import { cn } from "@/lib/utils";
import packageJson from "@/package.json";
import { useAdminAuth } from "@/components/admin/AuthContext";

type NavChildItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

type NavItem = {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string }>;
  children?: NavChildItem[];
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Customers",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Vehicles",
    href: "/admin/vehicles",
    icon: Car,
  },
  {
    label: "Orders",
    href: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    label: "Tyres",
    href: "/admin/tyres",
    icon: CircleDot,
  },
  {
    label: "Attributes",
    icon: Tags,
    children: [
      { label: "Brand", href: "/admin/attributes/brand", icon: CircleDot },
      { label: "Size", href: "/admin/attributes/size", icon: CircleDot },
      { label: "Season", href: "/admin/attributes/season", icon: CircleDot },
      { label: "Tyre Type", href: "/admin/attributes/tyre-type", icon: CircleDot },
      { label: "Fuel Efficiency", href: "/admin/attributes/fuel-efficiency", icon: CircleDot },
      { label: "Speed Rating", href: "/admin/attributes/speed-rating", icon: CircleDot },
    ],
  },
  {
    label: "Test DVLA",
    href: "/admin/test-dvla",
    icon: FileSearch,
  },
  {
    label: "API Settings",
    href: "/admin/api-settings",
    icon: Settings2,
  },
  {
    label: "Update",
    href: "/admin/update",
    icon: RefreshCw,
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Attributes: true,
  });
  const { user } = useAdminAuth();

  const filteredNavItems = navItems.filter((item) => {
    const permissionMap: Record<string, string> = {
      Dashboard: "dashboard",
      Customers: "customers",
      Vehicles: "vehicles",
      Orders: "orders",
      Tyres: "tyres",
      Attributes: "attributes",
      Settings: "settings",
      "Test DVLA": "test_dvla",
      "API Settings": "api_settings",
      "Update": "update",
    };

    const requiredPerm = permissionMap[item.label];
    if (requiredPerm && user?.role?.name !== "super_admin") {
      if (!user?.permissions?.includes(requiredPerm)) {
        return false;
      }
    }
    return true;
  });

  return (
    <aside
      className={cn(
        "relative flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border min-h-[64px]">
        <div
          className="flex-shrink-0 w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center"
          title={collapsed ? `Matrix Admin v${packageJson.version}` : undefined}
        >
          <Zap className="w-4 h-4 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="min-w-0 flex flex-col gap-0.5">
            <span className="text-sidebar-foreground font-bold text-lg tracking-tight whitespace-nowrap overflow-hidden">
              Matrix Admin
            </span>
            <span
              className="text-[10px] tabular-nums text-sidebar-foreground/40 select-none"
              title={`Matrix Admin v${packageJson.version}`}
            >
              v{packageJson.version}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isGroup = !item.href && Array.isArray(item.children);
          const isActive = item.href
            ? pathname === item.href || pathname.startsWith(item.href + "/")
            : item.children?.some((child) => pathname === child.href || pathname.startsWith(child.href + "/")) ?? false;
          return (
            <div key={item.href ?? item.label} className="space-y-1">
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "flex-shrink-0 w-5 h-5 transition-colors",
                      isActive
                        ? "text-sidebar-primary-foreground"
                        : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  {!collapsed && (
                    <span className="whitespace-nowrap overflow-hidden">{item.label}</span>
                  )}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [item.label]: !prev[item.label],
                    }))
                  }
                  className={cn(
                    "group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="flex-shrink-0 w-5 h-5 text-sidebar-foreground/60" />
                  {!collapsed && (
                    <>
                      <span className="whitespace-nowrap overflow-hidden text-left flex-1">{item.label}</span>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          openGroups[item.label] && "rotate-90"
                        )}
                      />
                    </>
                  )}
                </button>
              )}

              {!collapsed && isGroup && openGroups[item.label] && (
                <div className="ml-6 space-y-1">
                  {item.children?.map((child) => {
                    const ChildIcon = child.icon;
                    const childActive = pathname === child.href || pathname.startsWith(child.href + "/");
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200",
                          childActive
                            ? "bg-sidebar-primary text-sidebar-primary-foreground"
                            : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        )}
                      >
                        <ChildIcon
                          className={cn(
                            "flex-shrink-0 w-4 h-4 transition-colors",
                            childActive
                              ? "text-sidebar-primary-foreground"
                              : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                          )}
                        />
                        <span className="whitespace-nowrap overflow-hidden">{child.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Collapse */}
      <div className="border-t border-sidebar-border p-3">
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 text-sm"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

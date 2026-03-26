"use client";

import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/admin/Layout";
import StatCard from "@/components/admin/StatCard";
import {
  Users,
  ShoppingCart,
  Car,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency } from "@/lib/formatters";
import {
  getAdminDashboardStats,
  type AdminDashboardStats,
  type AdminDashboardRecentOrder,
} from "@/lib/api";
import Link from "next/link";

const statusStyles: Record<string, string> = {
  completed:  "text-emerald-500 bg-emerald-500/10",
  processing: "text-blue-500 bg-blue-500/10",
  pending:    "text-yellow-500 bg-yellow-500/10",
  cancelled:  "text-red-500 bg-red-500/10",
};

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <DashboardContent />
    </AdminLayout>
  );
}

function DashboardContent() {
  const { settings } = useSettings();

  const [data, setData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAdminDashboardStats();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Stat cards (computed from API) ──────────────────────────────────────────
  const stats = data
    ? [
        {
          title: "Total Users",
          value: data.stats.total_users.toLocaleString(),
          icon: Users,
          description: "registered customers",
        },
        {
          title: "Total Orders",
          value: data.stats.total_orders.toLocaleString(),
          icon: ShoppingCart,
          description: `${data.order_stats.pending} pending`,
        },
        {
          title: "Total Vehicles",
          value: data.stats.total_vehicles.toLocaleString(),
          icon: Car,
          description: "registered vehicles",
        },
        {
          title: "Revenue",
          value: formatCurrency(data.stats.total_revenue, settings?.currency),
          icon: DollarSign,
          description: "from completed orders",
        },
      ]
    : [];

  // ── Bar-chart heights relative to max ────────────────────────────────────
  const maxCount = data
    ? Math.max(...data.orders_per_day.map((d) => d.count), 1)
    : 1;

  return (
    <>
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button
              onClick={fetchData}
              className="ml-auto underline hover:no-underline text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Stat Cards ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl p-5 h-28 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.title} {...stat} />
            ))}
          </div>
        )}

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity Overview — orders per day */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-foreground font-semibold">Orders This Week</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Last 7 days</p>
              </div>
              {data && (
                <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                  <TrendingUp className="w-3 h-3" />
                  {data.stats.total_orders} total
                </div>
              )}
            </div>

            {/* Bar Chart */}
            {loading ? (
              <div className="h-32 flex items-end gap-2 animate-pulse">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-foreground/10 rounded-t-md"
                    style={{ height: `${30 + i * 8}%` }}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-end gap-2 h-32">
                  {(data?.orders_per_day ?? []).map((day) => {
                    const pct = Math.max((day.count / maxCount) * 100, 4);
                    return (
                      <div
                        key={day.date}
                        className="flex-1 flex flex-col items-center gap-1 group"
                        title={`${day.label}: ${day.count} orders`}
                      >
                        <div
                          className="w-full bg-foreground/10 hover:bg-primary/60 rounded-t-md transition-colors cursor-default"
                          style={{ height: `${pct}%` }}
                        />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2">
                  {(data?.orders_per_day ?? []).map((day) => (
                    <span
                      key={day.date}
                      className="text-xs text-muted-foreground/60 flex-1 text-center"
                    >
                      {day.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-foreground font-semibold">Order Status</h3>
            {loading ? (
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-5 bg-foreground/10 rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "Pending",    key: "pending",    icon: Activity,      color: "text-yellow-500" },
                  { label: "Processing", key: "processing", icon: Activity,      color: "text-blue-500" },
                  { label: "Completed",  key: "completed",  icon: CheckCircle2,  color: "text-emerald-500" },
                  { label: "Cancelled",  key: "cancelled",  icon: AlertCircle,   color: "text-red-500" },
                ].map((item) => {
                  const Icon = item.icon;
                  const count = data?.order_stats[item.key as keyof typeof data.order_stats] ?? 0;
                  return (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${item.color}`} />
                        <span className="text-muted-foreground text-sm">{item.label}</span>
                      </div>
                      <span className={`text-xs font-semibold ${item.color}`}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Recent Orders Table ── */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-foreground font-semibold">Recent Orders</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Latest 5 orders</p>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
            >
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-5 space-y-3 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 bg-foreground/10 rounded" />
              ))}
            </div>
          ) : !data?.recent_orders.length ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              No orders yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Order ID", "Customer", "Vehicle", "Status", "Amount"].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recent_orders.map((order: AdminDashboardRecentOrder) => (
                    <tr
                      key={order.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-5 py-3.5 text-sm text-muted-foreground font-mono">
                        {order.order_ref}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground">
                        {order.customer}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {order.vehicle}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                            statusStyles[order.status] ?? "text-muted-foreground bg-muted"
                          }`}
                        >
                          {capitalize(order.status)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground font-medium">
                        {formatCurrency(order.amount, settings?.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

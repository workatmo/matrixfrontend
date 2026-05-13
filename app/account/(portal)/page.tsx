"use client";

import { useCustomerData } from "@/components/account/CustomerDataContext";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatCard from "@/components/admin/StatCard";
import {
  buildOrdersPerDayBuckets,
  countOrdersByStatus,
  totalSpentFromPaidOrders,
  unpaidOrdersCount,
} from "@/lib/customer-dashboard";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

export default function CustomerOverviewPage() {
  const { user, ordersAll, ordersPaid, loading, error, reload } = useCustomerData();

  const buckets = buildOrdersPerDayBuckets(ordersAll, 14);
  const maxCount = Math.max(...buckets.map((d) => d.count), 1);
  const statusCounts = countOrdersByStatus(ordersAll);
  const totalSpent = totalSpentFromPaidOrders(ordersPaid);
  const awaiting = unpaidOrdersCount(ordersAll, ordersPaid);

  return (
    <div className="w-full space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back{user?.name ? `, ${user.name}` : ""}! Here&apos;s a snapshot of your account.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button type="button" onClick={() => void reload()} className="ml-auto underline hover:no-underline text-xs">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5 h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total orders"
            value={ordersAll.length}
            icon={ShoppingCart}
            description="all bookings"
          />
          <StatCard
            title="Total spent"
            value={formatCurrency(totalSpent.toString())}
            icon={DollarSign}
            description="paid orders"
          />
          <StatCard
            title="Paid orders"
            value={ordersPaid.length}
            icon={CreditCard}
            description="completed payment"
          />
          <StatCard
            title="Awaiting payment"
            value={awaiting}
            icon={Package}
            description="unpaid or pending"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-foreground font-semibold">Orders over time</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Last 14 days (by booking date)</p>
            </div>
            {ordersAll.length > 0 && (
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                {ordersAll.length} total
              </div>
            )}
          </div>

          {loading ? (
            <div className="h-32 flex items-end gap-2 animate-pulse">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="flex-1 bg-foreground/10 rounded-t-md" style={{ height: `${20 + (i % 5) * 10}%` }} />
              ))}
            </div>
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-32">
                {buckets.map((day) => {
                  const pct = Math.max((day.count / maxCount) * 100, day.count > 0 ? 8 : 4);
                  return (
                    <div key={day.date} className="flex-1 flex flex-col items-center gap-1 group min-w-0">
                      <div
                        className="w-full bg-foreground/10 hover:bg-primary/60 rounded-t-md transition-colors cursor-default"
                        style={{ height: `${pct}%` }}
                        title={`${day.date}: ${day.count}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between mt-2 gap-0.5 overflow-x-auto">
                {buckets.map((day) => (
                  <span key={day.date} className="text-[10px] text-muted-foreground/60 flex-1 text-center min-w-0 truncate">
                    {day.label}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-foreground font-semibold">Order status</h3>
          {loading ? (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 bg-foreground/10 rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {[
                { label: "Pending", key: "pending" as const, icon: Activity, color: "text-yellow-500" },
                { label: "Processing", key: "processing" as const, icon: Activity, color: "text-blue-500" },
                { label: "Completed", key: "completed" as const, icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Cancelled", key: "cancelled" as const, icon: AlertCircle, color: "text-red-500" },
              ].map((item) => {
                const Icon = item.icon;
                const count = statusCounts[item.key] ?? 0;
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-lg">Recent orders</CardTitle>
            <CardDescription>Your last 3 bookings.</CardDescription>
          </div>
          <Link href="/account/orders" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            View all
          </Link>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!loading && ordersAll.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No orders yet.</p>
          ) : loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading…</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Tyres</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersAll.slice(0, 3).map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                      {o.created_at ? formatLocalizedDate(o.created_at) : "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-sm font-medium line-clamp-1">
                        {o.tyre_brand} {o.tyre_model}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{o.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

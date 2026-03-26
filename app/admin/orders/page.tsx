"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/Layout";
import {
  Search, Filter, MoreHorizontal, ShoppingCart, Clock, CheckCircle, XCircle, Loader2, Trash2,
} from "lucide-react";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import {
  listAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  AdminOrderItem,
  AdminOrderStats,
  AdminOrderStatus,
} from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  completed:  "text-emerald-500 bg-emerald-500/10",
  processing: "text-blue-500 bg-blue-500/10",
  pending:    "text-yellow-500 bg-yellow-500/10",
  cancelled:  "text-red-500 bg-red-500/10",
};

const STATUS_LABELS: Record<string, string> = {
  completed:  "Completed",
  processing: "Processing",
  pending:    "Pending",
  cancelled:  "Cancelled",
};

const ALL_STATUSES: AdminOrderStatus[] = ["pending", "processing", "completed", "cancelled"];

export default function OrdersPage() {
  return (
    <AdminLayout title="Orders">
      <OrdersContent />
    </AdminLayout>
  );
}

function OrdersContent() {
  const { settings } = useSettings();

  const [orders, setOrders]     = useState<AdminOrderItem[]>([]);
  const [stats, setStats]       = useState<AdminOrderStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatus | "">("");
  const [showFilter, setShowFilter]     = useState(false);
  const [actionMenu, setActionMenu]     = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (q: string, st: AdminOrderStatus | "") => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminOrders({ search: q, status: st });
      setOrders(result.orders);
      setStats(result.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders("", "");
  }, [fetchOrders]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchOrders(value, statusFilter);
    }, 400);
  };

  const handleStatusFilter = (st: AdminOrderStatus | "") => {
    setStatusFilter(st);
    setShowFilter(false);
    fetchOrders(search, st);
  };

  const handleChangeStatus = async (id: number, status: AdminOrderStatus) => {
    setActionLoading(id);
    setActionMenu(null);
    try {
      const updated = await updateAdminOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      // refresh stats
      fetchOrders(search, statusFilter);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this order? This cannot be undone.")) return;
    setActionLoading(id);
    setActionMenu(null);
    try {
      await deleteAdminOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      fetchOrders(search, statusFilter);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete order.");
    } finally {
      setActionLoading(null);
    }
  };

  const statsCards = [
    { label: "Total Orders",  value: stats?.total      ?? "—", icon: ShoppingCart },
    { label: "Pending",       value: stats?.pending     ?? "—", icon: Clock },
    { label: "Processing",    value: stats?.processing  ?? "—", icon: Clock },
    { label: "Completed",     value: stats?.completed   ?? "—", icon: CheckCircle },
  ];

  const vehicleLabel = (o: AdminOrderItem) => {
    const parts = [o.vehicle_registration, o.vehicle_make, o.vehicle_model].filter(Boolean);
    return parts.length ? parts.join(" · ") : "—";
  };

  return (
    <>
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Orders</h2>
            <p className="text-muted-foreground text-sm mt-1">Track and manage all customer orders</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live updating
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by customer, vehicle or service…"
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilter((p) => !p)}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4" />
              {statusFilter ? STATUS_LABELS[statusFilter] : "Filter by status"}
            </button>
            {showFilter && (
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => handleStatusFilter("")}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${!statusFilter ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  All statuses
                </button>
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusFilter(s)}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${statusFilter === s ? "text-foreground font-medium" : "text-muted-foreground"}`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statsCards.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-xl">
                    {loading ? <span className="inline-block w-8 h-5 bg-muted animate-pulse rounded" /> : s.value}
                  </p>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <XCircle className="w-8 h-8 text-red-500" />
              <p className="text-sm text-red-500 font-medium">{error}</p>
              <button
                onClick={() => fetchOrders(search, statusFilter)}
                className="text-xs px-4 py-2 bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Order ID", "Customer", "Vehicle", "Service", "Date", "Amount", "Status", ""].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-5 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShoppingCart className="w-8 h-8 text-muted-foreground/40" />
                          <p className="text-sm text-muted-foreground">No orders found.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-accent/30 transition-colors ${actionLoading === order.id ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        <td className="px-5 py-4 text-sm text-muted-foreground font-mono">#{String(order.id).padStart(3, "0")}</td>
                        <td className="px-5 py-4">
                          <p className="text-sm text-foreground">{order.user?.name ?? "—"}</p>
                          {order.user?.email && (
                            <p className="text-xs text-muted-foreground/60">{order.user.email}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{vehicleLabel(order)}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{order.service_type}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground/60">
                          {formatLocalizedDate(order.created_at ?? "", settings?.timezone)}
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground font-medium">
                          {formatCurrency(order.amount, settings?.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="relative">
                            {actionLoading === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                            ) : (
                              <button
                                onClick={() => setActionMenu(actionMenu === order.id ? null : order.id)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                            )}
                            {actionMenu === order.id && (
                              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                                <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
                                  Change Status
                                </p>
                                {ALL_STATUSES.filter((s) => s !== order.status).map((s) => (
                                  <button
                                    key={s}
                                    onClick={() => handleChangeStatus(order.id, s)}
                                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                  >
                                    Mark {STATUS_LABELS[s]}
                                  </button>
                                ))}
                                <div className="border-t border-border" />
                                <button
                                  onClick={() => handleDelete(order.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Delete Order
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Close action menu on outside click */}
      {actionMenu !== null && (
        <div className="fixed inset-0 z-10" onClick={() => setActionMenu(null)} />
      )}
      {showFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
      )}
    </>
  );
}

"use client";

import { toast } from "sonner";

import { useEffect, useState, useCallback, useRef } from "react";
import AdminLayout from "@/components/admin/Layout";
import {
  Search, Filter, MoreHorizontal, ShoppingCart, Clock, CheckCircle, XCircle, Loader2, Trash2, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import {
  listAdminOrders,
  updateAdminOrderStatus,
  deleteAdminOrder,
  updateAdminOrder,
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
type AdminOrderPaymentFilter = "" | "paid" | "not_paid";

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
  const [paymentFilter, setPaymentFilter] = useState<AdminOrderPaymentFilter>("");
  const [showFilter, setShowFilter]     = useState(false);
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [actionMenu, setActionMenu]     = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<AdminOrderItem | null>(null);
  const [editForm, setEditForm] = useState({
    vehicle_registration: "",
    vehicle_make: "",
    vehicle_model: "",
    service_type: "",
    tyre_brand: "",
    tyre_model: "",
    tyre_size: "",
    tyre_quantity: 1,
    amount: "",
    status: "pending" as AdminOrderStatus,
    notes: "",
  });
  const [editSaving, setEditSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<number | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (
    q: string,
    st: AdminOrderStatus | "",
    payment: AdminOrderPaymentFilter,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminOrders({ search: q, status: st, payment });
      setOrders(result.orders);
      setStats(result.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders("", "", "");
  }, [fetchOrders]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      fetchOrders(value, statusFilter, paymentFilter);
    }, 400);
  };

  const handleStatusFilter = (st: AdminOrderStatus | "") => {
    setStatusFilter(st);
    setShowFilter(false);
    fetchOrders(search, st, paymentFilter);
  };

  const handlePaymentFilter = (payment: AdminOrderPaymentFilter) => {
    setPaymentFilter(payment);
    setShowPaymentFilter(false);
    fetchOrders(search, statusFilter, payment);
  };

  const handleChangeStatus = async (id: number, status: AdminOrderStatus) => {
    setActionLoading(id);
    setActionMenu(null);
    try {
      const updated = await updateAdminOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      // refresh stats
      fetchOrders(search, statusFilter, paymentFilter);
      toast.success(`Order marked as ${STATUS_LABELS[status]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update status.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingOrderId(id);
    setDeleteDialogOpen(true);
    setActionMenu(null);
  };

  const confirmDelete = async () => {
    if (!deletingOrderId) return;
    const id = deletingOrderId;
    setDeleteDialogOpen(false);
    setActionLoading(id);
    try {
      await deleteAdminOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      fetchOrders(search, statusFilter, paymentFilter);
      toast.success("Order deleted successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete order.");
    } finally {
      setActionLoading(null);
      setDeletingOrderId(null);
    }
  };

  const openEdit = (order: AdminOrderItem) => {
    setEditingOrder(order);
    setEditForm({
      vehicle_registration: order.vehicle_registration || "",
      vehicle_make: order.vehicle_make || "",
      vehicle_model: order.vehicle_model || "",
      service_type: order.service_type || "",
      tyre_brand: order.tyre_brand || "",
      tyre_model: order.tyre_model || "",
      tyre_size: order.tyre_size || "",
      tyre_quantity: order.tyre_quantity || 1,
      amount: order.amount.toString(),
      status: order.status,
      notes: order.notes || "",
    });
    setEditDialogOpen(true);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setEditingOrder(null);
  };

  const handleEditSave = async () => {
    if (!editingOrder) return;
    setEditSaving(true);
    try {
      const updated = await updateAdminOrder(editingOrder.id, {
        vehicle_registration: editForm.vehicle_registration || null,
        vehicle_make: editForm.vehicle_make || null,
        vehicle_model: editForm.vehicle_model || null,
        service_type: editForm.service_type,
        tyre_brand: editForm.tyre_brand || null,
        tyre_model: editForm.tyre_model || null,
        tyre_size: editForm.tyre_size || null,
        tyre_quantity: editForm.tyre_quantity || 1,
        amount: parseFloat(editForm.amount) || 0,
        status: editForm.status,
        notes: editForm.notes || null,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      fetchOrders(search, statusFilter, paymentFilter);
      toast.success("Order updated successfully.");
      closeEditDialog();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update order.");
    } finally {
      setEditSaving(false);
    }
  };

  const statsCards = [
    { label: "Total Orders",  value: stats?.total      ?? "—", icon: ShoppingCart },
    { label: "Pending",       value: stats?.pending     ?? "—", icon: Clock },
    { label: "Processing",    value: stats?.processing  ?? "—", icon: Clock },
    { label: "Completed",     value: stats?.completed   ?? "—", icon: CheckCircle },
  ];

  const vehicleLabel = (o: AdminOrderItem) => {
    const normalized = [o.vehicle_registration, o.vehicle_make, o.vehicle_model]
      .map((value) => value?.trim())
      .filter((value) => {
        if (!value) return false;
        const lowered = value.toLowerCase();
        return (
          lowered !== "unknown" &&
          lowered !== "n/a" &&
          lowered !== "na" &&
          lowered !== "-" &&
          lowered !== "browsing mode"
        );
      });

    return normalized.length ? normalized.join(" · ") : "N/A";
  };

  const isOrderPaid = (o: AdminOrderItem) =>
    Boolean(o.paid_at) ||
    ["paid", "succeeded", "completed", "captured"].includes((o.payment_status ?? "").toLowerCase()) ||
    o.status === "completed";

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
              onClick={() => {
                setShowFilter((p) => !p);
                setShowPaymentFilter(false);
              }}
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
          <div className="relative">
            <button
              onClick={() => {
                setShowPaymentFilter((p) => !p);
                setShowFilter(false);
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:border-ring hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4" />
              {paymentFilter === "paid" ? "Paid" : paymentFilter === "not_paid" ? "Not Paid" : "Filter by payment"}
            </button>
            {showPaymentFilter && (
              <div className="absolute right-0 mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
                <button
                  onClick={() => handlePaymentFilter("")}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${!paymentFilter ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  All payments
                </button>
                <button
                  onClick={() => handlePaymentFilter("paid")}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${paymentFilter === "paid" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Paid
                </button>
                <button
                  onClick={() => handlePaymentFilter("not_paid")}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${paymentFilter === "not_paid" ? "text-foreground font-medium" : "text-muted-foreground"}`}
                >
                  Not Paid
                </button>
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
                    {["Order ID", "Customer", "Vehicle", "Tyres", "Qty", "Slot", "Date", "Amount", "Payment", "Status", "Actions"].map((h) => (
                      <th key={h} className={h === "Actions" ? "px-5 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider" : "px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading && orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-5 py-16 text-center">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-5 py-16 text-center">
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
                          {order.user?.phone && (
                            <p className="text-xs text-muted-foreground/60">{order.user.phone}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{vehicleLabel(order)}</td>
                        <td className="px-5 py-4">
                          {order.tyre_size ? (
                            <span className="text-sm font-medium text-foreground">{order.tyre_size}</span>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-foreground">
                          {order.tyre_quantity || "—"}
                        </td>
                        <td className="px-5 py-4">
                          {order.slot ? (
                            <>
                              <p className="text-sm text-foreground capitalize">{order.slot.day}</p>
                              <p className="text-xs text-muted-foreground">{order.slot.start_time} - {order.slot.end_time}</p>
                            </>
                          ) : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground/60">
                          {formatLocalizedDate(order.created_at ?? "", settings?.timezone)}
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground font-medium">
                          {formatCurrency(order.amount, settings?.currency)}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${isOrderPaid(order) ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                            {isOrderPaid(order) ? "Paid" : "Not Paid"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status]}`}>
                            {STATUS_LABELS[order.status]}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 justify-end relative">
                            {actionLoading === order.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground mx-auto" />
                            ) : (
                              <>
                                <button
                                  onClick={() => openEdit(order)}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                  title="Edit Order"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(order.id)}
                                  className="p-1.5 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                                  title="Delete Order"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="relative">
                                  <button
                                    onClick={() => setActionMenu(actionMenu === order.id ? null : order.id)}
                                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                    title="Change Status"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  {actionMenu === order.id && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-lg z-20 overflow-hidden">
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
                                    </div>
                                  )}
                                </div>
                              </>
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
      {showPaymentFilter && (
        <div className="fixed inset-0 z-10" onClick={() => setShowPaymentFilter(false)} />
      )}

      {/* Edit Order Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="sm:max-w-[600px] bg-card border border-border">
          <DialogHeader>
            <DialogTitle>Edit Order #{String(editingOrder?.id).padStart(3, "0")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Registration</Label>
                <Input
                  value={editForm.vehicle_registration}
                  onChange={(e) => setEditForm({ ...editForm, vehicle_registration: e.target.value })}
                  placeholder="e.g. AB12 CDE"
                />
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input
                  value={editForm.service_type}
                  onChange={(e) => setEditForm({ ...editForm, service_type: e.target.value })}
                  placeholder="e.g. Tyre Fitting"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vehicle Make</Label>
                <Input
                  value={editForm.vehicle_make}
                  onChange={(e) => setEditForm({ ...editForm, vehicle_make: e.target.value })}
                  placeholder="e.g. Ford"
                />
              </div>
              <div className="space-y-2">
                <Label>Vehicle Model</Label>
                <Input
                  value={editForm.vehicle_model}
                  onChange={(e) => setEditForm({ ...editForm, vehicle_model: e.target.value })}
                  placeholder="e.g. Fiesta"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tyre Brand</Label>
                <Input
                  value={editForm.tyre_brand}
                  onChange={(e) => setEditForm({ ...editForm, tyre_brand: e.target.value })}
                  placeholder="e.g. Pirelli"
                />
              </div>
              <div className="space-y-2">
                <Label>Tyre Model</Label>
                <Input
                  value={editForm.tyre_model}
                  onChange={(e) => setEditForm({ ...editForm, tyre_model: e.target.value })}
                  placeholder="e.g. Eco Grip"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tyre Size</Label>
                <Input
                  value={editForm.tyre_size}
                  onChange={(e) => setEditForm({ ...editForm, tyre_size: e.target.value })}
                  placeholder="e.g. 205/55 R16"
                />
              </div>
              <div className="space-y-2">
                <Label>Tyre Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={editForm.tyre_quantity}
                  onChange={(e) => setEditForm({ ...editForm, tyre_quantity: parseInt(e.target.value) || 1 })}
                  placeholder="Qty"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as AdminOrderStatus })}
                  className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring transition-colors"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                value={editForm.notes}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="w-full bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-ring transition-colors min-h-[80px]"
                placeholder="Order notes..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeEditDialog} type="button">
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving} type="button">
              {editSaving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={(open) => !open && setDeleteDialogOpen(false)}>
        <DialogContent className="bg-card border border-border sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Order</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-sm text-muted-foreground">
            Are you sure you want to delete this order? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} type="button">
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

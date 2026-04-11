"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CreditCard, Loader2, ReceiptText } from "lucide-react";
import AdminLayout from "@/components/admin/Layout";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import { listAdminOrders, type AdminOrderItem } from "@/lib/api";

type PaymentFilter = "" | "paid" | "not_paid";

function isOrderPaid(order: AdminOrderItem): boolean {
  return (
    Boolean(order.paid_at) ||
    ["paid", "succeeded", "completed", "captured"].includes((order.payment_status ?? "").toLowerCase()) ||
    order.status === "completed"
  );
}

function parseOrderAmount(amount: string): number {
  const parsed = Number.parseFloat(amount);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function PaymentsPage() {
  return (
    <AdminLayout title="Payments">
      <PaymentsContent />
    </AdminLayout>
  );
}

function PaymentsContent() {
  const { settings } = useSettings();
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("");

  const fetchPayments = useCallback(async (payment: PaymentFilter) => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdminOrders({ payment, per_page: 100 });
      setOrders(result.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments(paymentFilter);
  }, [fetchPayments, paymentFilter]);

  const totalPaid = orders.filter(isOrderPaid).reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);
  const totalUnpaid = orders.filter((order) => !isOrderPaid(order)).reduce((sum, order) => sum + parseOrderAmount(order.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Payments</h2>
          <p className="text-sm text-muted-foreground mt-1">Track paid and unpaid order amounts.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <ReceiptText className="w-4 h-4" />
          <span>{orders.length} orders</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Paid Total</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">{formatCurrency(totalPaid, settings?.currency)}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Unpaid Total</p>
          <p className="text-2xl font-bold text-rose-500 mt-1">{formatCurrency(totalUnpaid, settings?.currency)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {[
          { key: "" as PaymentFilter, label: "All" },
          { key: "paid" as PaymentFilter, label: "Paid" },
          { key: "not_paid" as PaymentFilter, label: "Not Paid" },
        ].map((opt) => (
          <button
            key={opt.label}
            onClick={() => setPaymentFilter(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
              paymentFilter === opt.key
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {error ? (
          <div className="py-16 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Order", "Customer", "Amount", "Provider", "Payment Status", "Paid At", "Action"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center">
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mx-auto" />
                    </td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-sm text-muted-foreground">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  orders.map((order) => {
                    const paid = isOrderPaid(order);
                    return (
                      <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-mono text-muted-foreground">#{String(order.id).padStart(3, "0")}</td>
                        <td className="px-5 py-4 text-sm text-foreground">{order.user?.name ?? "Guest"}</td>
                        <td className="px-5 py-4 text-sm text-foreground font-medium">
                          {formatCurrency(parseOrderAmount(order.amount), settings?.currency)}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground capitalize">
                          {order.payment_provider ?? "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${paid ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"}`}>
                            {paid ? "Paid" : "Not Paid"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {order.paid_at ? formatLocalizedDate(order.paid_at, settings?.timezone) : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            href="/admin/orders"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Open Orders
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

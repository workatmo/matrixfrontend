import type { CustomerOrder } from "@/lib/customer-api";

export function customerSlotLabel(order: CustomerOrder): string {
  const s = order.slot;
  if (!s) {
    return "—";
  }
  const day = s.day ? `${s.day.charAt(0).toUpperCase()}${s.day.slice(1)}` : "";
  return [day, s.start_time, s.end_time].filter(Boolean).join(" · ");
}

/** YYYY-MM-DD keys for last `days` days ending today (UTC date from created_at). */
export function buildOrdersPerDayBuckets(orders: CustomerOrder[], days = 14): { date: string; label: string; count: number }[] {
  const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const buckets: { date: string; label: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const date = `${y}-${m}-${day}`;
    buckets.push({
      date,
      label: labels[d.getDay()] ?? "",
      count: 0,
    });
  }
  const keySet = new Set(buckets.map((b) => b.date));
  for (const o of orders) {
    if (!o.created_at) {
      continue;
    }
    const created = new Date(o.created_at);
    const y = created.getFullYear();
    const mo = String(created.getMonth() + 1).padStart(2, "0");
    const da = String(created.getDate()).padStart(2, "0");
    const date = `${y}-${mo}-${da}`;
    if (!keySet.has(date)) {
      continue;
    }
    const b = buckets.find((x) => x.date === date);
    if (b) {
      b.count += 1;
    }
  }
  return buckets;
}

export function countOrdersByStatus(orders: CustomerOrder[]): Record<string, number> {
  const out: Record<string, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };
  for (const o of orders) {
    const s = (o.status || "").toLowerCase();
    if (s in out) {
      out[s] += 1;
    }
  }
  return out;
}

export function totalSpentFromPaidOrders(ordersPaid: CustomerOrder[]): number {
  return ordersPaid.reduce((acc, o) => acc + parseFloat(String(o.amount ?? "0")), 0);
}

export function unpaidOrdersCount(ordersAll: CustomerOrder[], ordersPaid: CustomerOrder[]): number {
  const paid = new Set(ordersPaid.map((o) => o.id));
  return ordersAll.filter((o) => !paid.has(o.id)).length;
}

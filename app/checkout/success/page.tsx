"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type PublicOrder = {
  id: number;
  amount: string;
  status: string;
  payment_provider: string | null;
  payment_status: string;
  paid_at: string | null;
};

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<PublicOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let t: ReturnType<typeof setTimeout> | null = null;

    async function poll() {
      if (!orderId) {
        setLoading(false);
        setMsg("Missing order id.");
        return;
      }
      try {
        const res = await fetch(`/api/public/orders/${orderId}`, { cache: "no-store" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json?.message || "Failed to load order status.");
        }
        const o = (json?.data?.order as PublicOrder) ?? null;
        if (!alive) return;
        setOrder(o);
        setLoading(false);
        if (o?.payment_status !== "paid") {
          t = setTimeout(poll, 1500);
        }
      } catch (e) {
        if (!alive) return;
        setLoading(false);
        setMsg(e instanceof Error ? e.message : "Failed to load order.");
      }
    }

    void poll();
    return () => {
      alive = false;
      if (t) clearTimeout(t);
    };
  }, [orderId]);

  const paid = order?.payment_status === "paid";

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">
          {paid ? "Payment successful" : loading ? "Finalizing payment…" : "Payment pending"}
        </h1>
        {msg ? <p className="text-sm text-red-600">{msg}</p> : null}
        {order ? (
          <div className="text-left bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500">Order</span>
              <span className="font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Total</span>
              <span className="font-bold">£{Number(order.amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Status</span>
              <span className="font-medium">{order.payment_status}</span>
            </div>
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <Button onClick={() => router.push("/")}>Return to Home</Button>
          {!paid && orderId ? (
            <Button variant="outline" onClick={() => router.push(`/checkout?resume_order=${orderId}`)}>
              Back to checkout
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}


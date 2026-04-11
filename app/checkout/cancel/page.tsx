"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function CheckoutCancelContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-200 max-w-md w-full text-center space-y-4">
        <h1 className="text-2xl font-bold">Payment cancelled</h1>
        <p className="text-neutral-600 text-sm">
          Your booking was created, but payment was not completed.
        </p>

        <div className="flex flex-col gap-2">
          {orderId ? (
            <Button onClick={() => router.push(`/checkout?resume_order=${orderId}`)}>
              Try payment again
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => router.push("/")}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-neutral-500 text-sm">
          Loading…
        </div>
      }
    >
      <CheckoutCancelContent />
    </Suspense>
  );
}

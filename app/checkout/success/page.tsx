"use client";

import { Suspense } from "react";
import CheckoutSuccessClient from "./CheckoutSuccessClient";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-neutral-500 text-sm">
          Loading…
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}

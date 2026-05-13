"use client";

import type { ReactNode } from "react";
import { CustomerHeader } from "@/components/account/CustomerHeader";
import { CustomerSidebar } from "@/components/account/CustomerSidebar";

export function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <CustomerSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <CustomerHeader />
        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-muted/30">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AdminLayout from "@/components/admin/Layout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import TyreForm from "./TyreForm";

export default function TyreCreatePage() {
  return (
    <AdminLayout title="Create Tyre">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Create Tyre</h2>
            <p className="mt-1 text-sm text-muted-foreground">Add a new tyre with catalogue and stock details.</p>
          </div>
          <Link
            href="/admin/tyres"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-border"
            )}
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Tyres
          </Link>
        </div>

        <TyreForm />
      </div>
    </AdminLayout>
  );
}

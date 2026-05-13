"use client";

import { useCustomerData } from "@/components/account/CustomerDataContext";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { customerSlotLabel } from "@/lib/customer-dashboard";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import Link from "next/link";
import { Package } from "lucide-react";

export default function CustomerOrdersPage() {
  const { ordersAll, loading } = useCustomerData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Order history</h2>
        <p className="text-muted-foreground text-sm mt-1">All bookings linked to your email address.</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
          ) : ordersAll.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">You have no orders yet.</p>
              <Link href="/tyres" className={cn(buttonVariants({ variant: "outline" }), "mt-4 inline-flex")}>
                Browse tyres
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/50">
                  <TableHead className="py-4">Date</TableHead>
                  <TableHead className="py-4">Tyres</TableHead>
                  <TableHead className="py-4">Fitting</TableHead>
                  <TableHead className="py-4">Slot</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="py-4">Payment</TableHead>
                  <TableHead className="text-right py-4">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersAll.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-sm">
                      {o.created_at ? formatLocalizedDate(o.created_at) : "—"}
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="text-sm font-medium line-clamp-2">
                        {o.tyre_brand} {o.tyre_model}
                      </div>
                      <div className="text-xs text-muted-foreground border mt-1 inline-block px-1.5 py-0.5 rounded-sm">
                        {o.tyre_size} × {o.tyre_quantity}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.fitting_date ? formatLocalizedDate(`${o.fitting_date}T12:00:00Z`) : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[140px]">{customerSlotLabel(o)}</TableCell>
                    <TableCell className="text-sm capitalize font-medium">{o.status}</TableCell>
                    <TableCell className="text-sm capitalize">{o.payment_status ?? "—"}</TableCell>
                    <TableCell className="text-right font-medium tabular-nums">{formatCurrency(o.amount)}</TableCell>
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

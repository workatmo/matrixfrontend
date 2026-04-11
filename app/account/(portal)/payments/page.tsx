"use client";

import { useCustomerData } from "@/components/account/CustomerDataContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatLocalizedDate } from "@/lib/formatters";
import { CreditCard } from "lucide-react";

export default function CustomerPaymentsPage() {
  const { ordersPaid, loading } = useCustomerData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Payment history</h2>
        <p className="text-muted-foreground text-sm mt-1">Completed payments for your orders.</p>
      </div>

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {loading ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading…</p>
          ) : ordersPaid.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">You have no completed payments yet.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 border-b border-border/50">
                  <TableHead className="py-4">Paid</TableHead>
                  <TableHead className="py-4">Order</TableHead>
                  <TableHead className="py-4">Method</TableHead>
                  <TableHead className="py-4">Status</TableHead>
                  <TableHead className="text-right py-4">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersPaid.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {o.paid_at ? formatLocalizedDate(o.paid_at) : "—"}
                    </TableCell>
                    <TableCell className="text-sm font-medium">#{o.id}</TableCell>
                    <TableCell className="text-sm capitalize">{o.payment_provider ?? "—"}</TableCell>
                    <TableCell className="text-sm capitalize text-emerald-500 font-medium">
                      {o.payment_status ?? "—"}
                    </TableCell>
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

"use client";

import { useCallback, useEffect, useState } from "react";
import { Ticket, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createAdminCoupon,
  deleteAdminCoupon,
  listAdminCoupons,
  updateAdminCoupon,
  type AdminCouponItem,
  type AdminCouponPayload,
} from "@/lib/api";

type FormState = {
  title: string;
  description: string;
  code: string;
  discount_type: "amount" | "percentage";
  discount_value: number;
  status: boolean;
};

const DEFAULT_FORM: FormState = {
  title: "",
  description: "",
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  status: true,
};

export default function CouponsPage() {
  const [rows, setRows] = useState<AdminCouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminCoupons();
      setRows(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load coupons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons();
  }, [loadCoupons]);

  const editingItem = editingId === null ? null : rows.find((x) => x.id === editingId) ?? null;

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminCouponItem) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      description: row.description ?? "",
      code: row.code,
      discount_type: row.discount_type,
      discount_value: row.discount_value,
      status: row.status,
    });
    setDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setForm(DEFAULT_FORM);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.code.trim() || form.discount_value < 0) {
      toast.error("Please fill in all required fields correctly.");
      return;
    }

    setSaving(true);
    try {
      const payload: AdminCouponPayload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        code: form.code.trim().toUpperCase(),
        discount_type: form.discount_type,
        discount_value: Number(form.discount_value),
        status: form.status,
      };

      if (editingId === null) {
        const created = await createAdminCoupon(payload);
        setRows((prev) => [created, ...prev]);
        toast.success("Coupon created.");
      } else {
        const updated = await updateAdminCoupon(editingId, payload);
        setRows((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Coupon updated.");
      }

      closeDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save coupon.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AdminCouponItem) => {
    const confirmed = window.confirm(`Delete coupon "${row.title}"?`);
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteAdminCoupon(row.id);
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      toast.success("Coupon deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete coupon.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Coupons">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Coupons</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage discount coupons and promotional codes.
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Coupon
          </Button>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              Coupon List
            </CardTitle>
            <CardDescription>Create, edit, and delete coupons.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Discount Type</TableHead>
                    <TableHead>Discount Value</TableHead>
                    <TableHead className="w-24 text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-sm text-muted-foreground">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading coupons…
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-sm text-muted-foreground text-center">
                        No coupons yet. Click &ldquo;Add Coupon&rdquo; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        {/* Code */}
                        <TableCell className="font-semibold text-primary">
                          {row.code}
                        </TableCell>
                        {/* Title */}
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {row.title}
                        </TableCell>
                        {/* Discount Type */}
                        <TableCell className="capitalize">
                          {row.discount_type}
                        </TableCell>
                        {/* Discount Value */}
                        <TableCell>
                          {row.discount_type === "percentage" ? `${parseFloat(String(row.discount_value))}%` : `£${parseFloat(String(row.discount_value)).toFixed(2)}`}
                        </TableCell>
                        {/* Active */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row.status
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.status ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1 w-full">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(row)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => void handleDelete(row)}
                              disabled={deletingId === row.id}
                              title="Delete"
                            >
                              {deletingId === row.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-destructive" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-destructive" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Coupon" : "Add Coupon"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="coupon-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coupon-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Summer Sale 20% Off"
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="coupon-description">Description</Label>
              <Textarea
                id="coupon-description"
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Details about the coupon..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="coupon-code">
                  Coupon Code <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="coupon-code"
                  value={form.code}
                  onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER20"
                />
              </div>

              {/* Discount Type */}
              <div className="space-y-2">
                <Label htmlFor="coupon-type">
                  Discount Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.discount_type}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, discount_type: value as "amount" | "percentage" }))
                  }
                >
                  <SelectTrigger id="coupon-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amount">Fixed Amount (£)</SelectItem>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label htmlFor="coupon-value">
                Discount Value <span className="text-destructive">*</span>
              </Label>
              <Input
                id="coupon-value"
                type="number"
                min="0"
                step="0.01"
                value={form.discount_value}
                onChange={(e) => setForm((prev) => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                placeholder={form.discount_type === "amount" ? "e.g. 10.00" : "e.g. 20"}
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-4">
              <div>
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-muted-foreground">Is this coupon currently usable?</p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, status: checked }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !form.title.trim() || !form.code.trim()}
            >
              {saving ? "Saving…" : editingItem ? "Update Coupon" : "Create Coupon"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

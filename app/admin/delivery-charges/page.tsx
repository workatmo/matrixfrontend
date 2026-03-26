"use client";

import { useCallback, useEffect, useState } from "react";
import { Truck, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  listAdminDeliveryCharges,
  createAdminDeliveryCharge,
  updateAdminDeliveryCharge,
  deleteAdminDeliveryCharge,
  type AdminDeliveryChargeItem,
} from "@/lib/api";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency } from "@/lib/formatters";

// ────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────

type FormState = {
  from: string;
  to: string;
  charge: string;
  status: boolean;
};

const DEFAULT_FORM: FormState = {
  from: "",
  to: "",
  charge: "",
  status: true,
};

// ────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────

export default function DeliveryChargesPage() {
  const [rows, setRows] = useState<AdminDeliveryChargeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // ── Exactly the same pattern as Dashboard / Orders pages ──
  const { settings } = useSettings();
  // Guard against empty string from DB ("") — settings?.currency could be "" not null
  const currency = settings?.currency || "GBP";

  // ── Load ──────────────────────────────────────────────────

  const loadCharges = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminDeliveryCharges();
      setRows(items);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load delivery charges."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCharges();
  }, [loadCharges]);

  // ── open / close helpers ──────────────────────────────────

  const editingItem =
    editingId === null ? null : (rows.find((r) => r.id === editingId) ?? null);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminDeliveryChargeItem) => {
    setEditingId(row.id);
    setForm({
      from: String(row.from_distance),
      to: String(row.to_distance),
      charge: String(row.charge),
      status: row.status === "active",
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

  // ── Save ──────────────────────────────────────────────────

  const handleSave = async () => {
    const fromVal = parseFloat(form.from);
    const toVal = parseFloat(form.to);
    const chargeVal = parseFloat(form.charge);

    if (
      form.from.trim() === "" ||
      form.to.trim() === "" ||
      form.charge.trim() === ""
    ) {
      toast.error("All fields are required.");
      return;
    }
    if (isNaN(fromVal) || isNaN(toVal) || isNaN(chargeVal)) {
      toast.error("Please enter valid numbers.");
      return;
    }
    if (fromVal < 0 || toVal <= 0 || chargeVal < 0) {
      toast.error("Values must be positive.");
      return;
    }
    if (fromVal >= toVal) {
      toast.error("'From' must be less than 'To'.");
      return;
    }

    const payload = {
      from_distance: fromVal,
      to_distance: toVal,
      charge: chargeVal,
      status: (form.status ? "active" : "inactive") as "active" | "inactive",
    };

    setSaving(true);
    try {
      if (editingId === null) {
        const created = await createAdminDeliveryCharge(payload);
        setRows((prev) =>
          [...prev, created].sort((a, b) => a.from_distance - b.from_distance)
        );
        toast.success("Delivery charge range added.");
      } else {
        const updated = await updateAdminDeliveryCharge(editingId, payload);
        setRows((prev) =>
          prev
            .map((r) => (r.id === editingId ? updated : r))
            .sort((a, b) => a.from_distance - b.from_distance)
        );
        toast.success("Delivery charge range updated.");
      }
      closeDialog(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save delivery charge."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────

  const handleDelete = async (row: AdminDeliveryChargeItem) => {
    const confirmed = window.confirm(
      `Delete range ${row.from_distance}–${row.to_distance} miles?`
    );
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteAdminDeliveryCharge(row.id);
      setRows((prev) => prev.filter((r) => r.id !== row.id));
      toast.success("Delivery charge range deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to delete delivery charge."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────────────────────────

  return (
    <AdminLayout title="Delivery Charges">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Delivery Charges
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Define delivery fees based on distance ranges (miles).
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Range
          </Button>
        </div>

        {/* Info banner */}
        <div className="rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground flex items-start gap-3">
          <Truck className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <span>
            Ranges must not overlap. When a customer&apos;s delivery distance is
            calculated, the system will match it to the correct range and apply
            the charge automatically.
          </span>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              Charge Ranges
            </CardTitle>
            <CardDescription>
              Create, edit, and delete distance-based delivery charges.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Range (miles)</TableHead>
                    <TableHead>Charge</TableHead>
                    <TableHead className="w-28 text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-sm text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading delivery charges…
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="h-24 text-sm text-muted-foreground text-center"
                      >
                        No delivery charge ranges yet. Click &ldquo;Add
                        Range&rdquo; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        {/* Range */}
                        <TableCell className="font-semibold">
                          {row.from_distance} – {row.to_distance} miles
                        </TableCell>

                        {/* Charge — formatted exactly like Dashboard / Orders */}
                        <TableCell className="font-medium text-primary">
                          {formatCurrency(Number(row.charge), currency)}
                        </TableCell>

                        {/* Status badge */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1">
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

      {/* ── Add / Edit Dialog ────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Delivery Range" : "Add Delivery Range"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* From & To */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dc-from">
                  From Distance (miles){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dc-from"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 0"
                  value={form.from}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, from: e.target.value }))
                  }
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dc-to">
                  To Distance (miles){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dc-to"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="e.g. 5"
                  value={form.to}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, to: e.target.value }))
                  }
                />
              </div>
            </div>

            {/* Charge */}
            <div className="space-y-2">
              <Label htmlFor="dc-charge">
                Charge Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="dc-charge"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5.00"
                value={form.charge}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, charge: e.target.value }))
                }
              />
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3 mt-2">
              <div>
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-muted-foreground">
                  Should this range be used for delivery pricing?
                </p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, status: checked }))
                }
              />
            </div>

            {/* Live preview */}
            {form.from !== "" && form.to !== "" && form.charge !== "" && (
              <div className="rounded-lg bg-muted/50 border border-border px-4 py-3 text-sm">
                <span className="font-medium">Preview: </span>
                {form.from}–{form.to} miles →{" "}
                <span className="text-primary font-semibold">
                  {formatCurrency(parseFloat(form.charge || "0"), currency)}
                </span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
            >
              {saving
                ? "Saving…"
                : editingItem
                  ? "Update Range"
                  : "Add Range"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

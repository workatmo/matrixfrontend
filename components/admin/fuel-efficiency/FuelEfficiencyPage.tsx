"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import FuelEfficiencyFormDialog from "./FuelEfficiencyFormDialog";
import FuelEfficiencyTable from "./FuelEfficiencyTable";
import type { FuelEfficiency, FuelEfficiencyDraft } from "./types";
import {
  bulkDeleteAdminFuelEfficiencies,
  createAdminFuelEfficiency,
  deleteAdminFuelEfficiency,
  downloadFuelEfficiencyTemplate,
  exportFuelEfficiencies,
  importFuelEfficienciesFile,
  listAdminFuelEfficiencies,
  updateAdminFuelEfficiency,
} from "@/lib/api";

const DEFAULT_DRAFT: FuelEfficiencyDraft = {
  rating: "",
  description: "",
  status: "active",
};

export default function FuelEfficiencyPage() {
  const [rows, setRows] = useState<FuelEfficiency[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadFuelEfficiencies = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminFuelEfficiencies();
      setRows(items);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load fuel efficiency ratings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFuelEfficiencies();
  }, [loadFuelEfficiencies]);

  const editingItem = useMemo(
    () => (editingId === null ? null : rows.find((x) => x.id === editingId) ?? null),
    [editingId, rows]
  );

  const initialValues: FuelEfficiencyDraft = editingItem
    ? {
        rating: editingItem.rating,
        description: editingItem.description ?? "",
        status: editingItem.status,
      }
    : DEFAULT_DRAFT;

  const handleAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: FuelEfficiency) => {
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (item: FuelEfficiency) => {
    const confirmed = window.confirm(`Delete fuel efficiency rating "${item.rating}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await deleteAdminFuelEfficiency(item.id);
      setRows((prev) => prev.filter((x) => x.id !== item.id));
      if (editingId === item.id) {
        setEditingId(null);
        setDialogOpen(false);
      }
      toast.success("Fuel efficiency rating deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete fuel efficiency rating.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (values: FuelEfficiencyDraft) => {
    if (!values.rating) return;
    setSaving(true);
    try {
      if (editingId === null) {
        const created = await createAdminFuelEfficiency({
          rating: values.rating,
          description: values.description || null,
          status: values.status,
        });
        setRows((prev) => [...prev, created].sort((a, b) => a.rating.localeCompare(b.rating)));
        toast.success("Fuel efficiency rating added.");
      } else {
        const updated = await updateAdminFuelEfficiency(editingId, {
          rating: values.rating,
          description: values.description || null,
          status: values.status,
        });
        setRows((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Fuel efficiency rating updated.");
      }

      setDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save fuel efficiency rating.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected rating(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminFuelEfficiencies(selectedIds);
      await loadFuelEfficiencies();
      toast.success(`Deleted ${selectedIds.length} rating(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete ratings.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadFuelEfficiencyTemplate("xlsx");
      toast.success("Template downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download template.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExport = async () => {
    setDownloading("export");
    try {
      await exportFuelEfficiencies("xlsx");
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export ratings.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importFuelEfficienciesFile(file);
      await loadFuelEfficiencies();
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import ratings.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Fuel Efficiency">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Fuel Efficiency</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage fuel efficiency ratings for tyre labels.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" disabled={downloading !== null || importing} onClick={() => void handleDownloadTemplate()}>
              {downloading === "template" ? "Downloading..." : "Template"}
            </Button>
            <Button type="button" variant="outline" disabled={downloading !== null || importing} onClick={() => void handleExport()}>
              {downloading === "export" ? "Exporting..." : "Export"}
            </Button>
            <Button type="button" variant="outline" disabled={importing || downloading !== null} onClick={() => fileInputRef.current?.click()}>
              {importing ? "Importing..." : "Import File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                void handleImport(file);
                e.currentTarget.value = "";
              }}
            />
            <Button type="button" onClick={handleAdd}>
              Add Rating
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button
              type="button"
              variant="destructive"
              disabled={bulkBusy}
              onClick={() => void handleBulkDelete()}
            >
              Bulk Delete
            </Button>
          </div>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Fuel Efficiency</CardTitle>
              <CardDescription className="mt-1">
                Add, edit, bulk delete, import, and export fuel ratings.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading fuel efficiency ratings...
                </div>
              ) : (
                <FuelEfficiencyTable
                  rows={rows}
                  onEdit={handleEdit}
                  onDelete={(item) => {
                    if (deletingId !== null) return;
                    void handleDelete(item);
                  }}
                  selectedIds={selectedIds}
                  onToggleAll={(checked) => {
                    if (!checked) {
                      setSelectedIds([]);
                      return;
                    }
                    setSelectedIds(rows.map((x) => x.id));
                  }}
                  onToggleOne={(id, checked) => {
                    setSelectedIds((prev) => {
                      if (checked) return prev.includes(id) ? prev : [...prev, id];
                      return prev.filter((x) => x !== id);
                    });
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <FuelEfficiencyFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        mode={editingId === null ? "add" : "edit"}
        editingId={editingId}
        existing={rows}
        initialValues={initialValues}
        onSave={(values) => {
          if (saving) return;
          void handleSave(values);
        }}
      />
    </AdminLayout>
  );
}


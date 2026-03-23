"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import TyreTypeFormDialog from "./TyreTypeFormDialog";
import TyreTypeTable from "./TyreTypeTable";
import type { TyreType, TyreTypeDraft } from "./types";
import {
  bulkDeleteAdminTyreTypes,
  bulkUpdateAdminTyreTypes,
  createAdminTyreType,
  deleteAdminTyreType,
  downloadTyreTypeTemplate,
  exportTyreTypes,
  importTyreTypesFile,
  listAdminTyreTypes,
  updateAdminTyreType,
} from "@/lib/api";

const DEFAULT_DRAFT: TyreTypeDraft = {
  name: "",
  description: "",
  status: "active",
};

export default function TyreTypePage() {
  const [items, setItems] = useState<TyreType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const [importing, setImporting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadTyreTypes = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAdminTyreTypes();
      setItems(rows);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load tyre types.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTyreTypes();
  }, [loadTyreTypes]);

  const editingItem = useMemo(
    () => (editingId === null ? null : items.find((x) => x.id === editingId) ?? null),
    [editingId, items]
  );

  const initialValues: TyreTypeDraft = editingItem
    ? {
        name: editingItem.name,
        description: editingItem.description ?? "",
        status: editingItem.status,
      }
    : DEFAULT_DRAFT;

  const handleAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: TyreType) => {
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (item: TyreType) => {
    const confirmed = window.confirm(`Delete tyre type "${item.name}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await deleteAdminTyreType(item.id);
      setItems((prev) => prev.filter((x) => x.id !== item.id));
      if (editingId === item.id) {
        setEditingId(null);
        setDialogOpen(false);
      }
      toast.success("Tyre type deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete tyre type.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (values: TyreTypeDraft) => {
    setSaving(true);
    try {
      if (editingId === null) {
        const created = await createAdminTyreType(values);
        setItems((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Tyre type added.");
      } else {
        const updated = await updateAdminTyreType(editingId, values);
        setItems((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Tyre type updated.");
      }
      setDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save tyre type.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkStatus = async (status: "active" | "inactive") => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkUpdateAdminTyreTypes(selectedIds, status);
      await loadTyreTypes();
      toast.success(`Updated ${selectedIds.length} tyre type(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk update tyre types.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected tyre type(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminTyreTypes(selectedIds);
      await loadTyreTypes();
      toast.success(`Deleted ${selectedIds.length} tyre type(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete tyre types.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadTyreTypeTemplate("xlsx");
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
      await exportTyreTypes("xlsx");
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export tyre types.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importTyreTypesFile(file);
      await loadTyreTypes();
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import tyre types.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Tyre Types">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tyre Types</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage tyre type options for catalogue matching.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="outline" disabled={downloading !== null || importing} onClick={() => void handleDownloadTemplate()}>
              {downloading === "template" ? "Downloading..." : "Template"}
            </Button>
            <Button type="button" variant="outline" disabled={downloading !== null || importing} onClick={() => void handleExport()}>
              {downloading === "export" ? "Exporting..." : "Export"}
            </Button>
            <Button type="button" variant="outline" disabled={importing || downloading !== null} onClick={() => document.getElementById("tyre-type-import-input")?.click()}>
              {importing ? "Importing..." : "Import File"}
            </Button>
            <input
              id="tyre-type-import-input"
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
            <Button
              type="button"
              onClick={handleAdd}
              className="bg-white text-black hover:bg-white/90"
            >
              Add Tyre Type
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#1f1f1f] bg-black text-white p-3">
            <span className="text-sm text-white/80">{selectedIds.length} selected</span>
            <Button
              type="button"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => void handleBulkStatus("active")}
              className="border-[#1f1f1f] text-white hover:bg-white/10"
            >
              Set Active
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => void handleBulkStatus("inactive")}
              className="border-[#1f1f1f] text-white hover:bg-white/10"
            >
              Set Inactive
            </Button>
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

        <Card className="bg-black text-white border-[#1f1f1f] rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white">Tyre Types</CardTitle>
              <CardDescription className="text-white/70 mt-1">
                Add, edit, bulk update, import, and export tyre types.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-[#1f1f1f] overflow-hidden">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-white/70 p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading tyre types...
                </div>
              ) : (
                <TyreTypeTable
                  tyreTypes={items}
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
                    setSelectedIds(items.map((x) => x.id));
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

      <TyreTypeFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingId(null);
        }}
        mode={editingId === null ? "add" : "edit"}
        editingId={editingId}
        existing={items}
        initialValues={initialValues}
        onSave={(values) => {
          if (saving) return;
          void handleSave(values);
        }}
      />
    </AdminLayout>
  );
}


"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import SizeFormDialog from "./SizeFormDialog";
import SizeTable from "./SizeTable";
import type { Size } from "./types";
import {
  bulkDeleteAdminSizes,
  bulkUpdateAdminSizes,
  createAdminSize,
  deleteAdminSize,
  downloadSizeTemplate,
  exportSizes,
  importSizesFile,
  listAdminSizes,
  updateAdminSize,
} from "@/lib/api";
import { Loader2 } from "lucide-react";

const EMPTY_DRAFT = { width: "", profile: "", rim: "" } as const;

export default function SizePage() {
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDraft, setBulkDraft] = useState<{ width: string; profile: string; rim: string }>({
    width: "",
    profile: "",
    rim: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<{ width: string; profile: string; rim: string }>(EMPTY_DRAFT);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadSizes = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAdminSizes();
      setSizes(rows);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load sizes.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSizes();
  }, [loadSizes]);

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (size: Size) => {
    setMode("edit");
    setEditingId(size.id);
    setDraft({
      width: String(size.width),
      profile: String(size.profile),
      rim: String(size.rim),
    });
    setDialogOpen(true);
  };

  const handleDelete = async (size: Size) => {
    const confirmed = window.confirm(`Delete size "${size.label}"?`);
    if (!confirmed) return;

    setDeletingId(size.id);
    try {
      await deleteAdminSize(size.id);
      setSizes((prev) => prev.filter((s) => s.id !== size.id));
      setSelectedIds((prev) => prev.filter((id) => id !== size.id));
      if (editingId === size.id) {
        setDialogOpen(false);
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
      }
      toast.success("Size deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete size.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected size(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminSizes(selectedIds);
      await loadSizes();
      toast.success(`Deleted ${selectedIds.length} size(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete sizes.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkEdit = async () => {
    if (selectedIds.length === 0) return;

    const payload: { width?: number; profile?: number; rim?: number } = {};
    if (bulkDraft.width.trim() !== "") payload.width = Number(bulkDraft.width);
    if (bulkDraft.profile.trim() !== "") payload.profile = Number(bulkDraft.profile);
    if (bulkDraft.rim.trim() !== "") payload.rim = Number(bulkDraft.rim);

    const hasAny = payload.width !== undefined || payload.profile !== undefined || payload.rim !== undefined;
    if (!hasAny) {
      toast.error("Enter at least one field (width/profile/rim) for bulk edit.");
      return;
    }
    if (
      (payload.width !== undefined && (!Number.isInteger(payload.width) || payload.width < 1)) ||
      (payload.profile !== undefined && (!Number.isInteger(payload.profile) || payload.profile < 1)) ||
      (payload.rim !== undefined && (!Number.isInteger(payload.rim) || payload.rim < 1))
    ) {
      toast.error("Bulk edit values must be positive whole numbers.");
      return;
    }

    setBulkBusy(true);
    try {
      await bulkUpdateAdminSizes(selectedIds, payload);
      await loadSizes();
      setBulkDraft({ width: "", profile: "", rim: "" });
      toast.success(`Updated ${selectedIds.length} size(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk edit sizes.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleSave = async (values: { width: number; profile: number; rim: number; label: string }) => {
    setSaving(true);
    try {
      if (mode === "edit" && editingId !== null) {
        const updated = await updateAdminSize(editingId, values);
        setSizes((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        toast.success("Size updated.");
      } else {
        const created = await createAdminSize(values);
        setSizes((prev) => [...prev, created].sort((a, b) => a.label.localeCompare(b.label)));
        toast.success("Size added.");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save size.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadSizeTemplate("xlsx");
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
      await exportSizes("xlsx");
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export sizes.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importSizesFile(file);
      await loadSizes();
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import sizes.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Sizes">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Sizes</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage tyre size catalogue for matching.</p>
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
            <Button type="button" onClick={openAdd}>
              Add Size
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="rounded-lg border border-border p-3 space-y-3">
            <div className="text-sm text-muted-foreground">{selectedIds.length} selected</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input
                type="number"
                placeholder="Width (optional)"
                value={bulkDraft.width}
                onChange={(e) => setBulkDraft((prev) => ({ ...prev, width: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Profile (optional)"
                value={bulkDraft.profile}
                onChange={(e) => setBulkDraft((prev) => ({ ...prev, profile: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Rim (optional)"
                value={bulkDraft.rim}
                onChange={(e) => setBulkDraft((prev) => ({ ...prev, rim: e.target.value }))}
              />
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={bulkBusy} onClick={() => void handleBulkEdit()}>
                  Bulk Edit
                </Button>
                <Button type="button" variant="destructive" disabled={bulkBusy} onClick={() => void handleBulkDelete()}>
                  Bulk Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Size List</CardTitle>
            <CardDescription>
              Add/Edit/Delete sizes. Duplicate sizes are blocked (frontend check).
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-xl border border-border">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading sizes...
                </div>
              ) : (
                <SizeTable
                  sizes={sizes}
                  onEdit={openEdit}
                  onDelete={(size) => {
                    if (deletingId) return;
                    void handleDelete(size);
                  }}
                  selectedIds={selectedIds}
                  onToggleAll={(checked) => {
                    if (!checked) {
                      setSelectedIds([]);
                      return;
                    }
                    setSelectedIds(sizes.map((s) => s.id));
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

        <SizeFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={mode}
          editingSizeId={editingId}
          existingSizes={sizes}
          initialValues={draft}
          onSave={(values) => {
            if (saving) return;
            void handleSave(values);
          }}
        />
      </div>
    </AdminLayout>
  );
}


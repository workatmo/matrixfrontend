"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SpeedRatingFormDialog from "./SpeedRatingFormDialog";
import SpeedRatingTable from "./SpeedRatingTable";
import type { SpeedRating, SpeedRatingDraft } from "./types";
import {
  bulkDeleteAdminSpeedRatings,
  createAdminSpeedRating,
  deleteAdminSpeedRating,
  downloadSpeedRatingTemplate,
  exportSpeedRatings,
  importSpeedRatingsFile,
  listAdminSpeedRatings,
  updateAdminSpeedRating,
} from "@/lib/api";

const DEFAULT_DRAFT: SpeedRatingDraft = {
  rating: "",
  maxSpeed: "",
  description: "",
  status: "active",
};

export default function SpeedRatingPage() {
  const [rows, setRows] = useState<SpeedRating[]>([]);
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

  const loadSpeedRatings = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminSpeedRatings();
      setRows(
        items.map((item) => ({
          id: item.id,
          rating: item.rating,
          maxSpeed: item.max_speed,
          description: item.description,
          status: item.status,
        }))
      );
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load speed ratings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSpeedRatings();
  }, [loadSpeedRatings]);

  const editingItem = useMemo(
    () => (editingId === null ? null : rows.find((x) => x.id === editingId) ?? null),
    [editingId, rows]
  );

  const initialValues: SpeedRatingDraft = editingItem
    ? {
        rating: editingItem.rating,
        maxSpeed: String(editingItem.maxSpeed),
        description: editingItem.description ?? "",
        status: editingItem.status,
      }
    : DEFAULT_DRAFT;

  const handleAdd = () => {
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (item: SpeedRating) => {
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (item: SpeedRating) => {
    const confirmed = window.confirm(`Delete speed rating "${item.rating}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    try {
      await deleteAdminSpeedRating(item.id);
      setRows((prev) => prev.filter((x) => x.id !== item.id));
      if (editingId === item.id) {
        setEditingId(null);
        setDialogOpen(false);
      }
      toast.success("Speed rating deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete speed rating.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (values: SpeedRatingDraft) => {
    const parsedMaxSpeed = Number(values.maxSpeed);
    if (!values.rating || !Number.isFinite(parsedMaxSpeed) || parsedMaxSpeed <= 0) return;

    setSaving(true);
    try {
      if (editingId === null) {
        const created = await createAdminSpeedRating({
          rating: values.rating,
          max_speed: Math.round(parsedMaxSpeed),
          description: values.description || null,
          status: values.status,
        });
        setRows((prev) => [
          ...prev,
          {
            id: created.id,
            rating: created.rating,
            maxSpeed: created.max_speed,
            description: created.description,
            status: created.status,
          },
        ]);
        toast.success("Speed rating added.");
      } else {
        const updated = await updateAdminSpeedRating(editingId, {
          rating: values.rating,
          max_speed: Math.round(parsedMaxSpeed),
          description: values.description || null,
          status: values.status,
        });
        setRows((prev) =>
          prev.map((x) =>
            x.id === editingId
              ? {
                  id: updated.id,
                  rating: updated.rating,
                  maxSpeed: updated.max_speed,
                  description: updated.description,
                  status: updated.status,
                }
              : x
          )
        );
        toast.success("Speed rating updated.");
      }

      setDialogOpen(false);
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save speed rating.");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected speed rating(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminSpeedRatings(selectedIds);
      await loadSpeedRatings();
      toast.success(`Deleted ${selectedIds.length} speed rating(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete speed ratings.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadSpeedRatingTemplate("xlsx");
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
      await exportSpeedRatings("xlsx");
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export speed ratings.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importSpeedRatingsFile(file);
      await loadSpeedRatings();
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import speed ratings.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Speed Rating">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Speed Rating</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage speed ratings for tyre fitment logic.</p>
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
              <CardTitle>Speed Rating</CardTitle>
              <CardDescription className="mt-1">
                Add, edit, bulk delete, import, and export speed ratings.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading speed ratings...
                </div>
              ) : (
                <SpeedRatingTable
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

      <SpeedRatingFormDialog
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


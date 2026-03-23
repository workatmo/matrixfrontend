"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import SeasonFormDialog from "./SeasonFormDialog";
import SeasonTable from "./SeasonTable";
import type { Season, SeasonDraft } from "./types";
import {
  bulkDeleteAdminSeasons,
  bulkUpdateAdminSeasons,
  createAdminSeason,
  deleteAdminSeason,
  downloadSeasonTemplate,
  exportSeasons,
  importSeasonsFile,
  listAdminSeasons,
  updateAdminSeason,
} from "@/lib/api";

const EMPTY_DRAFT: SeasonDraft = {
  name: "",
  description: "",
  status: "active",
};

export default function SeasonPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const [importing, setImporting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SeasonDraft>(EMPTY_DRAFT);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadSeasons = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAdminSeasons();
      setSeasons(rows);
      setSelectedIds([]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load seasons.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSeasons();
  }, [loadSeasons]);

  const openAdd = () => {
    setMode("add");
    setEditingId(null);
    setDraft(EMPTY_DRAFT);
    setDialogOpen(true);
  };

  const openEdit = (season: Season) => {
    setMode("edit");
    setEditingId(season.id);
    setDraft({
      name: season.name,
      description: season.description ?? "",
      status: season.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (season: Season) => {
    const confirmed = window.confirm(`Delete season "${season.name}"?`);
    if (!confirmed) return;

    setDeletingId(season.id);
    try {
      await deleteAdminSeason(season.id);
      setSeasons((prev) => prev.filter((s) => s.id !== season.id));
      setSelectedIds((prev) => prev.filter((id) => id !== season.id));
      if (editingId === season.id) {
        setDialogOpen(false);
        setEditingId(null);
        setDraft(EMPTY_DRAFT);
      }
      toast.success("Season deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete season.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkStatus = async (status: "active" | "inactive") => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkUpdateAdminSeasons(selectedIds, status);
      await loadSeasons();
      toast.success(`Updated ${selectedIds.length} season(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk update seasons.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected season(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminSeasons(selectedIds);
      await loadSeasons();
      toast.success(`Deleted ${selectedIds.length} season(s).`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete seasons.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleSave = async (values: SeasonDraft) => {
    setSaving(true);
    try {
      if (mode === "edit" && editingId !== null) {
        const updated = await updateAdminSeason(editingId, values);
        setSeasons((prev) => prev.map((s) => (s.id === editingId ? updated : s)));
        toast.success("Season updated.");
      } else {
        const created = await createAdminSeason(values);
        setSeasons((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        toast.success("Season added.");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save season.");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadSeasonTemplate("xlsx");
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
      await exportSeasons("xlsx");
      toast.success("Export downloaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export seasons.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importSeasonsFile(file);
      await loadSeasons();
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import seasons.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <AdminLayout title="Season">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Season</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage season names for tyre fitment logic.</p>
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
              Add Season
            </Button>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button
              type="button"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => void handleBulkStatus("active")}
            >
              Set Active
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={bulkBusy}
              onClick={() => void handleBulkStatus("inactive")}
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

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Season List</CardTitle>
            <CardDescription>Add, edit, and delete seasons.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="rounded-xl border border-border">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading seasons...
                </div>
              ) : (
                <SeasonTable
                  seasons={seasons}
                  onEdit={openEdit}
                  onDelete={(season) => {
                    if (deletingId) return;
                    void handleDelete(season);
                  }}
                  selectedIds={selectedIds}
                  onToggleAll={(checked) => {
                    if (!checked) {
                      setSelectedIds([]);
                      return;
                    }
                    setSelectedIds(seasons.map((s) => s.id));
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

        <SeasonFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          mode={mode}
          editingSeasonId={editingId}
          existingSeasons={seasons}
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


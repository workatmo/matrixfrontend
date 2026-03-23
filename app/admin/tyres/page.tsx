"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import { Search, Plus, Pencil, Trash2, CircleDot } from "lucide-react";
import { useSettings } from "@/components/admin/SettingsProvider";
import { formatCurrency } from "@/lib/formatters";
import Link from "next/link";
import {
  bulkDeleteAdminTyres,
  bulkUpdateAdminTyresStatus,
  deleteAdminTyre,
  downloadTyresTemplate,
  exportTyres,
  importTyresFile,
  listAdminTyres,
  type AdminTyre,
  updateAdminTyre,
} from "@/lib/api";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const typeStyles: Record<string, string> = {
  Summer: "text-orange-500 bg-orange-500/10",
  Winter: "text-blue-500 bg-blue-500/10",
  "All Season": "text-green-500 bg-green-500/10",
};

export default function TyresPage() {
  return (
    <AdminLayout title="Tyres">
      <TyresContent />
    </AdminLayout>
  );
}

function TyresContent() {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<AdminTyre[]>([]);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [downloading, setDownloading] = useState<"template" | "export" | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    void (async () => {
      try {
        const data = await listAdminTyres();
        if (!cancelled) {
          setRows(data);
          setSelectedIds([]);
        }
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : "Failed to load tyres.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      [
        row.brand_name ?? "",
        row.model,
        row.size_label ?? "",
        row.season_name ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query, rows]);

  const handleToggleStatus = async (row: AdminTyre) => {
    if (busyId !== null) return;
    setBusyId(row.id);
    try {
      const updated = await updateAdminTyre(row.id, {
        brand_id: row.brand_id,
        model: row.model,
        size_id: row.size_id,
        season_id: row.season_id,
        tyre_type_id: row.tyre_type_id,
        fuel_efficiency_id: row.fuel_efficiency_id,
        speed_rating_id: row.speed_rating_id,
        price: Number(row.price),
        stock: row.stock,
        description: row.description,
        status: !row.status,
      });
      setRows((prev) => prev.map((item) => (item.id === row.id ? updated : item)));
      toast.success(`Tyre marked as ${updated.status ? "Active" : "Inactive"}.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update tyre status.");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (row: AdminTyre) => {
    if (busyId !== null) return;
    const confirmed = window.confirm(`Delete tyre "${row.brand_name ?? "Unknown"} ${row.model}"?`);
    if (!confirmed) return;

    setBusyId(row.id);
    try {
      await deleteAdminTyre(row.id);
      setRows((prev) => prev.filter((item) => item.id !== row.id));
      toast.success("Tyre deleted.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete tyre.");
    } finally {
      setBusyId(null);
    }
  };

  const stats = useMemo(() => {
    const totalSkus = rows.length;
    const inStock = rows.reduce((sum, r) => sum + (r.stock > 0 ? r.stock : 0), 0);
    const outOfStock = rows.filter((r) => r.stock <= 0).length;
    return { totalSkus, inStock, outOfStock };
  }, [rows]);

  const handleBulkStatus = async (status: "active" | "inactive") => {
    if (selectedIds.length === 0) return;
    setBulkBusy(true);
    try {
      await bulkUpdateAdminTyresStatus(selectedIds, status);
      setRows((prev) =>
        prev.map((row) => (selectedIds.includes(row.id) ? { ...row, status: status === "active" } : row))
      );
      toast.success(`Updated ${selectedIds.length} tyre(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to bulk update tyres.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected tyre(s)?`);
    if (!confirmed) return;

    setBulkBusy(true);
    try {
      await bulkDeleteAdminTyres(selectedIds);
      setRows((prev) => prev.filter((row) => !selectedIds.includes(row.id)));
      setSelectedIds([]);
      toast.success(`Deleted ${selectedIds.length} tyre(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to bulk delete tyres.");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setDownloading("template");
    try {
      await downloadTyresTemplate("xlsx");
      toast.success("Template downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to download template.");
    } finally {
      setDownloading(null);
    }
  };

  const handleExport = async () => {
    setDownloading("export");
    try {
      await exportTyres("xlsx");
      toast.success("Export downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to export tyres.");
    } finally {
      setDownloading(null);
    }
  };

  const handleImport = async (file: File) => {
    setImporting(true);
    try {
      const result = await importTyresFile(file);
      const data = await listAdminTyres();
      setRows(data);
      setSelectedIds([]);
      toast.success(`Import complete. Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to import tyres.");
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Tyres</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage tyre catalogue and inventory</p>
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
            <Link
              href="/admin/tyres/create"
              className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Tyre
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tyres..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total SKUs", value: String(stats.totalSkus) },
            { label: "In Stock", value: String(stats.inStock) },
            { label: "Out of Stock", value: String(stats.outOfStock) },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                <CircleDot className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-bold text-xl">{s.value}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {selectedIds.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
            <Button type="button" variant="outline" disabled={bulkBusy} onClick={() => void handleBulkStatus("active")}>
              Set Active
            </Button>
            <Button type="button" variant="outline" disabled={bulkBusy} onClick={() => void handleBulkStatus("inactive")}>
              Set Inactive
            </Button>
            <Button type="button" variant="destructive" disabled={bulkBusy} onClick={() => void handleBulkDelete()}>
              Bulk Delete
            </Button>
          </div>
        )}

        {/* Tyres Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { key: "select", label: "" },
                    { key: "brandModel", label: "Brand & Model" },
                    { key: "size", label: "Size" },
                    { key: "type", label: "Type" },
                    { key: "stock", label: "Stock" },
                    { key: "price", label: "Price" },
                    { key: "status", label: "Status" },
                    { key: "actions", label: "" },
                  ].map((h) => (
                    <th key={h.key} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h.key === "select" ? (
                        <Checkbox
                          checked={filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id))}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              setSelectedIds([]);
                              return;
                            }
                            setSelectedIds(filteredRows.map((row) => row.id));
                          }}
                        />
                      ) : h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(loading ? [] : filteredRows).map((t) => (
                  <tr key={t.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4">
                      <Checkbox
                        checked={selectedIds.includes(t.id)}
                        onCheckedChange={(checked) => {
                          setSelectedIds((prev) => {
                            if (checked) return prev.includes(t.id) ? prev : [...prev, t.id];
                            return prev.filter((id) => id !== t.id);
                          });
                        }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-foreground text-sm font-medium">{t.brand_name ?? "-"}</p>
                      <p className="text-muted-foreground text-xs">{t.model}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground font-mono">{t.size_label ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeStyles[t.season_name ?? ""] ?? "text-muted-foreground bg-muted"}`}>
                        {t.season_name ?? "-"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${t.stock === 0 ? "text-red-500" : "text-foreground"}`}>
                        {t.stock === 0 ? "Out of Stock" : t.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-foreground font-medium">
                      {formatCurrency(Number(t.price), settings?.currency)}
                    </td>
                    <td className="px-5 py-4">
                      <Switch
                        checked={t.status}
                        disabled={busyId === t.id}
                        onCheckedChange={() => {
                          void handleToggleStatus(t);
                        }}
                      />
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/admin/tyres/create?tyreId=${t.id}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          title="Edit tyre"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            void handleDelete(t);
                          }}
                          disabled={busyId === t.id}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-accent transition-colors disabled:opacity-50"
                          title="Delete tyre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      No tyres found.
                    </td>
                  </tr>
                ) : null}
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-6 text-center text-sm text-muted-foreground">
                      Loading tyres...
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

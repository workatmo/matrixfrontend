"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Edit, Loader2, Plus, Trash2, ExternalLink, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import {
  createAdminBanner,
  deleteAdminBanner,
  listAdminBanners,
  updateAdminBanner,
  uploadAdminBannerImage,
  type AdminBannerItem,
} from "@/lib/api";

type FormState = {
  title: string;
  image_url: string;
  link: string;
  is_active: boolean;
};

const DEFAULT_FORM: FormState = {
  title: "",
  image_url: "",
  link: "",
  is_active: true,
};

export default function BannersPage() {
  const [rows, setRows] = useState<AdminBannerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadBanners = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminBanners();
      setRows(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load banners.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBanners();
  }, [loadBanners]);

  const editingItem = editingId === null ? null : rows.find((x) => x.id === editingId) ?? null;

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminBannerItem) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      image_url: row.image_url ?? "",
      link: row.link ?? "",
      is_active: row.is_active,
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

  // Image upload via file picker
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAdminBannerImage(file);
      setForm((prev) => ({ ...prev, image_url: url }));
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        image_url: form.image_url.trim() || null,
        link: form.link.trim() || null,
        is_active: form.is_active,
      };

      if (editingId === null) {
        const created = await createAdminBanner(payload);
        setRows((prev) => [created, ...prev]);
        toast.success("Banner created.");
      } else {
        const updated = await updateAdminBanner(editingId, payload);
        setRows((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Banner updated.");
      }

      closeDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save banner.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AdminBannerItem) => {
    const confirmed = window.confirm(`Delete banner "${row.title}"?`);
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteAdminBanner(row.id);
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      toast.success("Banner deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete banner.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Banners">
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Banners</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage promotional banners shown to customers — set title, image, and destination link.
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>

        {/* Table card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Banner List
            </CardTitle>
            <CardDescription>Create, edit, and delete banners.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="w-24 text-center">Active</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading banners…
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-sm text-muted-foreground">
                        No banners yet. Click &ldquo;Add Banner&rdquo; to create one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        {/* Thumbnail */}
                        <TableCell>
                          {row.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={row.image_url}
                              alt={row.title}
                              className="h-12 w-20 object-cover rounded-md border border-border"
                            />
                          ) : (
                            <div className="h-12 w-20 rounded-md border border-dashed border-border bg-muted/30 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                          )}
                        </TableCell>
                        {/* Title */}
                        <TableCell className="font-medium max-w-[220px] truncate">
                          {row.title}
                        </TableCell>
                        {/* Link */}
                        <TableCell className="max-w-[260px]">
                          {row.link ? (
                            <a
                              href={row.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-full text-sm"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{row.link}</span>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        {/* Active */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              row.is_active
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {row.is_active ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
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
            <DialogTitle>{editingItem ? "Edit Banner" : "Add Banner"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="banner-title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="banner-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Summer Sale – 20% off all tyres"
                autoFocus
              />
            </div>

            {/* Image */}
            <div className="space-y-2">
              <Label>Image</Label>

              {/* Preview */}
              {form.image_url && (
                <div className="relative rounded-lg overflow-hidden border border-border bg-muted/20 h-36 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.image_url}
                    alt="Banner preview"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, image_url: "" }))}
                    className="absolute top-2 right-2 rounded-full bg-black/60 text-white w-6 h-6 flex items-center justify-center text-xs hover:bg-black/80"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Upload button */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="gap-2"
                >
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UploadCloud className="w-4 h-4" />
                  )}
                  {uploading ? "Uploading…" : "Upload Image"}
                </Button>
                <Input
                  value={form.image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, image_url: e.target.value }))}
                  placeholder="…or paste an image URL"
                  className="flex-1"
                />
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => void handleFileChange(e)}
              />
              <p className="text-xs text-muted-foreground">
                Accepted: JPG, PNG, WEBP, GIF — max 5 MB. You can upload a file or paste a URL.
              </p>
            </div>

            {/* Link */}
            <div className="space-y-2">
              <Label htmlFor="banner-link">Link (optional)</Label>
              <Input
                id="banner-link"
                type="url"
                value={form.link}
                onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com/sale"
              />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Show this banner to customers</p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, is_active: checked }))
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
              disabled={saving || uploading || !form.title.trim()}
            >
              {saving ? "Saving…" : editingItem ? "Update Banner" : "Create Banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

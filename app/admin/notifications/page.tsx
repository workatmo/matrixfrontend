"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Edit, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  createAdminNotification,
  deleteAdminNotification,
  listAdminNotifications,
  updateAdminNotification,
  type AdminNotification,
} from "@/lib/api";

type FormState = {
  title: string;
  color: string;
  link: string;
};

const DEFAULT_FORM: FormState = {
  title: "",
  color: "#3b82f6",
  link: "",
};

export default function NotificationsPage() {
  const [rows, setRows] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminNotifications();
      setRows(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const editingItem = useMemo(
    () => (editingId === null ? null : rows.find((x) => x.id === editingId) ?? null),
    [editingId, rows]
  );

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setDialogOpen(true);
  };

  const openEdit = (row: AdminNotification) => {
    setEditingId(row.id);
    setForm({
      title: row.title,
      color: row.color || "#3b82f6",
      link: row.link ?? "",
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
    if (!form.title.trim()) {
      toast.error("Title is required.");
      return;
    }
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(form.color.trim())) {
      toast.error("Color must be a valid hex value, like #3b82f6.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        color: form.color.trim(),
        link: form.link.trim() ? form.link.trim() : null,
      };

      if (editingId === null) {
        const created = await createAdminNotification(payload);
        setRows((prev) => [created, ...prev]);
        toast.success("Notification created.");
      } else {
        const updated = await updateAdminNotification(editingId, payload);
        setRows((prev) => prev.map((x) => (x.id === editingId ? updated : x)));
        toast.success("Notification updated.");
      }

      closeDialog(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notification.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row: AdminNotification) => {
    const confirmed = window.confirm(`Delete notification "${row.title}"?`);
    if (!confirmed) return;

    setDeletingId(row.id);
    try {
      await deleteAdminNotification(row.id);
      setRows((prev) => prev.filter((x) => x.id !== row.id));
      toast.success("Notification deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete notification.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminLayout title="Notifications">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notifications</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage admin notifications with title, color, and destination link.
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Notification
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notification List
            </CardTitle>
            <CardDescription>Create, edit, and delete notifications.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading notifications...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-sm text-muted-foreground">
                        No notifications yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.title}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="inline-block w-4 h-4 rounded-full border border-border"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="text-sm text-muted-foreground">{row.color}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[320px]">
                          {row.link ? (
                            <a
                              href={row.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate block"
                            >
                              {row.link}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button type="button" variant="ghost" size="icon" onClick={() => openEdit(row)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => void handleDelete(row)}
                              disabled={deletingId === row.id}
                            >
                              {deletingId === row.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-500" />
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

      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit Notification" : "Add Notification"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="notification-title">Title</Label>
              <Input
                id="notification-title"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Service maintenance at 10 PM"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-color">Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="notification-color"
                  type="color"
                  className="w-14 h-10 p-1"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  placeholder="#3b82f6"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-link">Link</Label>
              <Input
                id="notification-link"
                type="url"
                value={form.link}
                onChange={(e) => setForm((prev) => ({ ...prev, link: e.target.value }))}
                placeholder="https://example.com/maintenance-details"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => closeDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? "Saving..." : editingItem ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

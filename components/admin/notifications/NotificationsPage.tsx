"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Bell, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  listAdminNotifications,
  createAdminNotification,
  updateAdminNotification,
  deleteAdminNotification,
} from "@/lib/api";
import { Layout } from "@/components/admin/Layout";
import NotificationFormDialog from "./NotificationFormDialog";
import type { AdminNotification, NotificationDraft } from "./types";
import { DEFAULT_DRAFT } from "./types";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draftValues, setDraftValues] = useState<NotificationDraft>(DEFAULT_DRAFT);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<AdminNotification | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listAdminNotifications();
      setNotifications(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  // ── Open add dialog ────────────────────────────────────────────────────────
  const handleAdd = () => {
    setDialogMode("add");
    setEditingId(null);
    setDraftValues(DEFAULT_DRAFT);
    setDialogOpen(true);
  };

  // ── Open edit dialog ───────────────────────────────────────────────────────
  const handleEdit = (row: AdminNotification) => {
    setDialogMode("edit");
    setEditingId(row.id);
    setDraftValues({ title: row.title, color: row.color, link: row.link ?? "" });
    setDialogOpen(true);
  };

  // ── Save (create or update) ────────────────────────────────────────────────
  const handleSave = async (values: NotificationDraft) => {
    setSaving(true);
    try {
      const payload = {
        title: values.title,
        color: values.color,
        link: values.link || null,
      };

      if (dialogMode === "add") {
        const created = await createAdminNotification(payload);
        setNotifications((prev) => [created, ...prev]);
        toast.success("Notification created.");
      } else if (editingId !== null) {
        const updated = await updateAdminNotification(editingId, payload);
        setNotifications((prev) =>
          prev.map((n) => (n.id === editingId ? updated : n))
        );
        toast.success("Notification updated.");
      }
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save notification.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminNotification(deleteTarget.id);
      setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
      toast.success("Notification deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete notification.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {notifications.length === 0
                  ? "No notifications yet."
                  : `${notifications.length} notification${notifications.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Notification
          </Button>
        </div>

        {/* Table / Empty state */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 gap-3">
            <Bell className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No notifications yet. Click &quot;Add Notification&quot; to create one.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground w-10">#</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Colour</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Link</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {notifications.map((row) => (
                  <tr
                    key={row.id}
                    className="bg-card hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground">{row.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold text-white"
                        style={{ background: row.color }}
                        title={row.color}
                      >
                        <span
                          className="h-2 w-2 rounded-full bg-white/40"
                        />
                        {row.color}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-xs truncate">
                      {row.title}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs">
                      {row.link ? (
                        <a
                          href={row.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[200px]"
                        >
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{row.link}</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(row)}
                          className="h-8 px-2 gap-1"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget(row)}
                          className="h-8 px-2 gap-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit dialog */}
      <NotificationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        initialValues={draftValues}
        onSave={(v) => void handleSave(v)}
        saving={saving}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDeleteConfirm()}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}

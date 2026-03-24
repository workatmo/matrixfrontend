"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NotificationDraft } from "./types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  initialValues: NotificationDraft;
  onSave: (values: NotificationDraft) => void;
  saving?: boolean;
}

export default function NotificationFormDialog({
  open,
  onOpenChange,
  mode,
  initialValues,
  onSave,
  saving = false,
}: Props) {
  const [values, setValues] = useState<NotificationDraft>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!values.title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(values.color)) {
      setError("Colour must be a valid hex code (e.g. #ff0000).");
      return;
    }
    onSave({
      title: values.title.trim(),
      color: values.color,
      link: values.link.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6 max-w-md">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Notification" : "Edit Notification"}
          </DialogTitle>
          <DialogDescription>
            Notifications appear as banners or alerts for your users.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="notif-title">Title *</Label>
            <Input
              id="notif-title"
              value={values.title}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="e.g. Summer Sale – 20% off all tyres"
              autoFocus
            />
          </div>

          {/* Colour */}
          <div className="space-y-2">
            <Label htmlFor="notif-color">Colour</Label>
            <div className="flex items-center gap-3">
              <input
                id="notif-color"
                type="color"
                value={values.color}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, color: e.target.value }))
                }
                className="h-10 w-14 cursor-pointer rounded-md border border-border bg-transparent p-1"
                title="Pick a colour"
              />
              <Input
                value={values.color}
                onChange={(e) =>
                  setValues((prev) => ({ ...prev, color: e.target.value }))
                }
                placeholder="#3b82f6"
                className="font-mono flex-1"
                maxLength={7}
              />
              {/* Live preview swatch */}
              <span
                className="h-8 w-8 rounded-full border border-border flex-shrink-0"
                style={{ background: values.color }}
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Link */}
          <div className="space-y-2">
            <Label htmlFor="notif-link">Link (optional)</Label>
            <Input
              id="notif-link"
              type="url"
              value={values.link}
              onChange={(e) =>
                setValues((prev) => ({ ...prev, link: e.target.value }))
              }
              placeholder="https://example.com/sale"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="bg-transparent border-0 p-0 mt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!values.title.trim() || saving}>
              {saving
                ? "Saving…"
                : mode === "add"
                ? "Add Notification"
                : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

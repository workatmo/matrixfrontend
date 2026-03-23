"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import type { TyreType, TyreTypeDraft } from "./types";

interface TyreTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editingId: number | null;
  existing: TyreType[];
  initialValues: TyreTypeDraft;
  onSave: (values: TyreTypeDraft) => void;
}

export default function TyreTypeFormDialog({
  open,
  onOpenChange,
  mode,
  editingId,
  existing,
  initialValues,
  onSave,
}: TyreTypeFormDialogProps) {
  const [values, setValues] = useState<TyreTypeDraft>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const normalized = values.name.trim().toLowerCase();
  const isDuplicate = useMemo(() => {
    if (!normalized) return false;
    const conflict = existing.find((x) => x.name.trim().toLowerCase() === normalized);
    if (!conflict) return false;
    if (mode === "edit" && editingId !== null && conflict.id === editingId) return false;
    return true;
  }, [existing, mode, editingId, normalized]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (isDuplicate) {
      setError(`Duplicate tyre type "${values.name.trim()}" is not allowed.`);
      return;
    }

    onSave({
      name: values.name.trim(),
      description: values.description.trim(),
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Tyre Type" : "Edit Tyre Type"}</DialogTitle>
          <DialogDescription>
            Create and manage tyre types such as Tubeless, Run-flat, and Radial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tyre-type-name">Name</Label>
            <Input
              id="tyre-type-name"
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Run-flat"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tyre-type-description">Description (optional)</Label>
            <Textarea
              id="tyre-type-description"
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Can run after puncture"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <span className="text-sm text-muted-foreground">Status: {values.status === "active" ? "Active" : "Inactive"}</span>
            <Switch
              checked={values.status === "active"}
              onCheckedChange={(checked) =>
                setValues((prev) => ({
                  ...prev,
                  status: checked ? "active" : "inactive",
                }))
              }
            />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <DialogFooter className="bg-transparent border-0 p-0 mt-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!values.name.trim() || isDuplicate}>
              {mode === "add" ? "Add Tyre Type" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


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
import type { Season, SeasonDraft } from "./types";

interface SeasonFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editingSeasonId: number | null;
  existingSeasons: Season[];
  initialValues: SeasonDraft;
  onSave: (values: SeasonDraft) => void;
}

export default function SeasonFormDialog({
  open,
  onOpenChange,
  mode,
  editingSeasonId,
  existingSeasons,
  initialValues,
  onSave,
}: SeasonFormDialogProps) {
  const [values, setValues] = useState<SeasonDraft>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const normalizedName = values.name.trim().toLowerCase();
  const isDuplicate = useMemo(() => {
    if (!normalizedName) return false;
    const conflict = existingSeasons.find((s) => s.name.trim().toLowerCase() === normalizedName);
    if (!conflict) return false;
    if (mode === "edit" && editingSeasonId !== null && conflict.id === editingSeasonId) return false;
    return true;
  }, [existingSeasons, mode, editingSeasonId, normalizedName]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.name.trim()) {
      setError("Season name is required.");
      return;
    }
    if (isDuplicate) {
      setError(`Duplicate season name "${values.name.trim()}" is not allowed.`);
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
          <DialogTitle>{mode === "add" ? "Add Season" : "Edit Season"}</DialogTitle>
          <DialogDescription>
            Create and manage seasons like Summer, Winter, and All Season.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="season-name">Season Name</Label>
            <Input
              id="season-name"
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Summer"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="season-description">Description (optional)</Label>
            <Textarea
              id="season-description"
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="e.g. Best for warm weather"
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
              {mode === "add" ? "Add Season" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


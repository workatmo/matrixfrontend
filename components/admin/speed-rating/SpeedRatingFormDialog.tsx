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
import type { SpeedRating, SpeedRatingDraft } from "./types";

interface SpeedRatingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editingId: number | null;
  existing: SpeedRating[];
  initialValues: SpeedRatingDraft;
  onSave: (values: SpeedRatingDraft) => void;
}

export default function SpeedRatingFormDialog({
  open,
  onOpenChange,
  mode,
  editingId,
  existing,
  initialValues,
  onSave,
}: SpeedRatingFormDialogProps) {
  const [values, setValues] = useState<SpeedRatingDraft>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const normalizedRating = values.rating.trim().toUpperCase();
  const isDuplicate = useMemo(() => {
    if (!normalizedRating) return false;
    const conflict = existing.find((x) => x.rating.trim().toUpperCase() === normalizedRating);
    if (!conflict) return false;
    if (mode === "edit" && editingId !== null && conflict.id === editingId) return false;
    return true;
  }, [existing, mode, editingId, normalizedRating]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!normalizedRating) {
      setError("Rating is required.");
      return;
    }
    if (!values.maxSpeed.trim()) {
      setError("Max speed is required.");
      return;
    }
    const parsed = Number(values.maxSpeed);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Max speed must be a positive number.");
      return;
    }
    if (isDuplicate) {
      setError(`Rating "${normalizedRating}" already exists.`);
      return;
    }

    onSave({
      rating: normalizedRating,
      maxSpeed: String(Math.round(parsed)),
      description: values.description.trim(),
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black text-white border-[#1f1f1f] p-6">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Speed Rating" : "Edit Speed Rating"}</DialogTitle>
          <DialogDescription className="text-white/70">
            Manage speed ratings such as H, V, W, and Y.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="speed-rating">Rating</Label>
            <Input
              id="speed-rating"
              value={values.rating}
              onChange={(e) => setValues((prev) => ({ ...prev, rating: e.target.value }))}
              placeholder="e.g. H"
              className="bg-transparent text-white border-[#1f1f1f]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speed-max">Max Speed (km/h)</Label>
            <Input
              id="speed-max"
              type="number"
              min={1}
              value={values.maxSpeed}
              onChange={(e) => setValues((prev) => ({ ...prev, maxSpeed: e.target.value }))}
              placeholder="e.g. 210"
              className="bg-transparent text-white border-[#1f1f1f]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="speed-description">Description</Label>
            <Textarea
              id="speed-description"
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Suitable for high-performance vehicles"
              className="bg-transparent text-white border-[#1f1f1f]"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-[#1f1f1f] p-3">
            <span className="text-sm text-white/80">Status: {values.status === "active" ? "Active" : "Inactive"}</span>
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
            <Button
              type="submit"
              disabled={!normalizedRating || !values.maxSpeed.trim() || isDuplicate}
              className="bg-white text-black hover:bg-white/90"
            >
              {mode === "add" ? "Add Rating" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


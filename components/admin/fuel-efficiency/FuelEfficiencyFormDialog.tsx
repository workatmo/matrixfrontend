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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FuelEfficiency, FuelEfficiencyDraft, FuelEfficiencyRating } from "./types";

interface FuelEfficiencyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  editingId: number | null;
  existing: FuelEfficiency[];
  initialValues: FuelEfficiencyDraft;
  onSave: (values: FuelEfficiencyDraft) => void;
}

const RATINGS: FuelEfficiencyRating[] = ["A", "B", "C", "D", "E"];

export default function FuelEfficiencyFormDialog({
  open,
  onOpenChange,
  mode,
  editingId,
  existing,
  initialValues,
  onSave,
}: FuelEfficiencyFormDialogProps) {
  const [values, setValues] = useState<FuelEfficiencyDraft>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const isDuplicate = useMemo(() => {
    if (!values.rating) return false;
    const conflict = existing.find((x) => x.rating === values.rating);
    if (!conflict) return false;
    if (mode === "edit" && editingId !== null && conflict.id === editingId) return false;
    return true;
  }, [existing, mode, editingId, values.rating]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.rating) {
      setError("Rating is required.");
      return;
    }
    if (!RATINGS.includes(values.rating)) {
      setError("Only ratings A to E are allowed.");
      return;
    }
    if (isDuplicate) {
      setError(`Rating "${values.rating}" already exists.`);
      return;
    }

    onSave({
      rating: values.rating,
      description: values.description.trim(),
      status: values.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-black text-white border-[#1f1f1f] p-6">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Fuel Efficiency Rating" : "Edit Fuel Efficiency Rating"}</DialogTitle>
          <DialogDescription className="text-white/70">
            Define fuel efficiency ratings from A to E.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Rating</Label>
            <Select
              value={values.rating}
              onValueChange={(value) =>
                setValues((prev) => ({
                  ...prev,
                  rating: value as FuelEfficiencyRating,
                }))
              }
            >
              <SelectTrigger className="w-full bg-transparent text-white border-[#1f1f1f]">
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-[#1f1f1f]">
                {RATINGS.map((rating) => (
                  <SelectItem key={rating} value={rating} className="text-white">
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fuel-eff-description">Description</Label>
            <Textarea
              id="fuel-eff-description"
              value={values.description}
              onChange={(e) => setValues((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="A - Best fuel efficiency"
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
            <Button type="submit" disabled={!values.rating || isDuplicate} className="bg-white text-black hover:bg-white/90">
              {mode === "add" ? "Add Rating" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


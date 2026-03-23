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
import type { Size } from "./types";

type DraftValues = {
  width: string;
  profile: string;
  rim: string;
};

type SizeFormDialogMode = "add" | "edit";

interface SizeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SizeFormDialogMode;
  editingSizeId: number | null;
  existingSizes: Size[];
  initialValues: DraftValues;
  onSave: (values: { width: number; profile: number; rim: number; label: string }) => void;
}

function buildLabel(width: number, profile: number, rim: number): string {
  return `${width}/${profile} R${rim}`;
}

export default function SizeFormDialog({
  open,
  onOpenChange,
  mode,
  editingSizeId,
  existingSizes,
  initialValues,
  onSave,
}: SizeFormDialogProps) {
  const [values, setValues] = useState<DraftValues>(initialValues);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Keep draft in sync when switching between add/edit.
    setValues(initialValues);
    setError(null);
  }, [initialValues, open]);

  const parsed = useMemo(() => {
    const width = Number(values.width);
    const profile = Number(values.profile);
    const rim = Number(values.rim);

    const widthOk = values.width.trim() !== "" && Number.isFinite(width) && Number.isInteger(width);
    const profileOk = values.profile.trim() !== "" && Number.isFinite(profile) && Number.isInteger(profile);
    const rimOk = values.rim.trim() !== "" && Number.isFinite(rim) && Number.isInteger(rim);

    if (!widthOk || !profileOk || !rimOk) return null;
    return { width, profile, rim, label: buildLabel(width, profile, rim) };
  }, [values]);

  const isDuplicate = useMemo(() => {
    if (!parsed) return false;
    const conflict = existingSizes.find((s) => s.label === parsed.label);
    if (!conflict) return false;
    if (mode === "edit" && editingSizeId !== null && conflict.id === editingSizeId) return false;
    return true;
  }, [parsed, existingSizes, mode, editingSizeId]);

  const preview = parsed ? parsed.label : "";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!parsed) {
      setError("All fields are required and must be whole numbers.");
      return;
    }

    if (isDuplicate) {
      setError(`Duplicate size "${parsed.label}" is not allowed.`);
      return;
    }

    onSave({
      width: parsed.width,
      profile: parsed.profile,
      rim: parsed.rim,
      label: parsed.label,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-6">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Size" : "Edit Size"}</DialogTitle>
          <DialogDescription>
            Define your tyre size in the format <span className="font-medium">width/profile Rrim</span>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                value={values.width}
                onChange={(e) => setValues((prev) => ({ ...prev, width: e.target.value }))}
                placeholder="e.g. 205"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile">Profile</Label>
              <Input
                id="profile"
                type="number"
                value={values.profile}
                onChange={(e) => setValues((prev) => ({ ...prev, profile: e.target.value }))}
                placeholder="e.g. 55"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rim">Rim Size</Label>
              <Input
                id="rim"
                type="number"
                value={values.rim}
                onChange={(e) => setValues((prev) => ({ ...prev, rim: e.target.value }))}
                placeholder="e.g. 16"
              />
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Size Preview: <span className="font-semibold">{preview || "—"}</span>
            </p>
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
            <Button type="submit" disabled={!preview || isDuplicate}>
              {mode === "add" ? "Add Size" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


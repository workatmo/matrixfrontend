"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock, Edit, Loader2, Plus, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import AdminLayout from "@/components/admin/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  listAdminSlots,
  createAdminSlot,
  updateAdminSlot,
  deleteAdminSlot,
  bulkGenerateAdminSlots,
  toggleAdminSlotStatus,
  type AdminSlotItem,
} from "@/lib/api";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

type Day = (typeof DAYS)[number];

function capitalise(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "08:00" → minutes since midnight */
function toMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** "14:30" → "2:30 PM" */
function format12h(time: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

/** Convert 12h parts → "HH:mm" 24h string for storage. */
function to24h(hour: string, minute: string, period: string): string {
  let h = parseInt(hour);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${minute}`;
}

/** Parse "HH:mm" → { hour, minute, period } for the picker. */
function parse12h(time: string): { hour: string; minute: string; period: string } {
  if (!time) return { hour: "12", minute: "00", period: "AM" };
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return { hour: String(hour), minute: String(m).padStart(2, "0"), period };
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = ["00", "15", "30", "45"];

function TimePicker12h({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = parse12h(value);

  const update = (field: "hour" | "minute" | "period", val: string) => {
    const next = { ...parsed, [field]: val };
    if (next.hour && next.minute && next.period) {
      onChange(to24h(next.hour, next.minute, next.period));
    }
  };

  return (
    <div className="flex gap-1">
      {/* Hour */}
      <Select value={value ? parsed.hour : ""} onValueChange={(v) => v && update("hour", v)}>
        <SelectTrigger className="w-[60px] px-2">
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>{h}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="flex items-center text-muted-foreground font-mono">:</span>

      {/* Minute */}
      <Select value={value ? parsed.minute : ""} onValueChange={(v) => v && update("minute", v)}>
        <SelectTrigger className="w-[60px] px-2">
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>{m}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* AM/PM */}
      <Select value={value ? parsed.period : ""} onValueChange={(v) => v && update("period", v)}>
        <SelectTrigger className="w-[64px] px-2">
          <SelectValue placeholder="AM" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

// ─── Form Types ────────────────────────────────────────────────────────────────

type SlotForm = {
  day: Day | "";
  start_time: string;
  end_time: string;
  max_bookings: number;
  status: boolean;
};

const DEFAULT_SLOT_FORM: SlotForm = {
  day: "",
  start_time: "",
  end_time: "",
  max_bookings: 1,
  status: true,
};

type GenForm = {
  day: Day | "";
  start_time: string;
  end_time: string;
  duration: number;
};

const DEFAULT_GEN_FORM: GenForm = {
  day: "",
  start_time: "",
  end_time: "",
  duration: 60,
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlotsPage() {
  const [slots, setSlots] = useState<AdminSlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Slot dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SlotForm>(DEFAULT_SLOT_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  // Generator
  const [genForm, setGenForm] = useState<GenForm>(DEFAULT_GEN_FORM);
  const [genError, setGenError] = useState<string | null>(null);

  // ── Load ───────────────────────────────────────────────────────────────────

  const loadSlots = useCallback(async () => {
    setLoading(true);
    try {
      const items = await listAdminSlots();
      setSlots(items);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load slots.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // ── Dialog helpers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_SLOT_FORM);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (slot: AdminSlotItem) => {
    setEditingId(slot.id);
    setForm({
      day: slot.day as Day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      max_bookings: slot.max_bookings,
      status: slot.status === "active",
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const closeDialog = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditingId(null);
      setForm(DEFAULT_SLOT_FORM);
      setFormError(null);
    }
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setFormError(null);

    if (!form.day || !form.start_time || !form.end_time) {
      setFormError("Day, start time, and end time are required.");
      return;
    }

    if (toMins(form.start_time) >= toMins(form.end_time)) {
      setFormError("Start time must be earlier than end time.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
        max_bookings: form.max_bookings || 1,
        status: form.status ? ("active" as const) : ("inactive" as const),
      };

      if (editingId === null) {
        const created = await createAdminSlot(payload);
        setSlots((prev) => [...prev, created]);
        toast.success("Slot created.");
      } else {
        const updated = await updateAdminSlot(editingId, payload);
        setSlots((prev) =>
          prev.map((s) => (s.id === editingId ? updated : s))
        );
        toast.success("Slot updated.");
      }

      closeDialog(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to save slot.";
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ── Quick status toggle ────────────────────────────────────────────────────

  const handleToggleStatus = async (slot: AdminSlotItem) => {
    setTogglingId(slot.id);
    try {
      const updated = await toggleAdminSlotStatus(slot.id);
      setSlots((prev) => prev.map((s) => (s.id === slot.id ? updated : s)));
      toast.success(
        `Slot set to ${updated.status === "active" ? "Active" : "Inactive"}.`
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status."
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (slot: AdminSlotItem) => {
    const ok = window.confirm(
      `Delete slot ${capitalise(slot.day)} ${slot.start_time}–${slot.end_time}?`
    );
    if (!ok) return;

    setDeletingId(slot.id);
    try {
      await deleteAdminSlot(slot.id);
      setSlots((prev) => prev.filter((s) => s.id !== slot.id));
      toast.success("Slot deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete slot."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ── Auto generator ─────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    setGenError(null);

    if (!genForm.day || !genForm.start_time || !genForm.end_time) {
      setGenError("Day, start time, and end time are required.");
      return;
    }
    if (genForm.duration < 5) {
      setGenError("Duration must be at least 5 minutes.");
      return;
    }
    if (toMins(genForm.start_time) >= toMins(genForm.end_time)) {
      setGenError("Start time must be earlier than end time.");
      return;
    }

    setGenerating(true);
    try {
      const result = await bulkGenerateAdminSlots({
        day: genForm.day,
        start_time: genForm.start_time,
        end_time: genForm.end_time,
        duration: genForm.duration,
      });
      setSlots((prev) => [...prev, ...result.slots]);
      toast.success(
        `${result.created} slot(s) generated.${result.skipped > 0 ? ` ${result.skipped} duplicate(s) skipped.` : ""}`
      );
      setGenForm(DEFAULT_GEN_FORM);
    } catch (err) {
      setGenError(
        err instanceof Error ? err.message : "Failed to generate slots."
      );
    } finally {
      setGenerating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const isEditing = editingId !== null;

  return (
    <AdminLayout title="Slot Management">
      <div className="space-y-6">
        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              Slot Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Create and manage booking time slots for customers.
            </p>
          </div>
          <Button type="button" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>

        {/* ── Auto Generator ───────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-4 h-4" />
              Generate Slots Automatically
            </CardTitle>
            <CardDescription>
              Quickly create multiple slots for a day with a fixed interval.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Day */}
              <div className="space-y-2">
                <Label>Day</Label>
                <Select
                  value={genForm.day}
                  onValueChange={(v) =>
                    setGenForm((prev) => ({ ...prev, day: v as Day }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((d) => (
                      <SelectItem key={d} value={d}>
                        {capitalise(d)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label>Start Time</Label>
                <TimePicker12h
                  value={genForm.start_time}
                  onChange={(v) => setGenForm((prev) => ({ ...prev, start_time: v }))}
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label>End Time</Label>
                <TimePicker12h
                  value={genForm.end_time}
                  onChange={(v) => setGenForm((prev) => ({ ...prev, end_time: v }))}
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label>Slot Duration (minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  step={5}
                  value={genForm.duration}
                  onChange={(e) =>
                    setGenForm((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value) || 60,
                    }))
                  }
                  placeholder="e.g. 60"
                />
              </div>
            </div>

            {genError && (
              <p className="text-sm text-destructive mt-3">{genError}</p>
            )}

            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => void handleGenerate()}
                disabled={generating}
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4 mr-2" />
                )}
                {generating ? "Generating…" : "Generate Slots"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* ── Slots Table ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Slots List
            </CardTitle>
            <CardDescription>
              {loading
                ? "Loading slots…"
                : slots.length === 0
                  ? "No slots yet. Add one manually or use the generator above."
                  : `${slots.length} slot(s) configured.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time Range</TableHead>
                    <TableHead>Max Bookings</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-sm text-muted-foreground"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading slots…
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : slots.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-sm text-muted-foreground text-center"
                      >
                        No slots yet. Click &ldquo;Add Slot&rdquo; to create
                        one.
                      </TableCell>
                    </TableRow>
                  ) : (
                    slots.map((slot) => (
                      <TableRow key={slot.id}>
                        {/* Day */}
                        <TableCell className="font-medium">
                          {capitalise(slot.day)}
                        </TableCell>

                        {/* Time Range */}
                        <TableCell className="text-sm">
                          {format12h(slot.start_time)} – {format12h(slot.end_time)}
                        </TableCell>

                        {/* Max Bookings */}
                        <TableCell>{slot.max_bookings}</TableCell>

                        {/* Status — click to toggle */}
                        <TableCell className="text-center">
                          <button
                            type="button"
                            onClick={() => void handleToggleStatus(slot)}
                            disabled={togglingId === slot.id}
                            title={`Click to set ${slot.status === "active" ? "inactive" : "active"}`}
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-opacity hover:opacity-75 disabled:opacity-50 cursor-pointer ${
                              slot.status === "active"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {togglingId === slot.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : null}
                            {slot.status === "active" ? "Active" : "Inactive"}
                          </button>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="text-right">
                          <div className="inline-flex items-center justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => openEdit(slot)}
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => void handleDelete(slot)}
                              disabled={deletingId === slot.id}
                              title="Delete"
                            >
                              {deletingId === slot.id ? (
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

      {/* ── Add / Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Slot" : "Add Slot"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Day */}
            <div className="space-y-2">
              <Label>
                Day <span className="text-destructive">*</span>
              </Label>
              <Select
                value={form.day}
                onValueChange={(v) =>
                  setForm((prev) => ({ ...prev, day: v as Day }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => (
                    <SelectItem key={d} value={d}>
                      {capitalise(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start / End times */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Start Time <span className="text-destructive">*</span>
                </Label>
                <TimePicker12h
                  value={form.start_time}
                  onChange={(v) => setForm((prev) => ({ ...prev, start_time: v }))}
                />
              </div>
              <div className="space-y-2">
                <Label>
                  End Time <span className="text-destructive">*</span>
                </Label>
                <TimePicker12h
                  value={form.end_time}
                  onChange={(v) => setForm((prev) => ({ ...prev, end_time: v }))}
                />
              </div>
            </div>

            {/* Max Bookings */}
            <div className="space-y-2">
              <Label>Max Bookings</Label>
              <Input
                type="number"
                min={1}
                value={form.max_bookings}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    max_bookings: parseInt(e.target.value) || 1,
                  }))
                }
                placeholder="Default: 1"
              />
            </div>

            {/* Status toggle */}
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium">Active Status</p>
                <p className="text-xs text-muted-foreground">
                  Is this slot available for booking?
                </p>
              </div>
              <Switch
                checked={form.status}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, status: checked }))
                }
              />
            </div>

            {/* Validation / API error */}
            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => closeDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !form.day || !form.start_time || !form.end_time}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving…
                </>
              ) : isEditing ? (
                "Update Slot"
              ) : (
                "Create Slot"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

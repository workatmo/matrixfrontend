"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AdminLayout from "@/components/admin/Layout";
import {
  Search,
  Plus,
  MoreHorizontal,
  Car,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Pencil,
} from "lucide-react";
import {
  listAdminVehicles,
  createAdminVehicle,
  updateAdminVehicle,
  deleteAdminVehicle,
  AdminVehicleItem,
  AdminVehicleStats,
  AdminVehicleStatus,
} from "@/lib/api";

/* ─── helpers ─────────────────────────────────────────────── */

const statusStyles: Record<AdminVehicleStatus, string> = {
  active: "text-emerald-500 bg-emerald-500/10",
  inactive: "text-muted-foreground bg-muted",
  pending: "text-yellow-500 bg-yellow-500/10",
};

function fmt(s: AdminVehicleStatus) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const EMPTY_FORM = {
  registration: "",
  make: "",
  model: "",
  year: "",
  status: "active" as AdminVehicleStatus,
  notes: "",
};

/* ─── component ───────────────────────────────────────────── */

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<AdminVehicleItem[]>([]);
  const [stats, setStats] = useState<AdminVehicleStats>({ total: 0, active: 0, inactive: 0, pending: 0 });
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, per_page: 25, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AdminVehicleStatus | "">("");
  const [page, setPage] = useState(1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AdminVehicleItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Action dropdown
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  /* ─── fetch ─── */
  const fetchVehicles = useCallback(
    async (q: string, s: AdminVehicleStatus | "", p: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await listAdminVehicles({ search: q, status: s, page: p, per_page: 25 });
        setVehicles(res.vehicles);
        setStats(res.stats);
        setMeta(res.meta);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load vehicles.");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchVehicles(search, statusFilter, page);
  }, [statusFilter, page, fetchVehicles]); // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce search
  function handleSearch(val: string) {
    setSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchVehicles(val, statusFilter, 1);
    }, 400);
  }

  /* ─── modal ─── */
  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowModal(true);
  }

  function openEdit(v: AdminVehicleItem) {
    setEditing(v);
    setForm({
      registration: v.registration,
      make: v.make ?? "",
      model: v.model ?? "",
      year: v.year ? String(v.year) : "",
      status: v.status,
      notes: v.notes ?? "",
    });
    setFormError(null);
    setShowModal(true);
    setOpenMenu(null);
  }

  async function handleSave() {
    if (!form.registration.trim()) {
      setFormError("Registration number is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        registration: form.registration.trim().toUpperCase(),
        make: form.make.trim() || null,
        model: form.model.trim() || null,
        year: form.year ? parseInt(form.year) : null,
        status: form.status,
        notes: form.notes.trim() || null,
      };

      if (editing) {
        await updateAdminVehicle(editing.id, payload);
      } else {
        await createAdminVehicle(payload);
      }

      setShowModal(false);
      setPage(1);
      fetchVehicles(search, statusFilter, 1);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  /* ─── delete ─── */
  async function handleDelete(id: number) {
    if (!confirm("Delete this vehicle? This cannot be undone.")) return;
    setDeleting(id);
    setOpenMenu(null);
    try {
      await deleteAdminVehicle(id);
      fetchVehicles(search, statusFilter, page);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(null);
    }
  }

  /* ─── render ─── */
  return (
    <AdminLayout title="Vehicles">
      <div className="w-full space-y-6" onClick={() => setOpenMenu(null)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Vehicles</h2>
            <p className="text-muted-foreground text-sm mt-1">All registered vehicles in the system</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); openAdd(); }}
            className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by reg or make..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as AdminVehicleStatus | ""); setPage(1); }}
            className="bg-card border border-border rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring transition-colors"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Vehicles", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Pending Review", value: stats.pending },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-bold text-xl">{s.value.toLocaleString()}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Registration", "Make & Model", "Year", "Owner", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : vehicles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-sm text-muted-foreground">
                      No vehicles found.
                    </td>
                  </tr>
                ) : (
                  vehicles.map((v) => (
                    <tr key={v.id} className="hover:bg-accent/30 transition-colors">
                      <td className="px-5 py-4 text-sm text-foreground font-mono font-medium">
                        {v.registration}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-foreground text-sm font-medium">{v.make ?? "—"}</p>
                        <p className="text-muted-foreground text-xs">{v.model ?? ""}</p>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{v.year ?? "—"}</td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">
                        {v.user?.name ?? <span className="italic text-muted-foreground/50">No owner</span>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[v.status]}`}>
                          {fmt(v.status)}
                        </span>
                      </td>
                      <td className="px-5 py-4 relative" onClick={(e) => e.stopPropagation()}>
                        {deleting === v.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : (
                          <>
                            <button
                              onClick={() => setOpenMenu(openMenu === v.id ? null : v.id)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                            {openMenu === v.id && (
                              <div className="absolute right-4 top-10 z-20 bg-popover border border-border rounded-xl shadow-lg py-1 w-36">
                                <button
                                  onClick={() => openEdit(v)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(v.id)}
                                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Page {meta.current_page} of {meta.last_page} &mdash; {meta.total} vehicles
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-accent disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{editing ? "Edit Vehicle" : "Add Vehicle"}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {formError && (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {formError}
                </p>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Registration *
                </label>
                <input
                  value={form.registration}
                  onChange={(e) => setForm((f) => ({ ...f, registration: e.target.value }))}
                  placeholder="e.g. AB21 XYZ"
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground font-mono placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Make</label>
                  <input
                    value={form.make}
                    onChange={(e) => setForm((f) => ({ ...f, make: e.target.value }))}
                    placeholder="e.g. BMW"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Model</label>
                  <input
                    value={form.model}
                    onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                    placeholder="e.g. 5 Series"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Year</label>
                  <input
                    type="number"
                    min={1900}
                    max={2100}
                    value={form.year}
                    onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                    placeholder="e.g. 2022"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminVehicleStatus }))}
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring transition-colors"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  rows={2}
                  placeholder="Optional notes..."
                  className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-ring transition-colors resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editing ? "Save Changes" : "Add Vehicle"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

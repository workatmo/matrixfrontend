"use client";

import AdminLayout from "@/components/admin/Layout";
import {
  bulkDeleteAdminBrands,
  createAdminBrand,
  deleteAdminBrand,
  generateAdminBrands,
  listAdminBrands,
  updateAdminBrand,
  uploadBrandLogo,
  downloadAdminBrandTemplate,
  downloadAdminBrandExport,
  getApiSettings,
  importAdminBrands,
  type AdminBrand,
} from "@/lib/api";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Loader2, Save, Upload, X, Download, UploadCloud, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BrandFormState {
  name: string;
  logo_url: string;
  is_active: boolean;
}

const INITIAL_FORM: BrandFormState = {
  name: "",
  logo_url: "",
  is_active: true,
};

function resolveBrandLogoUrl(raw: string | null | undefined): string {
  const value = (raw ?? "").trim();
  if (!value) return "";

  try {
    const parsed = new URL(value);
    if (parsed.pathname.startsWith("/storage/")) {
      return `/api-backend-assets${parsed.pathname}`;
    }
  } catch {
    // Not a valid absolute URL, fall through
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }
  const normalizedPath = value.startsWith("/") ? value : `/${value}`;
  return `/api-backend-assets${normalizedPath}`;
}

function BrandLogoUploader({
  logoUrl,
  onUrlChange,
}: {
  logoUrl: string;
  onUrlChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_BYTES = 2 * 1024 * 1024; // 2MB
    const mb = (n: number) => Math.round(n / (1024 * 1024) * 10) / 10;
    if (file.size > MAX_BYTES) {
      toast.error(`File is too large. Max size: 2MB. Selected: ${mb(file.size)}MB.`);
      return;
    }

    setUploading(true);
    try {
      const url = await uploadBrandLogo(file);
      onUrlChange(url);
      toast.success("Brand logo uploaded.");
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Upload failed.";
      toast.error(`${errMsg} Allowed: JPG, JPEG, PNG. Max size: 2MB.`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
          {uploading ? "Uploading..." : "Upload Logo"}
        </Button>
        {logoUrl && (
          <Button type="button" variant="ghost" onClick={() => onUrlChange("")}>
            <X className="w-4 h-4 mr-2" />
            Remove
          </Button>
        )}
        <span className="text-xs text-muted-foreground">Accepted: JPG, JPEG, PNG (max 2MB)</span>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={resolveBrandLogoUrl(logoUrl)}
          alt="Brand logo preview"
          className="h-14 w-auto rounded-md border bg-card p-1"
        />
      )}
    </div>
  );
}

export default function BrandAttributesPage() {
  const [brands, setBrands] = useState<AdminBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BrandFormState>(INITIAL_FORM);
  const [brokenBrandLogos, setBrokenBrandLogos] = useState<Record<number, boolean>>({});
  const [showAiGenerateButton, setShowAiGenerateButton] = useState(false);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiCountry, setAiCountry] = useState("United Kingdom");
  const [aiCount, setAiCount] = useState<5 | 10 | 20>(10);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiSaving, setAiSaving] = useState(false);
  const [aiGeneratedBrands, setAiGeneratedBrands] = useState<Array<{ name: string; selected: boolean }>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listAdminBrands();
      setBrands(rows);
      setSelectedIds([]);
      setBrokenBrandLogos({});
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load brands.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const loadAiToggles = async () => {
      try {
        const settings = await getApiSettings();
        const enabled = settings.some((s) => s.key_name === "brand_ai_generate" && s.is_enabled);
        setShowAiGenerateButton(enabled);
      } catch {
        setShowAiGenerateButton(false);
      }
    };

    void loadAiToggles();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Brand Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        logo_url: form.logo_url.trim() || null,
        is_active: form.is_active,
      };

      if (editingId) {
        const updated = await updateAdminBrand(editingId, payload);
        setBrands((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
        setBrokenBrandLogos((prev) => {
          const next = { ...prev };
          delete next[editingId];
          return next;
        });
        toast.success("Brand updated.");
      } else {
        const created = await createAdminBrand(payload);
        setBrands((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
        setBrokenBrandLogos((prev) => {
          const next = { ...prev };
          delete next[created.id];
          return next;
        });
        toast.success("Brand created.");
      }
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save brand.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (brand: AdminBrand, checked: boolean) => {
    setTogglingId(brand.id);
    try {
      const updated = await updateAdminBrand(brand.id, {
        name: brand.name,
        logo_url: brand.logo_url,
        is_active: checked,
      });
      setBrands((prev) => prev.map((item) => (item.id === brand.id ? updated : item)));
      if (editingId === brand.id) {
        setForm((prev) => ({ ...prev, is_active: updated.is_active }));
      }
      toast.success("Brand status updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteBrand = async (brand: AdminBrand) => {
    const confirmed = window.confirm(`Delete brand "${brand.name}"?`);
    if (!confirmed) return;

    setDeletingId(brand.id);
    try {
      await deleteAdminBrand(brand.id);
      setBrands((prev) => prev.filter((item) => item.id !== brand.id));
      setSelectedIds((prev) => prev.filter((id) => id !== brand.id));
      if (editingId === brand.id) {
        resetForm();
      }
      toast.success("Brand deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete brand.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected brand(s)?`);
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      const result = await bulkDeleteAdminBrands(selectedIds);
      await load();
      if (result.skipped > 0) {
        toast.warning(`Deleted ${result.deleted} brand(s). Skipped ${result.skipped} in use by tyres.`);
      } else {
        toast.success(`Deleted ${result.deleted} brand(s).`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to bulk delete brands.");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadAdminBrandTemplate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to download template.");
    }
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      await downloadAdminBrandExport();
      toast.success("Export successful.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to export brands.");
    } finally {
      setExporting(false);
    }
  };

  const handleImportCsv = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be selected again
    e.target.value = "";

    setImporting(true);
    try {
      const res = await importAdminBrands(file);
      if (res.errors && res.errors.length > 0) {
        toast.warning(
          `Import complete with issues. Created: ${res.created}, Updated: ${res.updated}. See console for details.`,
          { duration: 6000 }
        );
        console.warn("Brand Import Errors:", res.errors);
      } else {
        toast.success(`Import complete. Created: ${res.created}, Updated: ${res.updated}, Skipped: ${res.skipped}.`);
      }
      void load(); // Reload the brand list
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to import brands.");
    } finally {
      setImporting(false);
    }
  };

  const handleOpenAiModal = () => {
    setAiModalOpen(true);
    setAiGeneratedBrands([]);
  };

  const handleGenerateBrands = async () => {
    setAiGenerating(true);
    try {
      const generated = await generateAdminBrands({
        country: aiCountry,
        count: aiCount,
      });

      const existingLower = new Set(brands.map((b) => b.name.trim().toLowerCase()));
      const next = generated.brands.map((name) => ({
        name,
        selected: !existingLower.has(name.trim().toLowerCase()),
      }));
      setAiGeneratedBrands(next);
      toast.success(`Generated ${next.length} brands with Workatmo AI.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate brands.");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleSaveSelectedGeneratedBrands = async () => {
    const selected = aiGeneratedBrands.filter((item) => item.selected).map((item) => item.name.trim());
    if (selected.length === 0) {
      toast.error("Select at least one brand to save.");
      return;
    }

    setAiSaving(true);
    try {
      const existingLower = new Set(brands.map((b) => b.name.trim().toLowerCase()));
      const toCreate = selected.filter((name) => !existingLower.has(name.toLowerCase()));

      if (toCreate.length === 0) {
        toast.success("All selected brands already exist.");
        setAiModalOpen(false);
        return;
      }

      const created: AdminBrand[] = [];
      for (const name of toCreate) {
        const row = await createAdminBrand({
          name,
          logo_url: null,
          is_active: true,
        });
        created.push(row);
      }

      setBrands((prev) => [...prev, ...created].sort((a, b) => a.name.localeCompare(b.name)));
      setAiModalOpen(false);
      setAiGeneratedBrands([]);
      toast.success(`Saved ${created.length} brand(s) successfully.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save selected brands.");
    } finally {
      setAiSaving(false);
    }
  };

  return (
    <AdminLayout title="Brand">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Brand</CardTitle>
            <CardDescription>Create or edit brand values for tyre attributes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brand_name">Brand Name</Label>
                <Input
                  id="brand_name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Michelin"
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center justify-between rounded-md border p-3">
                  <span className="text-sm text-muted-foreground">
                    {form.is_active ? "Active" : "Inactive"}
                  </span>
                  <Switch
                    checked={form.is_active}
                    onCheckedChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Logo (Upload only)</Label>
              <BrandLogoUploader
                logoUrl={form.logo_url}
                onUrlChange={(value) => setForm((prev) => ({ ...prev, logo_url: value }))}
              />
            </div>

            <div className="flex gap-2">
              <Button disabled={saving} onClick={() => void handleSubmit()}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                {editingId ? "Update Brand" : "Create Brand"}
              </Button>
              {showAiGenerateButton ? (
                <Button type="button" variant="secondary" onClick={handleOpenAiModal}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate with Workatmo AI
                </Button>
              ) : null}
              {editingId && (
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <CardTitle>Brand List</CardTitle>
              <CardDescription>Click Edit to populate the form above.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => void handleDownloadTemplate()}>
                Template
              </Button>
              <Button variant="outline" size="sm" onClick={() => void handleExportCsv()} disabled={exporting}>
                {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                Export CSV
              </Button>
              <div className="relative inline-block mt-2 sm:mt-0">
                <input
                  type="file"
                  accept=".csv,.txt"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={(e) => void handleImportCsv(e)}
                  disabled={importing}
                />
                <Button variant="secondary" size="sm" disabled={importing}>
                  {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
                  Import CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedIds.length > 0 && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-border p-3">
                <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  disabled={bulkDeleting}
                  onClick={() => void handleBulkDelete()}
                >
                  {bulkDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Bulk Delete
                </Button>
              </div>
            )}

            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading brands...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={brands.length > 0 && brands.every((b) => selectedIds.includes(b.id))}
                        onCheckedChange={(v) => {
                          if (!v) {
                            setSelectedIds([]);
                            return;
                          }
                          setSelectedIds(brands.map((b) => b.id));
                        }}
                        aria-label="Select all brands"
                      />
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Logo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {brands.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No brands yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    brands.map((brand) => (
                      <TableRow key={brand.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.includes(brand.id)}
                            onCheckedChange={(v) => {
                              const checked = Boolean(v);
                              setSelectedIds((prev) => {
                                if (checked) return prev.includes(brand.id) ? prev : [...prev, brand.id];
                                return prev.filter((id) => id !== brand.id);
                              });
                            }}
                            aria-label={`Select ${brand.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{brand.name}</TableCell>
                        <TableCell>
                          {brand.logo_url && !brokenBrandLogos[brand.id] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={resolveBrandLogoUrl(brand.logo_url)}
                              alt={brand.name}
                              className="h-8 w-auto rounded border p-0.5"
                              onError={() =>
                                setBrokenBrandLogos((prev) => ({
                                  ...prev,
                                  [brand.id]: true,
                                }))
                              }
                            />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Switch
                              checked={brand.is_active}
                              disabled={togglingId === brand.id}
                              onCheckedChange={(checked) => void handleToggleStatus(brand, checked)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {brand.is_active ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(brand.id);
                                setForm({
                                  name: brand.name,
                                  logo_url: brand.logo_url ?? "",
                                  is_active: brand.is_active,
                                });
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              disabled={deletingId === brand.id}
                              onClick={() => void handleDeleteBrand(brand)}
                            >
                              {deletingId === brand.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent className="sm:max-w-xl p-6">
          <DialogHeader>
            <DialogTitle>Generate Brands with Workatmo AI</DialogTitle>
            <DialogDescription>
              Choose a country and quantity, generate a preview, then select what to save.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={aiCountry} onValueChange={(value) => setAiCountry(value ?? "United Kingdom")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "United Kingdom",
                      "United States",
                      "Germany",
                      "France",
                      "Italy",
                      "Spain",
                      "India",
                      "Japan",
                      "Australia",
                      "Canada",
                    ].map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Brands</Label>
                <Select
                  value={String(aiCount)}
                  onValueChange={(value) => {
                    const next = Number(value ?? "10");
                    if (next === 5 || next === 10 || next === 20) {
                      setAiCount(next);
                    }
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select count" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-start">
              <Button type="button" onClick={() => void handleGenerateBrands()} disabled={aiGenerating}>
                {aiGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {aiGenerating ? "Generating..." : "Generate Brands"}
              </Button>
            </div>

            {aiGeneratedBrands.length > 0 && (
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Preview</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setAiGeneratedBrands((prev) =>
                        prev.map((item) => ({
                          ...item,
                          selected: true,
                        })),
                      )
                    }
                  >
                    Select All
                  </Button>
                </div>

                <div className="max-h-56 overflow-auto space-y-2">
                  {aiGeneratedBrands.map((item, idx) => {
                    const existsAlready = brands.some((b) => b.name.trim().toLowerCase() === item.name.trim().toLowerCase());
                    return (
                      <label
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-md border px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) =>
                              setAiGeneratedBrands((prev) =>
                                prev.map((row, rowIndex) =>
                                  rowIndex === idx
                                    ? {
                                        ...row,
                                        selected: Boolean(checked),
                                      }
                                    : row,
                                ),
                              )
                            }
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                        {existsAlready ? <span className="text-xs text-muted-foreground">Already exists</span> : null}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="bg-transparent border-0 p-0 mt-2">
            <Button type="button" variant="secondary" onClick={() => setAiModalOpen(false)} disabled={aiSaving || aiGenerating}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleSaveSelectedGeneratedBrands()}
              disabled={aiSaving || aiGenerating || aiGeneratedBrands.length === 0}
            >
              {aiSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Selected Brands
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

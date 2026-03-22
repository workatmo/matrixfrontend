"use client";

import AdminLayout from "@/components/admin/Layout";
import {
  getAdminSettings,
  saveAdminSettings,
  uploadAdminLogo,
  type AdminSettings,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Save,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const INITIAL: AdminSettings = {
  brand_name: "",
  logo_url: "",
  website_title: "",
  address: "",
  contact_number: "",
  vat_number: "",
  vat_percentage: "",
  vat_enabled: "1",
  platform_fee: "",
  platform_fee_enabled: "1",
  maintenance_mode: "0",
  maintenance_message: "",
};

// ── Logo upload widget ────────────────────────────────────────────────────────

function LogoUpload({
  logoUrl,
  onUrlChange,
}: {
  logoUrl: string;
  onUrlChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // Show preview from URL on load
  useEffect(() => {
    setPreview(logoUrl || null);
  }, [logoUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploadError(null);
    setUploading(true);

    try {
      const url = await uploadAdminLogo(file);
      onUrlChange(url);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Logo upload failed."
      );
      setPreview(logoUrl || null); // revert preview
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUrlChange("");
    setUploadError(null);
  };

  return (
    <div className="space-y-4">
      {/* Preview / drop zone */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl border-2 border-dashed transition-colors",
          preview
            ? "border-border bg-muted/30 p-2"
            : "border-border bg-muted hover:border-ring cursor-pointer p-8"
        )}
        onClick={() => !preview && fileRef.current?.click()}
      >
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview}
              alt="Logo preview"
              className="max-h-32 max-w-full object-contain rounded-lg"
            />
            {uploading && (
              <div className="absolute inset-0 rounded-xl bg-background/60 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
              </div>
            )}
            {!uploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 w-7 h-7 rounded-full shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                title="Remove logo"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-60" />
            <span className="text-sm font-medium text-center">
              Click to upload logo<br />
              <span className="text-xs font-normal text-muted-foreground/70 mt-1 block">JPG, PNG, WebP, SVG · max 2 MB</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="secondary"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="text-xs"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          {uploading ? "Uploading…" : "Choose file"}
        </Button>
        {logoUrl && (
          <p className="text-xs text-muted-foreground truncate max-w-[200px] sm:max-w-[400px]">
            {logoUrl}
          </p>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />

      {uploadError && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {uploadError}
        </p>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [settings, setSettings] = useState<AdminSettings>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getAdminSettings();
      setSettings({
        brand_name: data.brand_name ?? "",
        logo_url: data.logo_url ?? "",
        website_title: data.website_title ?? "",
        address: data.address ?? "",
        contact_number: data.contact_number ?? "",
        vat_number: data.vat_number ?? "",
        vat_percentage: data.vat_percentage ?? "",
        vat_enabled: data.vat_enabled ?? "1",
        platform_fee: data.platform_fee ?? "",
        platform_fee_enabled: data.platform_fee_enabled ?? "1",
        maintenance_mode: data.maintenance_mode ?? "0",
        maintenance_message: data.maintenance_message ?? "We are currently undergoing scheduled maintenance. Please check back soon.",
      });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const set = (key: keyof AdminSettings) => (value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "vat_enabled" | "platform_fee_enabled" | "maintenance_mode") => (checked: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: checked ? "1" : "0" }));

  const handleSave = async () => {
    if (!settings.brand_name.trim()) {
      setSaveStatus("error");
      setSaveMessage("Brand Name is required.");
      return;
    }
    setSaving(true);
    setSaveStatus("idle");
    setSaveMessage(null);
    try {
      const updated = await saveAdminSettings(settings);
      setSettings({
        brand_name: updated.brand_name ?? "",
        logo_url: updated.logo_url ?? "",
        website_title: updated.website_title ?? "",
        address: updated.address ?? "",
        contact_number: updated.contact_number ?? "",
        vat_number: updated.vat_number ?? "",
        vat_percentage: updated.vat_percentage ?? "",
        vat_enabled: updated.vat_enabled ?? "1",
        platform_fee: updated.platform_fee ?? "",
        platform_fee_enabled: updated.platform_fee_enabled ?? "1",
        maintenance_mode: updated.maintenance_mode ?? "0",
        maintenance_message: updated.maintenance_message ?? "We are currently undergoing scheduled maintenance. Please check back soon.",
      });
      setSaveStatus("success");
      setSaveMessage("Settings saved successfully.");
    } catch (e) {
      setSaveStatus("error");
      setSaveMessage(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
      setTimeout(() => { setSaveStatus("idle"); setSaveMessage(null); }, 4000);
    }
  };

  const vatEnabled = settings.vat_enabled === "1";
  const feeEnabled = settings.platform_fee_enabled === "1";
  const maintenanceEnabled = settings.maintenance_mode === "1";

  return (
    <AdminLayout title="Settings">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-2">
            Manage general and business settings for your platform.
          </p>
        </div>

        {loadError && (
          <div role="alert" className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{loadError}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-12 text-muted-foreground text-sm justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading settings...
          </div>
        ) : (
          <div className="space-y-6">
            {/* ── General Settings ── */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Brand identity, contact details, and public-facing information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="brand_name">Brand Name <span className="text-destructive">*</span></Label>
                    <Input 
                      id="brand_name" 
                      value={settings.brand_name} 
                      placeholder="e.g. Matrix Tyres" 
                      onChange={(e) => set("brand_name")(e.target.value)} 
                    />
                    <p className="text-[0.8rem] text-muted-foreground">Shown across the platform and invoices.</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="website_title">Website Title</Label>
                    <Input 
                      id="website_title" 
                      value={settings.website_title} 
                      placeholder="e.g. Matrix — Fast Tyre Fitting" 
                      onChange={(e) => set("website_title")(e.target.value)} 
                    />
                    <p className="text-[0.8rem] text-muted-foreground">Used for SEO and browser tab titles.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Brand Logo</Label>
                  <LogoUpload
                    logoUrl={settings.logo_url}
                    onUrlChange={set("logo_url")}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      value={settings.address}
                      placeholder={"e.g. 123 High Street\nLondon, EC1A 1BB\nUnited Kingdom"}
                      onChange={(e) => set("address")(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      type="tel"
                      value={settings.contact_number}
                      placeholder="e.g. +44 20 1234 5678"
                      onChange={(e) => set("contact_number")(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Business Settings ── */}
            <Card>
              <CardHeader>
                <CardTitle>Business & Tax Settings</CardTitle>
                <CardDescription>
                  Configure VAT and platform fees applied to orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* VAT Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable VAT</Label>
                      <p className="text-[0.8rem] text-muted-foreground">Apply VAT to all applicable orders and services.</p>
                    </div>
                    <Switch checked={vatEnabled} onCheckedChange={toggle("vat_enabled")} />
                  </div>

                  {vatEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <Label htmlFor="vat_number">VAT Registration Number</Label>
                        <Input 
                          id="vat_number" 
                          value={settings.vat_number} 
                          placeholder="e.g. GB 123 456 789" 
                          onChange={(e) => set("vat_number")(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="vat_percentage">Standard VAT Rate (%)</Label>
                        <Input 
                          id="vat_percentage" 
                          type="number" 
                          value={settings.vat_percentage} 
                          placeholder="20" 
                          min="0" 
                          max="100" 
                          step="0.01" 
                          onChange={(e) => set("vat_percentage")(e.target.value)} 
                        />
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Platform Fee Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base">Platform Fee</Label>
                      <p className="text-[0.8rem] text-muted-foreground">Apply a fixed platform processing fee to all orders.</p>
                    </div>
                    <Switch checked={feeEnabled} onCheckedChange={toggle("platform_fee_enabled")} />
                  </div>

                  {feeEnabled && (
                    <div className="space-y-3 max-w-[240px] pt-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="platform_fee">Fee Amount (£)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">£</span>
                        <Input 
                          id="platform_fee" 
                          type="number" 
                          value={settings.platform_fee} 
                          placeholder="0.00" 
                          min="0" 
                          step="0.01" 
                          className="pl-7"
                          onChange={(e) => set("platform_fee")(e.target.value)} 
                        />
                      </div>
                      <p className="text-[0.8rem] text-muted-foreground">Amount added at checkout.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ── Platform Maintenance ── */}
            <Card className={cn("transition-colors", maintenanceEnabled ? "border-destructive/50 shadow-sm" : "")}>
              <CardHeader>
                <CardTitle className={cn(maintenanceEnabled ? "text-destructive" : "")}>Platform Maintenance</CardTitle>
                <CardDescription>
                  Enable maintenance mode to disable public access while you perform updates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Maintenance Mode</Label>
                    <p className="text-[0.8rem] text-muted-foreground">Turn offline the frontend website.</p>
                  </div>
                  <Switch checked={maintenanceEnabled} onCheckedChange={toggle("maintenance_mode")} />
                </div>

                {maintenanceEnabled && (
                  <div className="space-y-3 pt-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="maintenance_message">Public Notice Message</Label>
                    <Textarea 
                      id="maintenance_message" 
                      value={settings.maintenance_message} 
                      placeholder="e.g. We are currently undergoing scheduled maintenance." 
                      rows={3}
                      onChange={(e) => set("maintenance_message")(e.target.value)} 
                    />
                    <p className="text-[0.8rem] text-muted-foreground">This message will be shown to users trying to access the site.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Save Button */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-4">
              <div className="w-full sm:w-1/2">
                {saveStatus !== "idle" && saveMessage && (
                  <div
                    role="alert"
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg border px-4 py-3 text-sm font-medium animate-in fade-in",
                      saveStatus === "success"
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-destructive/20 bg-destructive/10 text-destructive"
                    )}
                  >
                    {saveStatus === "success" ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    )}
                    {saveMessage}
                  </div>
                )}
              </div>
              
              <Button
                disabled={saving}
                onClick={handleSave}
                size="lg"
                className="w-full sm:w-auto"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {saving ? "Saving Changes..." : "Save Settings"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

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
  Loader2,
  Save,
  Upload,
  X,
  ImageIcon,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TIMEZONES, COUNTRIES, CURRENCIES, COUNTRY_CURRENCY_MAP } from "@/lib/constants";

const INITIAL: AdminSettings = {
  brand_name: "",
  logo_url: "",
  website_title: "",
  address: "",
  contact_number: "",
  contact_email: "",
  vat_number: "",
  vat_percentage: "",
  vat_enabled: "1",
  platform_fee: "",
  platform_fee_enabled: "1",
  maintenance_mode: "0",
  maintenance_message: "",
  timezone: "",
  country: "",
  currency: "",
  online_payment: "1",
  cash_on_delivery: "1",
  smtp_enabled: "0",
  smtp_host: "",
  smtp_port: "587",
  smtp_username: "",
  smtp_password: "",
  smtp_encryption: "tls",
  smtp_from_email: "",
  smtp_from_name: "",
};

function resolvePreviewUrl(raw: string | null): string {
  if (!raw) return "";
  if (raw.startsWith("blob:")) return raw;

  try {
    const parsed = new URL(raw);
    if (parsed.pathname.startsWith("/storage/")) {
      return `/api-backend-assets${parsed.pathname}`;
    }
  } catch {}

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }
  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `/api-backend-assets${normalizedPath}`;
}

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
              src={resolvePreviewUrl(preview)}
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
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AdminSettings>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        contact_email: data.contact_email ?? "",
        vat_number: data.vat_number ?? "",
        vat_percentage: data.vat_percentage ?? "",
        vat_enabled: data.vat_enabled ?? "1",
        platform_fee: data.platform_fee ?? "",
        platform_fee_enabled: data.platform_fee_enabled ?? "1",
        maintenance_mode: data.maintenance_mode ?? "0",
        maintenance_message: data.maintenance_message ?? "We are currently undergoing scheduled maintenance. Please check back soon.",
        timezone: data.timezone ?? "",
        country: data.country ?? "",
        currency: data.currency ?? "",
        online_payment: data.online_payment ?? "1",
        cash_on_delivery: data.cash_on_delivery ?? "1",
        smtp_enabled: data.smtp_enabled ?? "0",
        smtp_host: data.smtp_host ?? "",
        smtp_port: data.smtp_port ?? "587",
        smtp_username: data.smtp_username ?? "",
        smtp_password: data.smtp_password ?? "",
        smtp_encryption: data.smtp_encryption ?? "tls",
        smtp_from_email: data.smtp_from_email ?? "",
        smtp_from_name: data.smtp_from_name ?? "",
      });
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    setMounted(true);
    void load(); 
  }, [load]);

  const formatTz = (tz: string) => {
    if (!mounted) return tz;
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        timeZoneName: 'shortOffset',
        hour: '2-digit',
        minute: '2-digit'
      });
      return `${tz} (${formatter.format(new Date())})`;
    } catch {
      return tz;
    }
  };

  const set = (key: keyof AdminSettings) => (value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "vat_enabled" | "platform_fee_enabled" | "maintenance_mode" | "online_payment" | "cash_on_delivery" | "smtp_enabled") => (checked: boolean) =>
    setSettings((prev) => ({ ...prev, [key]: checked ? "1" : "0" }));

  const handleSave = async () => {
    if (!settings.brand_name.trim()) {
      toast.error("Brand Name is required.");
      return;
    }
    setSaving(true);
    try {
      const updated = await saveAdminSettings(settings);
      setSettings({
        brand_name: updated.brand_name ?? "",
        logo_url: updated.logo_url ?? "",
        website_title: updated.website_title ?? "",
        address: updated.address ?? "",
        contact_number: updated.contact_number ?? "",
        contact_email: updated.contact_email ?? "",
        vat_number: updated.vat_number ?? "",
        vat_percentage: updated.vat_percentage ?? "",
        vat_enabled: updated.vat_enabled ?? "1",
        platform_fee: updated.platform_fee ?? "",
        platform_fee_enabled: updated.platform_fee_enabled ?? "1",
        maintenance_mode: updated.maintenance_mode ?? "0",
        maintenance_message: updated.maintenance_message ?? "We are currently undergoing scheduled maintenance. Please check back soon.",
        timezone: updated.timezone ?? "",
        country: updated.country ?? "",
        currency: updated.currency ?? "",
        online_payment: updated.online_payment ?? "1",
        cash_on_delivery: updated.cash_on_delivery ?? "1",
        smtp_enabled: updated.smtp_enabled ?? "0",
        smtp_host: updated.smtp_host ?? "",
        smtp_port: updated.smtp_port ?? "587",
        smtp_username: updated.smtp_username ?? "",
        smtp_password: updated.smtp_password ?? "",
        smtp_encryption: updated.smtp_encryption ?? "tls",
        smtp_from_email: updated.smtp_from_email ?? "",
        smtp_from_name: updated.smtp_from_name ?? "",
      });
      toast.success("Settings saved successfully.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const vatEnabled = settings.vat_enabled === "1";
  const feeEnabled = settings.platform_fee_enabled === "1";
  const maintenanceEnabled = settings.maintenance_mode === "1";
  const onlinePaymentEnabled = settings.online_payment === "1";
  const codEnabled = settings.cash_on_delivery === "1";
  const smtpEnabled = settings.smtp_enabled === "1";

  const currencySymbol = mounted && settings.currency
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.currency }).formatToParts(0).find(p => p.type === 'currency')?.value || "£"
    : "£";

  return (
    <AdminLayout title="Settings">
      <div className="w-full space-y-8">
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
                  <div className="space-y-3">
                    <Label htmlFor="contact_email">Mail ID</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={settings.contact_email}
                      placeholder="e.g. support@example.com"
                      onChange={(e) => set("contact_email")(e.target.value)}
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
                  Configure VAT/GST and platform fees applied to orders.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* VAT/GST Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-0.5">
                      <Label className="text-base">Enable VAT/GST</Label>
                      <p className="text-[0.8rem] text-muted-foreground">Apply VAT or GST to all applicable orders and services.</p>
                    </div>
                    <Switch checked={vatEnabled} onCheckedChange={toggle("vat_enabled")} />
                  </div>

                  {vatEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2">
                      <div className="space-y-3">
                        <Label htmlFor="vat_number">VAT/GST Registration Number</Label>
                        <Input 
                          id="vat_number" 
                          value={settings.vat_number} 
                          placeholder="e.g. GB 123 456 789" 
                          onChange={(e) => set("vat_number")(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="vat_percentage">Standard VAT/GST Rate (%)</Label>
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
                      <Label htmlFor="platform_fee">Fee Amount ({currencySymbol})</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">{currencySymbol}</span>
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

            {/* ── Localization Settings ── */}
            <Card>
              <CardHeader>
                <CardTitle>Localization Settings</CardTitle>
                <CardDescription>
                  Configure regional settings such as time zone, country, and currency.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="timezone">Time Zone</Label>
                    <Select value={settings.timezone} onValueChange={(val) => set("timezone")(val ?? "")}>
                      <SelectTrigger id="timezone" className="w-full">
                        <SelectValue placeholder="Select Time Zone" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIMEZONES.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            <span suppressHydrationWarning>{formatTz(tz)}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[0.8rem] text-muted-foreground">Default system time zone.</p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="country">Country</Label>
                    <Select 
                      value={settings.country} 
                      onValueChange={(val) => {
                        const country = val ?? "";
                        set("country")(country);
                        if (country && COUNTRY_CURRENCY_MAP[country]) {
                          set("currency")(COUNTRY_CURRENCY_MAP[country]);
                        }
                      }}
                    >
                      <SelectTrigger id="country" className="w-full">
                        <SelectValue placeholder="Select Country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[0.8rem] text-muted-foreground">Main country of operation.</p>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={settings.currency} onValueChange={(val) => set("currency")(val ?? "")}>
                      <SelectTrigger id="currency" className="w-full">
                        <SelectValue placeholder="Select Currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((c) => (
                          <SelectItem key={c} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-[0.8rem] text-muted-foreground">Default currency code.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ── Payment Methods ── */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Configure allowed payment methods for checkout.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Online Payment</Label>
                    <p className="text-[0.8rem] text-muted-foreground">Allow customers to pay via credit card, Apple Pay, etc.</p>
                  </div>
                  <Switch checked={onlinePaymentEnabled} onCheckedChange={toggle("online_payment")} />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Cash on Delivery</Label>
                    <p className="text-[0.8rem] text-muted-foreground">Allow customers to pay when the service is completed.</p>
                  </div>
                  <Switch checked={codEnabled} onCheckedChange={toggle("cash_on_delivery")} />
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

            {/* ── SMTP Settings ── */}
            <Card>
              <CardHeader>
                <CardTitle>SMTP Settings</CardTitle>
                <CardDescription>
                  Configure outgoing mail server details for transactional emails.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                  <div className="space-y-0.5">
                    <Label className="text-base">Enable SMTP</Label>
                    <p className="text-[0.8rem] text-muted-foreground">Turn on custom SMTP delivery for platform emails.</p>
                  </div>
                  <Switch checked={smtpEnabled} onCheckedChange={toggle("smtp_enabled")} />
                </div>

                {smtpEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-3">
                      <Label htmlFor="smtp_host">SMTP Host</Label>
                      <Input
                        id="smtp_host"
                        value={settings.smtp_host}
                        placeholder="e.g. smtp.mailgun.org"
                        onChange={(e) => set("smtp_host")(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="smtp_port">SMTP Port</Label>
                      <Input
                        id="smtp_port"
                        type="number"
                        min="1"
                        max="65535"
                        value={settings.smtp_port}
                        placeholder="587"
                        onChange={(e) => set("smtp_port")(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="smtp_username">SMTP Username</Label>
                      <Input
                        id="smtp_username"
                        value={settings.smtp_username}
                        placeholder="e.g. postmaster@example.com"
                        onChange={(e) => set("smtp_username")(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="smtp_password">SMTP Password</Label>
                      <Input
                        id="smtp_password"
                        type="password"
                        value={settings.smtp_password}
                        placeholder="Enter SMTP password"
                        onChange={(e) => set("smtp_password")(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="smtp_encryption">Encryption</Label>
                      <Select value={settings.smtp_encryption} onValueChange={(val) => set("smtp_encryption")(val ?? "none")}>
                        <SelectTrigger id="smtp_encryption" className="w-full">
                          <SelectValue placeholder="Select encryption" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="tls">TLS</SelectItem>
                          <SelectItem value="ssl">SSL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="smtp_from_email">From Email</Label>
                      <Input
                        id="smtp_from_email"
                        type="email"
                        value={settings.smtp_from_email}
                        placeholder="e.g. no-reply@example.com"
                        onChange={(e) => set("smtp_from_email")(e.target.value)}
                      />
                    </div>

                    <div className="space-y-3 md:col-span-2">
                      <Label htmlFor="smtp_from_name">From Name</Label>
                      <Input
                        id="smtp_from_name"
                        value={settings.smtp_from_name}
                        placeholder="e.g. Matrix Tyres"
                        onChange={(e) => set("smtp_from_name")(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status & Save Button */}
            <div className="flex justify-end pt-4">
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

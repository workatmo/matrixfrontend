"use client";

import AdminLayout from "@/components/admin/Layout";
import {
  getApiSettings,
  toggleApiSetting,
  updateApiKey,
  type ApiSettingResource,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { CircleDot, DollarSign, Globe, MapPin, Pencil, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface ApiDisplayEntry {
  id: number;
  name: string;
  description: string;
  /** Masked preview from API, or placeholder when none */
  keyDisplay: string;
  hasKey: boolean;
  icon: React.ElementType;
  iconBg: string;
  enabled: boolean;
}

const API_SETTINGS_ICON_BY_TYPE: Record<
  string,
  { icon: React.ElementType; iconBg: string }
> = {
  dvla: { icon: Globe, iconBg: "bg-blue-500/10 text-blue-500" },
  maps: { icon: MapPin, iconBg: "bg-green-500/10 text-green-500" },
  workatmo_tyre: {
    icon: CircleDot,
    iconBg: "bg-violet-500/10 text-violet-500",
  },
  openai: {
    icon: CircleDot,
    iconBg: "bg-violet-500/10 text-violet-500",
  },
  paypal: { icon: DollarSign, iconBg: "bg-yellow-500/10 text-yellow-500" },
};

function iconMetaForType(iconType: string): {
  icon: React.ElementType;
  iconBg: string;
} {
  return (
    API_SETTINGS_ICON_BY_TYPE[iconType] ?? {
      icon: Globe,
      iconBg: "bg-muted text-muted-foreground",
    }
  );
}

/** `key_name` is stable; label/description in DB may lag until API Settings is hit on a fresh backend. */
function canonicalApiCopy(r: ApiSettingResource): {
  name: string;
  description: string;
  iconType: string;
} {
  if (r.key_name === "openai") {
    return {
      name: "Workatmo Tyre Api",
      description:
        "Tyre recommendations and related intelligence via the Workatmo tyre API.",
      iconType: "workatmo_tyre",
    };
  }
  return {
    name: r.label,
    description: r.description ?? "",
    iconType: r.icon_type,
  };
}

function resourceToEntry(r: ApiSettingResource): ApiDisplayEntry {
  const copy = canonicalApiCopy(r);
  const meta = iconMetaForType(copy.iconType);
  return {
    id: r.id,
    name: copy.name,
    description: copy.description,
    keyDisplay: r.value ?? (r.has_key ? "••••••••" : "No key configured"),
    hasKey: r.has_key,
    icon: meta.icon,
    iconBg: meta.iconBg,
    enabled: r.is_enabled,
  };
}

function mergeFromResource(
  entry: ApiDisplayEntry,
  r: ApiSettingResource,
): ApiDisplayEntry {
  const copy = canonicalApiCopy(r);
  const meta = iconMetaForType(copy.iconType);
  return {
    ...entry,
    name: copy.name,
    description: copy.description,
    keyDisplay: r.value ?? (r.has_key ? "••••••••" : "No key configured"),
    hasKey: r.has_key,
    icon: meta.icon,
    iconBg: meta.iconBg,
    enabled: r.is_enabled,
  };
}

function Toggle({
  enabled,
  disabled,
  onToggle,
}: {
  enabled: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
        enabled ? "bg-emerald-500" : "bg-border",
      )}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          enabled ? "translate-x-6" : "translate-x-1",
        )}
      />
    </button>
  );
}

function EditModal({
  api,
  onClose,
  onSave,
}: {
  api: ApiDisplayEntry;
  onClose: () => void;
  onSave: (key: string) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed && api.hasKey) {
      onClose();
      return;
    }
    if (!trimmed && !api.hasKey) {
      setError("Enter an API key.");
      return;
    }
    setSaving(true);
    try {
      await onSave(trimmed);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save API key.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
        <div className="flex items-center gap-3 mb-5">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              api.iconBg,
            )}
          >
            <api.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">{api.name}</h3>
            <p className="text-muted-foreground text-xs">Update API key</p>
          </div>
        </div>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          API Key
        </label>
        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-ring transition-colors"
          placeholder={
            api.hasKey
              ? "Enter a new key to replace the current one"
              : "Enter API key…"
          }
        />
        {api.hasKey ? (
          <p className="text-muted-foreground/60 text-xs mt-1.5">
            Current (masked): <span className="font-mono">{api.keyDisplay}</span>
          </p>
        ) : (
          <p className="text-muted-foreground/60 text-xs mt-1.5">
            {api.description}
          </p>
        )}
        {error ? (
          <p className="text-red-500 text-xs mt-2" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex justify-end gap-3 mt-5">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-ring rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Key"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApiSettingsPage() {
  const [apis, setApis] = useState<ApiDisplayEntry[]>([]);
  const [editing, setEditing] = useState<ApiDisplayEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getApiSettings();
      setApis(rows.map(resourceToEntry));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load API settings");
      setApis([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleApi = async (id: number) => {
    const snapshot = apis;
    setApis((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a)),
    );
    setTogglingId(id);
    setError(null);
    try {
      const updated = await toggleApiSetting(id);
      setApis((prev) =>
        prev.map((a) => (a.id === id ? mergeFromResource(a, updated) : a)),
      );
    } catch (e) {
      setApis(snapshot);
      setError(e instanceof Error ? e.message : "Failed to update setting");
    } finally {
      setTogglingId(null);
    }
  };

  const persistKey = async (id: number, key: string) => {
    const updated = await updateApiKey(id, key);
    setApis((prev) =>
      prev.map((a) => (a.id === id ? mergeFromResource(a, updated) : a)),
    );
  };

  const enabledCount = apis.filter((a) => a.enabled).length;

  return (
    <AdminLayout title="API Settings">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">API Settings</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Super Admin only — DVLA, maps, PayPal, and Workatmo Tyre API keys
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {loading ? "…" : `${enabledCount} of ${apis.length || "—"} active`}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full font-medium border border-red-500/20">
              <Shield className="w-3.5 h-3.5" />
              Restricted Access
            </div>
          </div>
        </div>

        {error ? (
          <div
            className="rounded-2xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading API settings…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {apis.map((api) => {
              const Icon = api.icon;
              return (
                <div
                  key={api.id}
                  className={cn(
                    "bg-card border rounded-2xl p-5 transition-all duration-200",
                    api.enabled ? "border-border" : "border-border opacity-60",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                          api.iconBg,
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-foreground font-semibold text-sm">
                            {api.name}
                          </p>
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full font-medium",
                              api.enabled
                                ? "text-emerald-500 bg-emerald-500/10"
                                : "text-muted-foreground bg-muted",
                            )}
                          >
                            {api.enabled ? "Active" : "Inactive"}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                          {api.description}
                        </p>

                        <code className="mt-2.5 inline-block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                          {api.keyDisplay}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5">
                      <Toggle
                        enabled={api.enabled}
                        disabled={togglingId === api.id}
                        onToggle={() => void toggleApi(api.id)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {api.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditing(api)}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-ring transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit Key
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing ? (
        <EditModal
          key={editing.id}
          api={editing}
          onClose={() => setEditing(null)}
          onSave={(key) => persistKey(editing.id, key)}
        />
      ) : null}
    </AdminLayout>
  );
}

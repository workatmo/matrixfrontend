"use client";

import AdminLayout from "@/components/admin/Layout";
import {
  getApiSettings,
  testStripeConnection,
  toggleApiSetting,
  updateApiKey,
  type ApiSettingResource,
} from "@/lib/api";
import { cn } from "@/lib/utils";
import { CircleDot, DollarSign, Globe, MapPin, Pencil, Shield } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type StripeMode = "test" | "live";
type StripeKeyKind = "secret_key" | "publishable_key" | "webhook_secret";

interface BaseDisplayEntry {
  /** Stable key for React lists */
  uiKey: string;
  /** Underlying API setting id used for toggle/update */
  activeId: number;
  name: string;
  description: string;
  /** Masked preview from API, or placeholder when none */
  keyDisplay: string;
  hasKey: boolean;
  icon: React.ElementType;
  iconBg: string;
  enabled: boolean;
  keyEditable: boolean;
}

interface NormalApiDisplayEntry extends BaseDisplayEntry {
  kind: "normal";
  id: number;
}

interface StripeApiDisplayEntry extends BaseDisplayEntry {
  kind: "stripe";
  stripe: {
    test: { id: number; enabled: boolean; hasKey: boolean; keyDisplay: string };
    live: { id: number; enabled: boolean; hasKey: boolean; keyDisplay: string };
    keys: {
      test: Record<StripeKeyKind, { id: number; hasKey: boolean; keyDisplay: string }>;
      live: Record<StripeKeyKind, { id: number; hasKey: boolean; keyDisplay: string }>;
    };
    mode: StripeMode;
  };
}

type ApiDisplayEntry = NormalApiDisplayEntry | StripeApiDisplayEntry;

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
  stripe: { icon: DollarSign, iconBg: "bg-purple-500/10 text-purple-500" },
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
  if (r.key_name === "brand_ai_generate") {
    return {
      name: "Brands Generate with AI",
      description: "Toggle Brand AI generation button visibility and usage in admin.",
      iconType: "workatmo_tyre",
    };
  }
  if (r.key_name === "size_ai_generate") {
    return {
      name: "Sizes Generate with AI",
      description: "Toggle Size AI generation button visibility and usage in admin.",
      iconType: "workatmo_tyre",
    };
  }
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
  const keyEditable = !["brand_ai_generate", "size_ai_generate", "tyre_description_ai_generate"].includes(r.key_name);
  return {
    kind: "normal",
    id: r.id,
    uiKey: String(r.id),
    activeId: r.id,
    name: copy.name,
    description: copy.description,
    keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
    hasKey: r.has_key,
    icon: meta.icon,
    iconBg: meta.iconBg,
    enabled: r.is_enabled,
    keyEditable,
  };
}

function mergeFromResource(
  entry: ApiDisplayEntry,
  r: ApiSettingResource,
): ApiDisplayEntry {
  if (entry.kind === "stripe") {
    // Stripe is represented as a grouped entry; update the matching variant and
    // keep the active variant derived from the currently selected mode.
    const next = { ...entry };
    if (r.key_name === "stripe_test") {
      next.stripe.test = {
        id: r.id,
        enabled: r.is_enabled,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_live") {
      next.stripe.live = {
        id: r.id,
        enabled: r.is_enabled,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_test_secret_key") {
      next.stripe.keys.test.secret_key = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_test_publishable_key") {
      next.stripe.keys.test.publishable_key = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_test_webhook_secret") {
      next.stripe.keys.test.webhook_secret = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_live_secret_key") {
      next.stripe.keys.live.secret_key = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_live_publishable_key") {
      next.stripe.keys.live.publishable_key = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    } else if (r.key_name === "stripe_live_webhook_secret") {
      next.stripe.keys.live.webhook_secret = {
        id: r.id,
        hasKey: r.has_key,
        keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
      };
    }

    const active = next.stripe.mode === "test" ? next.stripe.test : next.stripe.live;
    next.activeId = active.id;
    next.enabled = active.enabled;
    next.hasKey = active.hasKey;
    next.keyDisplay = active.keyDisplay;
    next.name = next.stripe.mode === "test" ? "Stripe (Test)" : "Stripe (Live)";
    next.description =
      next.stripe.mode === "test"
        ? "Manage Stripe test keys (publishable/secret/webhook)."
        : "Manage Stripe live keys (publishable/secret/webhook).";
    return next;
  }

  const copy = canonicalApiCopy(r);
  const meta = iconMetaForType(copy.iconType);
  return {
    ...entry,
    name: copy.name,
    description: copy.description,
    keyDisplay: r.value ?? (r.has_key ? "••••••••" : ""),
    hasKey: r.has_key,
    icon: meta.icon,
    iconBg: meta.iconBg,
    enabled: r.is_enabled,
    keyEditable: !["brand_ai_generate", "size_ai_generate", "tyre_description_ai_generate"].includes(r.key_name),
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

function StripeKeysModal({
  api,
  onClose,
  onSave,
}: {
  api: StripeApiDisplayEntry;
  onClose: () => void;
  onSave: (id: number, key: string) => Promise<void>;
}) {
  const [keyKind, setKeyKind] = useState<StripeKeyKind>("secret_key");
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mode = api.stripe.mode;
  const record = mode === "test" ? api.stripe.keys.test : api.stripe.keys.live;
  const current = record[keyKind];

  const label =
    keyKind === "secret_key"
      ? "Secret key"
      : keyKind === "publishable_key"
        ? "Publishable key"
        : "Webhook signing secret";

  const expectedPrefix =
    keyKind === "secret_key"
      ? mode === "test"
        ? "sk_test_"
        : "sk_live_"
      : keyKind === "publishable_key"
        ? mode === "test"
          ? "pk_test_"
          : "pk_live_"
        : "whsec_";

  const handleSave = async () => {
    setError(null);
    const trimmed = value.trim();
    if (!trimmed && current.hasKey) {
      onClose();
      return;
    }
    if (!trimmed && !current.hasKey) {
      setError("Enter a value.");
      return;
    }
    if (trimmed && !trimmed.startsWith(expectedPrefix)) {
      setError(`This does not look right. Expected to start with "${expectedPrefix}".`);
      return;
    }
    setSaving(true);
    try {
      await onSave(current.id, trimmed);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save Stripe key.");
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
            <h3 className="text-foreground font-semibold">Stripe ({mode === "test" ? "Test" : "Live"})</h3>
            <p className="text-muted-foreground text-xs">Update Stripe keys</p>
          </div>
        </div>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          Key type
        </label>
        <select
          value={keyKind}
          onChange={(e) => setKeyKind(e.target.value as StripeKeyKind)}
          className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-ring transition-colors mb-4"
        >
          <option value="secret_key">Secret key (server)</option>
          <option value="publishable_key">Publishable key (client)</option>
          <option value="webhook_secret">Webhook signing secret</option>
        </select>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          {label}
        </label>
        <input
          type="password"
          autoComplete="off"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-ring transition-colors"
          placeholder={
            current.hasKey
              ? `Enter a new value to replace the current one (expected ${expectedPrefix}…)`
              : `Enter ${expectedPrefix}…`
          }
        />
        {current.hasKey ? (
          <p className="text-muted-foreground/60 text-xs mt-1.5">
            Current (masked): <span className="font-mono">{current.keyDisplay}</span>
          </p>
        ) : (
          <p className="text-muted-foreground/60 text-xs mt-1.5">
            Expected prefix: <span className="font-mono">{expectedPrefix}</span>
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
            {saving ? "Saving…" : "Save"}
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
  const [stripeTesting, setStripeTesting] = useState<StripeMode | null>(null);
  const [stripeTestMsg, setStripeTestMsg] = useState<string | null>(null);
  const [stripeTestOk, setStripeTestOk] = useState<boolean | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getApiSettings();
      // Group Stripe test/live into a single UI entry with a dropdown.
      const stripeTest = rows.find((r) => r.key_name === "stripe_test") ?? null;
      const stripeLive = rows.find((r) => r.key_name === "stripe_live") ?? null;
      const stripeTestSecret = rows.find((r) => r.key_name === "stripe_test_secret_key") ?? null;
      const stripeTestPublishable = rows.find((r) => r.key_name === "stripe_test_publishable_key") ?? null;
      const stripeTestWebhook = rows.find((r) => r.key_name === "stripe_test_webhook_secret") ?? null;
      const stripeLiveSecret = rows.find((r) => r.key_name === "stripe_live_secret_key") ?? null;
      const stripeLivePublishable = rows.find((r) => r.key_name === "stripe_live_publishable_key") ?? null;
      const stripeLiveWebhook = rows.find((r) => r.key_name === "stripe_live_webhook_secret") ?? null;

      const nonStripe = rows.filter(
        (r) =>
          ![
            "stripe_test",
            "stripe_live",
            "stripe_test_secret_key",
            "stripe_test_publishable_key",
            "stripe_test_webhook_secret",
            "stripe_live_secret_key",
            "stripe_live_publishable_key",
            "stripe_live_webhook_secret",
          ].includes(r.key_name),
      );

      const mapped = nonStripe.map(resourceToEntry);

      if (
        stripeTest &&
        stripeLive &&
        stripeTestSecret &&
        stripeTestPublishable &&
        stripeTestWebhook &&
        stripeLiveSecret &&
        stripeLivePublishable &&
        stripeLiveWebhook
      ) {
        const icon = iconMetaForType("stripe");
        const inferredMode: StripeMode =
          stripeLive.is_enabled && !stripeTest.is_enabled
            ? "live"
            : stripeTest.is_enabled && !stripeLive.is_enabled
              ? "test"
              : "test";

        const mode: StripeMode = inferredMode;
        const active = mode === "test" ? stripeTest : stripeLive;

        const stripeEntry: StripeApiDisplayEntry = {
          kind: "stripe",
          uiKey: "stripe",
          activeId: active.id,
          name: mode === "test" ? "Stripe (Test)" : "Stripe (Live)",
          description:
            mode === "test"
              ? "Manage Stripe test keys (publishable/secret/webhook)."
              : "Manage Stripe live keys (publishable/secret/webhook).",
          keyDisplay: active.value ?? (active.has_key ? "••••••••" : ""),
          hasKey: active.has_key,
          icon: icon.icon,
          iconBg: icon.iconBg,
          enabled: active.is_enabled,
          keyEditable: true,
          stripe: {
            mode,
            test: {
              id: stripeTest.id,
              enabled: stripeTest.is_enabled,
              hasKey: stripeTest.has_key,
              keyDisplay: stripeTest.value ?? (stripeTest.has_key ? "••••••••" : ""),
            },
            live: {
              id: stripeLive.id,
              enabled: stripeLive.is_enabled,
              hasKey: stripeLive.has_key,
              keyDisplay: stripeLive.value ?? (stripeLive.has_key ? "••••••••" : ""),
            },
            keys: {
              test: {
                secret_key: {
                  id: stripeTestSecret.id,
                  hasKey: stripeTestSecret.has_key,
                  keyDisplay: stripeTestSecret.value ?? (stripeTestSecret.has_key ? "••••••••" : ""),
                },
                publishable_key: {
                  id: stripeTestPublishable.id,
                  hasKey: stripeTestPublishable.has_key,
                  keyDisplay:
                    stripeTestPublishable.value ?? (stripeTestPublishable.has_key ? "••••••••" : ""),
                },
                webhook_secret: {
                  id: stripeTestWebhook.id,
                  hasKey: stripeTestWebhook.has_key,
                  keyDisplay: stripeTestWebhook.value ?? (stripeTestWebhook.has_key ? "••••••••" : ""),
                },
              },
              live: {
                secret_key: {
                  id: stripeLiveSecret.id,
                  hasKey: stripeLiveSecret.has_key,
                  keyDisplay: stripeLiveSecret.value ?? (stripeLiveSecret.has_key ? "••••••••" : ""),
                },
                publishable_key: {
                  id: stripeLivePublishable.id,
                  hasKey: stripeLivePublishable.has_key,
                  keyDisplay:
                    stripeLivePublishable.value ?? (stripeLivePublishable.has_key ? "••••••••" : ""),
                },
                webhook_secret: {
                  id: stripeLiveWebhook.id,
                  hasKey: stripeLiveWebhook.has_key,
                  keyDisplay: stripeLiveWebhook.value ?? (stripeLiveWebhook.has_key ? "••••••••" : ""),
                },
              },
            },
          },
        };

        // Insert Stripe right after PayPal if present; otherwise append.
        const paypalIdx = mapped.findIndex((e) => e.kind === "normal" && e.uiKey && (e as NormalApiDisplayEntry).id && e.name.toLowerCase().includes("paypal"));
        if (paypalIdx >= 0) {
          mapped.splice(paypalIdx + 1, 0, stripeEntry);
        } else {
          mapped.push(stripeEntry);
        }
      } else {
        // Backends without Stripe rows will just show the remaining entries.
      }

      setApis(mapped);
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
      prev.map((a) =>
        a.activeId === id ? { ...a, enabled: !a.enabled } : a,
      ),
    );
    setTogglingId(id);
    setError(null);
    try {
      const updated = await toggleApiSetting(id);
      setApis((prev) =>
        prev.map((a) => (a.activeId === id ? mergeFromResource(a, updated) : a)),
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
      prev.map((a) => (a.activeId === id ? mergeFromResource(a, updated) : a)),
    );
  };

  const persistAnyKey = async (id: number, key: string) => {
    const updated = await updateApiKey(id, key);
    setApis((prev) => prev.map((a) => mergeFromResource(a, updated)));
  };

  const testStripe = async (mode: StripeMode) => {
    setStripeTesting(mode);
    setStripeTestMsg(null);
    setStripeTestOk(null);
    setError(null);
    try {
      const res = await testStripeConnection(mode);
      const account = res.account_id ? `Account: ${res.account_id}` : "Connected";
      const env =
        res.livemode === true ? "Live environment" : res.livemode === false ? "Test environment" : null;
      setStripeTestOk(true);
      setStripeTestMsg(
        env ? `Stripe connected (${mode}). ${account}. ${env}.` : `Stripe connected (${mode}). ${account}.`,
      );
    } catch (e) {
      setStripeTestOk(false);
      setStripeTestMsg(e instanceof Error ? e.message : "Stripe connection test failed.");
    } finally {
      setStripeTesting(null);
    }
  };

  const enabledCount = apis.filter((a) => a.enabled).length;

  return (
    <AdminLayout title="API Settings">
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">API Settings</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Super Admin only — DVLA, maps, PayPal, Stripe, and Workatmo Tyre API keys
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
        {/* Stripe test result is rendered inside the Stripe card (closer to the action). */}

        {loading ? (
          <p className="text-muted-foreground text-sm">Loading API settings…</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {apis.map((api) => {
              const Icon = api.icon;
              return (
                <div
                  key={api.kind === "stripe" ? "stripe" : `api-${api.id}`}
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
                          {api.kind === "stripe" ? (
                            <select
                              value={api.stripe.mode}
                              onChange={(e) => {
                                const mode = e.target.value as StripeMode;
                                setApis((prev) =>
                                  prev.map((x) => {
                                    if (x.kind !== "stripe") return x;
                                    const next: StripeApiDisplayEntry = {
                                      ...x,
                                      stripe: { ...x.stripe, mode },
                                    };
                                    const active =
                                      mode === "test" ? next.stripe.test : next.stripe.live;
                                    next.activeId = active.id;
                                    next.enabled = active.enabled;
                                    next.hasKey = active.hasKey;
                                    next.keyDisplay = active.keyDisplay;
                                    next.name = mode === "test" ? "Stripe (Test)" : "Stripe (Live)";
                                    next.description =
                                      mode === "test"
                                        ? "Stripe test mode secret key for processing test payments."
                                        : "Stripe live mode secret key for processing real payments.";
                                    return next;
                                  }),
                                );
                              }}
                              className="text-xs bg-muted border border-border rounded-lg px-2 py-1 text-foreground"
                              aria-label="Stripe mode"
                            >
                              <option value="test">Test</option>
                              <option value="live">Live</option>
                            </select>
                          ) : null}
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

                        {api.kind === "stripe" && stripeTestMsg ? (
                          <div
                            className={cn(
                              "mt-2 rounded-xl border px-3 py-2 text-xs",
                              stripeTestOk === true
                                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                : stripeTestOk === false
                                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                                  : "border-border bg-muted/40 text-foreground",
                            )}
                          >
                            {stripeTestMsg}
                          </div>
                        ) : null}

                        {api.keyEditable && api.hasKey ? (
                          <code className="mt-2.5 inline-block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                            {api.keyDisplay}
                          </code>
                        ) : null}

                        {api.kind === "stripe" ? (
                          <div className="mt-2.5 space-y-1">
                            <code className="block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                              {`Publishable: ${
                                (api.stripe.mode === "test"
                                  ? api.stripe.keys.test.publishable_key
                                  : api.stripe.keys.live.publishable_key
                                ).keyDisplay
                              }`}
                            </code>
                            <code className="block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                              {`Secret: ${
                                (api.stripe.mode === "test"
                                  ? api.stripe.keys.test.secret_key
                                  : api.stripe.keys.live.secret_key
                                ).keyDisplay
                              }`}
                            </code>
                            <code className="block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                              {`Webhook: ${
                                (api.stripe.mode === "test"
                                  ? api.stripe.keys.test.webhook_secret
                                  : api.stripe.keys.live.webhook_secret
                                ).keyDisplay
                              }`}
                            </code>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-2.5">
                      <Toggle
                        enabled={api.enabled}
                        disabled={togglingId === api.activeId}
                        onToggle={() => void toggleApi(api.activeId)}
                      />
                      <span className="text-xs text-muted-foreground">
                        {api.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {api.kind === "stripe" ? (
                        <button
                          type="button"
                          disabled={stripeTesting !== null}
                          onClick={() => void testStripe(api.stripe.mode)}
                          className="text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-ring transition-colors disabled:opacity-50"
                        >
                          {stripeTesting === api.stripe.mode ? "Testing…" : "Test Stripe"}
                        </button>
                      ) : null}
                      {api.keyEditable ? (
                        <button
                          type="button"
                          onClick={() => setEditing(api)}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg border border-border hover:border-ring transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit Key
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing ? (
        editing.kind === "stripe" ? (
          <StripeKeysModal
            key="stripe"
            api={editing}
            onClose={() => setEditing(null)}
            onSave={(id, key) => persistAnyKey(id, key)}
          />
        ) : (
          <EditModal
            key={`api-${editing.id}`}
            api={editing}
            onClose={() => setEditing(null)}
            onSave={(key) => persistKey(editing.activeId, key)}
          />
        )
      ) : null}
    </AdminLayout>
  );
}

"use client";

import AdminLayout from "@/components/admin/Layout";
import { Shield, Globe, Pencil, Brain, DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ApiEntry {
  id: number;
  name: string;
  description: string;
  key: string;
  icon: React.ElementType;
  iconBg: string;
  enabled: boolean;
}

const initialApis: ApiEntry[] = [
  {
    id: 1,
    name: "DVLA Vehicle Enquiry API",
    description: "Look up UK vehicle registration details and MOT history via the DVLA database.",
    key: "dvla_sk_••••••••••••••••••••••••3f8a",
    icon: Globe,
    iconBg: "bg-blue-500/10 text-blue-500",
    enabled: true,
  },
  {
    id: 2,
    name: "Google Maps Platform",
    description: "Geocoding, place search, and distance matrix for tyre fitting location services.",
    key: "AIza••••••••••••••••••••••••••••••",
    icon: Globe,
    iconBg: "bg-green-500/10 text-green-500",
    enabled: true,
  },
  {
    id: 3,
    name: "ChatGPT (OpenAI)",
    description: "AI-powered customer support, tyre recommendations, and intelligent search.",
    key: "sk-proj-••••••••••••••••••••••••••••",
    icon: Brain,
    iconBg: "bg-purple-500/10 text-purple-500",
    enabled: false,
  },
  {
    id: 4,
    name: "PayPal Payments",
    description: "Accept PayPal payments and manage refunds for tyre orders and bookings.",
    key: "live_••••••••••••••••••••••••••••••",
    icon: DollarSign,
    iconBg: "bg-yellow-500/10 text-yellow-500",
    enabled: true,
  },
];

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none",
        enabled ? "bg-emerald-500" : "bg-border"
      )}
      aria-label={enabled ? "Disable" : "Enable"}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200",
          enabled ? "translate-x-6" : "translate-x-1"
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
  api: ApiEntry;
  onClose: () => void;
  onSave: (key: string) => void;
}) {
  const [value, setValue] = useState(api.key);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", api.iconBg)}>
            <api.icon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-foreground font-semibold">{api.name}</h3>
            <p className="text-muted-foreground text-xs">Update API key</p>
          </div>
        </div>

        {/* Input */}
        <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
          API Key
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-muted border border-border rounded-xl px-4 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:border-ring transition-colors"
          placeholder="Enter API key..."
        />
        <p className="text-muted-foreground/60 text-xs mt-1.5">
          {api.description}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border hover:border-ring rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onSave(value); onClose(); }}
            className="px-4 py-2 text-sm font-semibold bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity"
          >
            Save Key
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ApiSettingsPage() {
  const [apis, setApis] = useState<ApiEntry[]>(initialApis);
  const [editing, setEditing] = useState<ApiEntry | null>(null);

  const toggleApi = (id: number) => {
    setApis((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const saveKey = (id: number, key: string) => {
    setApis((prev) =>
      prev.map((a) => (a.id === id ? { ...a, key } : a))
    );
  };

  const enabledCount = apis.filter((a) => a.enabled).length;

  return (
    <AdminLayout title="API Settings">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">API Settings</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Super Admin only — manage all API keys and integrations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              {enabledCount} of {apis.length} active
            </div>
            <div className="flex items-center gap-1.5 text-xs text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full font-medium border border-red-500/20">
              <Shield className="w-3.5 h-3.5" />
              Restricted Access
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 text-sm font-medium">Security Notice</p>
            <p className="text-yellow-500/70 text-xs mt-1">
              API keys grant access to external services. Never share them publicly. Rotate keys immediately if compromised.
            </p>
          </div>
        </div>

        {/* API Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {apis.map((api) => {
            const Icon = api.icon;
            return (
              <div
                key={api.id}
                className={cn(
                  "bg-card border rounded-2xl p-5 transition-all duration-200",
                  api.enabled ? "border-border" : "border-border opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Icon + Info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", api.iconBg)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-foreground font-semibold text-sm">{api.name}</p>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          api.enabled
                            ? "text-emerald-500 bg-emerald-500/10"
                            : "text-muted-foreground bg-muted"
                        )}>
                          {api.enabled ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs mt-1 leading-relaxed">
                        {api.description}
                      </p>

                      {/* Key preview */}
                      <code className="mt-2.5 inline-block text-xs text-muted-foreground bg-muted border border-border px-3 py-1.5 rounded-lg font-mono max-w-full truncate w-full">
                        {api.key}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Footer: Toggle + Edit */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2.5">
                    <Toggle enabled={api.enabled} onToggle={() => toggleApi(api.id)} />
                    <span className="text-xs text-muted-foreground">
                      {api.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <button
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
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          api={editing}
          onClose={() => setEditing(null)}
          onSave={(key) => saveKey(editing.id, key)}
        />
      )}
    </AdminLayout>
  );
}

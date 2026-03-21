import AdminLayout from "@/components/admin/Layout";
import { Eye, RefreshCw, Shield, Key, Zap, Globe } from "lucide-react";

const apiKeys = [
  {
    id: 1,
    name: "DVLA Vehicle Enquiry API",
    key: "dvla_sk_••••••••••••••••••••••••3f8a",
    status: "Active",
    lastUsed: "2 mins ago",
    requests: "14,820",
    icon: Globe,
  },
  {
    id: 2,
    name: "Stripe Payment Gateway",
    key: "sk_live_••••••••••••••••••••••••9d2c",
    status: "Active",
    lastUsed: "15 mins ago",
    requests: "8,431",
    icon: Shield,
  },
  {
    id: 3,
    name: "SendGrid Email API",
    key: "SG.••••••••••••••••••••••••••••••••",
    status: "Active",
    lastUsed: "1 hr ago",
    requests: "2,104",
    icon: Zap,
  },
  {
    id: 4,
    name: "Google Maps Platform",
    key: "AIza••••••••••••••••••••••••••••••",
    status: "Inactive",
    lastUsed: "3 days ago",
    requests: "0",
    icon: Globe,
  },
];

export default function ApiSettingsPage() {
  return (
    <AdminLayout title="API Settings">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">API Settings</h2>
            <p className="text-gray-500 text-sm mt-1">
              Super Admin only — manage all API keys and integrations
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-400/10 px-3 py-1.5 rounded-full font-medium border border-red-400/20">
            <Shield className="w-3.5 h-3.5" />
            Restricted Access
          </div>
        </div>

        {/* Warning Banner */}
        <div className="bg-yellow-400/5 border border-yellow-400/20 rounded-2xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-400 text-sm font-medium">Security Notice</p>
            <p className="text-yellow-400/70 text-xs mt-1">
              API keys grant access to external services. Never share them publicly. Rotate keys immediately if compromised.
            </p>
          </div>
        </div>

        {/* API Key Cards */}
        <div className="space-y-3">
          {apiKeys.map((api) => {
            const Icon = api.icon;
            return (
              <div key={api.id} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5 hover:border-[#2a2a2a] transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-white font-medium text-sm">{api.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          api.status === "Active"
                            ? "text-emerald-400 bg-emerald-400/10"
                            : "text-gray-500 bg-gray-500/10"
                        }`}>
                          {api.status}
                        </span>
                      </div>

                      {/* Key Display */}
                      <div className="mt-2 flex items-center gap-2">
                        <code className="text-xs text-gray-400 bg-[#111] border border-[#1f1f1f] px-3 py-1.5 rounded-lg font-mono flex-1 min-w-0 truncate">
                          {api.key}
                        </code>
                        <button className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors flex-shrink-0">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-colors flex-shrink-0">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-xs text-gray-600">Last used: <span className="text-gray-400">{api.lastUsed}</span></span>
                        <span className="text-xs text-gray-600">Requests today: <span className="text-gray-400">{api.requests}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="text-xs text-gray-400 hover:text-white px-3 py-1.5 rounded-lg border border-[#1f1f1f] hover:border-[#333] transition-colors">
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add New Key */}
        <div className="bg-[#0a0a0a] border border-dashed border-[#2a2a2a] rounded-2xl p-5 flex items-center justify-center">
          <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm">
            <Key className="w-4 h-4" />
            Add New API Key
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}

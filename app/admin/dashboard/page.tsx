import AdminLayout from "@/components/admin/Layout";
import StatCard from "@/components/admin/StatCard";
import {
  Users,
  ShoppingCart,
  Car,
  DollarSign,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    title: "Total Users",
    value: "12,487",
    change: "+12.5%",
    changeType: "positive" as const,
    icon: Users,
    description: "vs last month",
  },
  {
    title: "Total Orders",
    value: "3,842",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: ShoppingCart,
    description: "vs last month",
  },
  {
    title: "Total Vehicles",
    value: "2,156",
    change: "+3.1%",
    changeType: "positive" as const,
    icon: Car,
    description: "vs last month",
  },
  {
    title: "Revenue",
    value: "£94,280",
    change: "+19.4%",
    changeType: "positive" as const,
    icon: DollarSign,
    description: "vs last month",
  },
];

const recentOrders = [
  { id: "#ORD-001", customer: "James Wilson", vehicle: "Tesla Model 3", status: "Completed", amount: "£240.00" },
  { id: "#ORD-002", customer: "Sarah Thompson", vehicle: "BMW 5 Series", status: "Processing", amount: "£180.00" },
  { id: "#ORD-003", customer: "Michael Chen", vehicle: "Toyota Camry", status: "Pending", amount: "£320.00" },
  { id: "#ORD-004", customer: "Emma Davies", vehicle: "Ford Focus", status: "Completed", amount: "£95.00" },
  { id: "#ORD-005", customer: "Robert Brown", vehicle: "VW Golf", status: "Cancelled", amount: "£160.00" },
];

const statusStyles: Record<string, string> = {
  Completed: "text-emerald-400 bg-emerald-400/10",
  Processing: "text-blue-400 bg-blue-400/10",
  Pending: "text-yellow-400 bg-yellow-400/10",
  Cancelled: "text-red-400 bg-red-400/10",
};

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Overview</h2>
          <p className="text-gray-500 text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Activity Overview */}
          <div className="lg:col-span-2 bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold">Activity Overview</h3>
                <p className="text-gray-500 text-xs mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                +24.5%
              </div>
            </div>

            {/* Fake Bar Chart */}
            <div className="flex items-end gap-2 h-32">
              {[65, 40, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-white/10 hover:bg-white/20 rounded-t-md transition-colors"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="text-xs text-gray-600 flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold">System Status</h3>
            <div className="space-y-3">
              {[
                { label: "API Health", status: "Operational", icon: Activity, color: "text-emerald-400" },
                { label: "Database", status: "Connected", icon: CheckCircle2, color: "text-emerald-400" },
                { label: "DVLA API", status: "Active", icon: CheckCircle2, color: "text-emerald-400" },
                { label: "Auth Service", status: "Warning", icon: AlertCircle, color: "text-yellow-400" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-gray-400 text-sm">{item.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-[#1f1f1f]">
            <div>
              <h3 className="text-white font-semibold">Recent Orders</h3>
              <p className="text-gray-500 text-xs mt-0.5">Latest 5 orders</p>
            </div>
            <button className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-[#1f1f1f]">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {["Order ID", "Customer", "Vehicle", "Status", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 text-sm text-gray-300 font-mono">{order.id}</td>
                    <td className="px-5 py-3.5 text-sm text-white">{order.customer}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">{order.vehicle}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-white font-medium">{order.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

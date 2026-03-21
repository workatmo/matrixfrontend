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
  Completed: "text-emerald-500 bg-emerald-500/10",
  Processing: "text-blue-500 bg-blue-500/10",
  Pending: "text-yellow-500 bg-yellow-500/10",
  Cancelled: "text-red-500 bg-red-500/10",
};

export default function DashboardPage() {
  return (
    <AdminLayout title="Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-bold text-foreground">Overview</h2>
          <p className="text-muted-foreground text-sm mt-1">
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
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-foreground font-semibold">Activity Overview</h3>
                <p className="text-muted-foreground text-xs mt-0.5">Last 7 days</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                +24.5%
              </div>
            </div>

            {/* Bar Chart */}
            <div className="flex items-end gap-2 h-32">
              {[65, 40, 80, 55, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-foreground/10 hover:bg-foreground/20 rounded-t-md transition-colors"
                    style={{ height: `${h}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <span key={d} className="text-xs text-muted-foreground/60 flex-1 text-center">{d}</span>
              ))}
            </div>
          </div>

          {/* System Status */}
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-foreground font-semibold">System Status</h3>
            <div className="space-y-3">
              {[
                { label: "API Health", status: "Operational", icon: Activity, color: "text-emerald-500" },
                { label: "Database", status: "Connected", icon: CheckCircle2, color: "text-emerald-500" },
                { label: "DVLA API", status: "Active", icon: CheckCircle2, color: "text-emerald-500" },
                { label: "Auth Service", status: "Warning", icon: AlertCircle, color: "text-yellow-500" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-muted-foreground text-sm">{item.label}</span>
                    </div>
                    <span className={`text-xs font-medium ${item.color}`}>{item.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div>
              <h3 className="text-foreground font-semibold">Recent Orders</h3>
              <p className="text-muted-foreground text-xs mt-0.5">Latest 5 orders</p>
            </div>
            <button className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent">
              View all →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Order ID", "Customer", "Vehicle", "Status", "Amount"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-3.5 text-sm text-muted-foreground font-mono">{order.id}</td>
                    <td className="px-5 py-3.5 text-sm text-foreground">{order.customer}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{order.vehicle}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-foreground font-medium">{order.amount}</td>
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

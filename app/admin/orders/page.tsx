import AdminLayout from "@/components/admin/Layout";
import { Search, Filter, MoreHorizontal, ShoppingCart, Clock, CheckCircle } from "lucide-react";

const orders = [
  { id: "#ORD-001", customer: "James Wilson", vehicle: "Tesla Model 3", service: "Full Set Tyres", date: "Mar 15, 2025", amount: "£240.00", status: "Completed" },
  { id: "#ORD-002", customer: "Sarah Thompson", vehicle: "BMW 5 Series", service: "Front Axle Tyres", date: "Mar 16, 2025", amount: "£180.00", status: "Processing" },
  { id: "#ORD-003", customer: "Michael Chen", vehicle: "Toyota Camry", service: "Full Set + Alignment", date: "Mar 17, 2025", amount: "£320.00", status: "Pending" },
  { id: "#ORD-004", customer: "Emma Davies", vehicle: "Ford Focus", service: "Single Tyre", date: "Mar 18, 2025", amount: "£95.00", status: "Completed" },
  { id: "#ORD-005", customer: "Robert Brown", vehicle: "VW Golf", service: "Rear Axle Tyres", date: "Mar 19, 2025", amount: "£160.00", status: "Cancelled" },
  { id: "#ORD-006", customer: "Olivia Smith", vehicle: "Audi A4", service: "Full Set Tyres", date: "Mar 20, 2025", amount: "£290.00", status: "Processing" },
];

const statusStyles: Record<string, string> = {
  Completed: "text-emerald-400 bg-emerald-400/10",
  Processing: "text-blue-400 bg-blue-400/10",
  Pending: "text-yellow-400 bg-yellow-400/10",
  Cancelled: "text-red-400 bg-red-400/10",
};

export default function OrdersPage() {
  return (
    <AdminLayout title="Orders">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Orders</h2>
            <p className="text-gray-500 text-sm mt-1">Track and manage all customer orders</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-full font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live updating
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#333] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-sm text-gray-400 hover:border-[#333] hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filter by status
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: "3,842", icon: ShoppingCart },
            { label: "Pending", value: "142", icon: Clock },
            { label: "Processing", value: "318", icon: Clock },
            { label: "Completed", value: "3,280", icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{s.value}</p>
                  <p className="text-gray-500 text-xs">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Orders Table */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {["Order ID", "Customer", "Vehicle", "Service", "Date", "Amount", "Status", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-white font-mono">{order.id}</td>
                    <td className="px-5 py-4 text-sm text-white">{order.customer}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{order.vehicle}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{order.service}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{order.date}</td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{order.amount}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-[#1f1f1f] transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
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

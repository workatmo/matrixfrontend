import AdminLayout from "@/components/admin/Layout";
import { Search, Filter, MoreHorizontal, UserCheck, UserX } from "lucide-react";

const users = [
  { id: 1, name: "James Wilson", email: "james@example.com", role: "Customer", status: "Active", joined: "Jan 12, 2025", orders: 8 },
  { id: 2, name: "Sarah Thompson", email: "sarah@example.com", role: "Customer", status: "Active", joined: "Feb 3, 2025", orders: 14 },
  { id: 3, name: "Michael Chen", email: "michael@example.com", role: "Admin", status: "Active", joined: "Mar 7, 2025", orders: 0 },
  { id: 4, name: "Emma Davies", email: "emma@example.com", role: "Customer", status: "Inactive", joined: "Apr 20, 2025", orders: 2 },
  { id: 5, name: "Robert Brown", email: "robert@example.com", role: "Customer", status: "Active", joined: "May 15, 2025", orders: 5 },
  { id: 6, name: "Olivia Smith", email: "olivia@example.com", role: "Customer", status: "Suspended", joined: "Jun 1, 2025", orders: 1 },
];

const statusStyles: Record<string, string> = {
  Active: "text-emerald-400 bg-emerald-400/10",
  Inactive: "text-gray-400 bg-gray-400/10",
  Suspended: "text-red-400 bg-red-400/10",
};

export default function UsersPage() {
  return (
    <AdminLayout title="Users">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Users</h2>
            <p className="text-gray-500 text-sm mt-1">Manage all registered users</p>
          </div>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            <UserCheck className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#333] transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl text-sm text-gray-400 hover:border-[#333] hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Users", value: "12,487", icon: UserCheck },
            { label: "Active", value: "11,203", icon: UserCheck },
            { label: "Suspended", value: "284", icon: UserX },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-300" />
                </div>
                <div>
                  <p className="text-white font-bold text-xl">{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {["User", "Role", "Status", "Joined", "Orders", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#1f1f1f] rounded-full flex items-center justify-center text-xs font-bold text-white">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{user.name}</p>
                          <p className="text-gray-500 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{user.joined}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{user.orders}</td>
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

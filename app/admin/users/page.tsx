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
  Active: "text-emerald-500 bg-emerald-500/10",
  Inactive: "text-muted-foreground bg-muted",
  Suspended: "text-red-500 bg-red-500/10",
};

export default function UsersPage() {
  return (
    <AdminLayout title="Users">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Users</h2>
            <p className="text-muted-foreground text-sm mt-1">Manage all registered users</p>
          </div>
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <UserCheck className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm text-muted-foreground hover:border-ring hover:text-foreground transition-colors">
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
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-foreground font-bold text-xl">{stat.value}</p>
                  <p className="text-muted-foreground text-xs">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Users Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["User", "Role", "Status", "Joined", "Orders", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-xs font-bold text-foreground">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-foreground text-sm font-medium">{user.name}</p>
                          <p className="text-muted-foreground text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{user.role}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[user.status]}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{user.joined}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{user.orders}</td>
                    <td className="px-5 py-4">
                      <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
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

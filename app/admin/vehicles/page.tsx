import AdminLayout from "@/components/admin/Layout";
import { Search, Plus, MoreHorizontal, Car } from "lucide-react";

const vehicles = [
  { id: 1, reg: "AB21 XYZ", make: "Tesla", model: "Model 3", year: 2021, owner: "James Wilson", status: "Active", tyres: 4 },
  { id: 2, reg: "CD22 PQR", make: "BMW", model: "5 Series", year: 2022, owner: "Sarah Thompson", status: "Active", tyres: 4 },
  { id: 3, reg: "EF19 MNO", make: "Toyota", model: "Camry", year: 2019, owner: "Michael Chen", status: "Inactive", tyres: 2 },
  { id: 4, reg: "GH23 ABC", make: "Ford", model: "Focus", year: 2023, owner: "Emma Davies", status: "Active", tyres: 4 },
  { id: 5, reg: "IJ20 DEF", make: "VW", model: "Golf", year: 2020, owner: "Robert Brown", status: "Pending", tyres: 1 },
];

const statusStyles: Record<string, string> = {
  Active: "text-emerald-500 bg-emerald-500/10",
  Inactive: "text-muted-foreground bg-muted",
  Pending: "text-yellow-500 bg-yellow-500/10",
};

export default function VehiclesPage() {
  return (
    <AdminLayout title="Vehicles">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Vehicles</h2>
            <p className="text-muted-foreground text-sm mt-1">All registered vehicles in the system</p>
          </div>
          <button className="flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by reg or make..."
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-ring transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Vehicles", value: "2,156" },
            { label: "Active", value: "1,982" },
            { label: "Pending Review", value: "174" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-foreground font-bold text-xl">{s.value}</p>
                <p className="text-muted-foreground text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicles Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Registration", "Make & Model", "Year", "Owner", "Status", "Tyres", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-accent/30 transition-colors">
                    <td className="px-5 py-4 text-sm text-foreground font-mono font-medium">{v.reg}</td>
                    <td className="px-5 py-4">
                      <p className="text-foreground text-sm font-medium">{v.make}</p>
                      <p className="text-muted-foreground text-xs">{v.model}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{v.year}</td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{v.owner}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[v.status]}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground">{v.tyres} fitted</td>
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

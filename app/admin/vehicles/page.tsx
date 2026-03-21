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
  Active: "text-emerald-400 bg-emerald-400/10",
  Inactive: "text-gray-400 bg-gray-400/10",
  Pending: "text-yellow-400 bg-yellow-400/10",
};

export default function VehiclesPage() {
  return (
    <AdminLayout title="Vehicles">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Vehicles</h2>
            <p className="text-gray-500 text-sm mt-1">All registered vehicles in the system</p>
          </div>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4" />
            Add Vehicle
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by reg or make..."
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#333] transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Vehicles", value: "2,156" },
            { label: "Active", value: "1,982" },
            { label: "Pending Review", value: "174" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                <Car className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Vehicles Table */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {["Registration", "Make & Model", "Year", "Owner", "Status", "Tyres", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 text-sm text-white font-mono font-medium">{v.reg}</td>
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{v.make}</p>
                      <p className="text-gray-500 text-xs">{v.model}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{v.year}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{v.owner}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[v.status]}`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400">{v.tyres} fitted</td>
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

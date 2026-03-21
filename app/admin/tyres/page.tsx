import AdminLayout from "@/components/admin/Layout";
import { Search, Plus, MoreHorizontal, CircleDot, Star } from "lucide-react";

const tyres = [
  { id: 1, brand: "Michelin", model: "Pilot Sport 4S", size: "225/45 R17", type: "Summer", stock: 24, price: "£145.00", rating: 4.8 },
  { id: 2, brand: "Bridgestone", model: "Potenza S007", size: "245/40 R18", type: "Summer", stock: 12, price: "£165.00", rating: 4.7 },
  { id: 3, brand: "Continental", model: "WinterContact TS 870", size: "205/55 R16", type: "Winter", stock: 8, price: "£120.00", rating: 4.6 },
  { id: 4, brand: "Pirelli", model: "P Zero", size: "255/35 R20", type: "Summer", stock: 6, price: "£195.00", rating: 4.9 },
  { id: 5, brand: "Dunlop", model: "Sport Maxx RT2", size: "235/45 R17", type: "Summer", stock: 18, price: "£135.00", rating: 4.5 },
  { id: 6, brand: "Goodyear", model: "UltraGrip Arctic 2", size: "215/60 R16", type: "Winter", stock: 0, price: "£110.00", rating: 4.4 },
];

const typeStyles: Record<string, string> = {
  Summer: "text-orange-400 bg-orange-400/10",
  Winter: "text-blue-400 bg-blue-400/10",
  "All-Season": "text-green-400 bg-green-400/10",
};

export default function TyresPage() {
  return (
    <AdminLayout title="Tyres">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white">Tyres</h2>
            <p className="text-gray-500 text-sm mt-1">Manage tyre catalogue and inventory</p>
          </div>
          <button className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-colors">
            <Plus className="w-4 h-4" />
            Add Tyre
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search tyres..."
            className="w-full bg-[#0a0a0a] border border-[#1f1f1f] rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#333] transition-colors"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total SKUs", value: "487" },
            { label: "In Stock", value: "6,420" },
            { label: "Out of Stock", value: "23" },
          ].map((s) => (
            <div key={s.label} className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-[#1a1a1a] rounded-xl flex items-center justify-center">
                <CircleDot className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-white font-bold text-xl">{s.value}</p>
                <p className="text-gray-500 text-xs">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tyres Table */}
        <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1f1f1f]">
                  {["Brand & Model", "Size", "Type", "Stock", "Price", "Rating", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#111]">
                {tyres.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{t.brand}</p>
                      <p className="text-gray-500 text-xs">{t.model}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 font-mono">{t.size}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeStyles[t.type]}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-sm font-medium ${t.stock === 0 ? "text-red-400" : "text-white"}`}>
                        {t.stock === 0 ? "Out of Stock" : t.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-white font-medium">{t.price}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm text-gray-300">{t.rating}</span>
                      </div>
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

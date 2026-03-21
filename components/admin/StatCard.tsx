import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  description?: string;
}

export default function StatCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1f1f1f] rounded-2xl p-5 hover:border-[#333] transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium">{title}</p>
        </div>
        <div className="w-10 h-10 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl flex items-center justify-center group-hover:border-[#333] transition-colors">
          <Icon className="w-5 h-5 text-gray-300" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2">
        {change && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              changeType === "positive" && "text-emerald-400 bg-emerald-400/10",
              changeType === "negative" && "text-red-400 bg-red-400/10",
              changeType === "neutral" && "text-gray-400 bg-white/5"
            )}
          >
            {change}
          </span>
        )}
        {description && (
          <p className="text-gray-600 text-xs">{description}</p>
        )}
      </div>
    </div>
  );
}

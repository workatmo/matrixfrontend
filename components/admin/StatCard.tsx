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
    <div className="bg-card border border-border rounded-2xl p-5 hover:border-border/80 transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-muted-foreground text-sm font-medium">{title}</p>
        </div>
        <div className="w-10 h-10 bg-muted border border-border rounded-xl flex items-center justify-center group-hover:border-border/80 transition-colors">
          <Icon className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Value */}
      <div className="mb-2">
        <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2">
        {change && (
          <span
            className={cn(
              "text-xs font-medium px-2 py-0.5 rounded-full",
              changeType === "positive" && "text-emerald-500 bg-emerald-500/10",
              changeType === "negative" && "text-red-500 bg-red-500/10",
              changeType === "neutral" && "text-muted-foreground bg-muted"
            )}
          >
            {change}
          </span>
        )}
        {description && (
          <p className="text-muted-foreground/60 text-xs">{description}</p>
        )}
      </div>
    </div>
  );
}

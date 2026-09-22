import { TIER_COLORS } from "@/lib/constants";
import type { Tier } from "@/lib/types";

export function TierBadge({ tier, label, className = "" }: { tier: Tier; label: string; className?: string }) {
  const color = TIER_COLORS[tier];
  return (
    <span
      className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-bold ${className}`}
      style={{ backgroundColor: `${color}26`, color }}
    >
      {label}
    </span>
  );
}

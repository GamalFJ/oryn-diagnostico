import { CheckCircle2, XCircle, AlertTriangle, Loader2, type LucideIcon } from "lucide-react";
import type { SignalStatus } from "@/lib/types";

export type DisplayStatus = SignalStatus | "pending";

const ICONS: Record<DisplayStatus, LucideIcon> = {
  pass: CheckCircle2,
  warn: AlertTriangle,
  fail: XCircle,
  pending: Loader2,
};

const COLORS: Record<DisplayStatus, string> = {
  pass: "var(--color-pass)",
  warn: "var(--color-warn)",
  fail: "var(--color-fail)",
  pending: "var(--color-text-muted)",
};

export function StatusIcon({ status, className = "h-5 w-5" }: { status: DisplayStatus; className?: string }) {
  const Icon = ICONS[status];
  return (
    <Icon
      className={`${className} ${status === "pending" ? "animate-spin" : ""}`}
      style={{ color: COLORS[status] }}
      strokeWidth={2}
      aria-hidden
    />
  );
}

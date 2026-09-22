import { motion } from "framer-motion";
import { StatusIcon, type DisplayStatus } from "./StatusIcon";

export interface SignalRowData {
  id: string;
  label: string;
  status: DisplayStatus;
  value?: string;
  detail?: string;
  source: string;
}

export function SignalRow({ signal }: { signal: SignalRowData }) {
  const isPending = signal.status === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex items-start justify-between gap-4 py-4"
    >
      <div className="flex items-start gap-3">
        <StatusIcon status={signal.status} className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[15px] font-medium text-[var(--color-text)]">{signal.label}</span>
          {(signal.detail || signal.source) && !isPending && (
            <span className="text-[11px] text-[var(--color-text-muted)]">
              {signal.detail ? `${signal.detail} · ` : ""}Fuente: {signal.source}
            </span>
          )}
        </div>
      </div>
      <span className="shrink-0 pt-0.5 text-right font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-muted)] tabular-nums">
        {isPending ? "···" : signal.value}
      </span>
    </motion.div>
  );
}

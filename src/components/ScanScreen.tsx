"use client";

import { motion } from "framer-motion";
import { OrynHeader } from "./OrynHeader";
import { CountUpNumber } from "./CountUpNumber";
import { SignalRow, type SignalRowData } from "./SignalRow";

export function ScanScreen({
  url,
  signals,
  runningScore,
}: {
  url: string;
  signals: SignalRowData[];
  runningScore: number;
}) {
  return (
    <div className="flex flex-col gap-8">
      <OrynHeader />

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-[32ch] truncate font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-muted)]">
          {url}
        </p>
        <div className="font-[family-name:var(--font-display)] text-6xl font-extrabold text-[var(--color-text)] sm:text-7xl">
          <CountUpNumber value={runningScore} />
        </div>
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-medium text-[var(--color-accent)]"
        >
          Analizando tu sitio...
        </motion.p>
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 divide-y divide-[var(--color-border)]">
        {signals.map((signal) => (
          <SignalRow key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

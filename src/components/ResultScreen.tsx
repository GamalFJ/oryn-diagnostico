"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileDown, CalendarCheck, RotateCcw, Loader2 } from "lucide-react";
import { OrynHeader } from "./OrynHeader";
import { CountUpNumber } from "./CountUpNumber";
import { TierBadge } from "./TierBadge";
import { SignalRow } from "./SignalRow";
import { getFixCopy } from "@/lib/fixCopy";
import type { ScanSummary, SignalResult } from "@/lib/types";

export function ResultScreen({
  summary,
  signals,
  onReset,
  onExportImage,
  onExportPdf,
}: {
  summary: ScanSummary;
  signals: SignalResult[];
  onReset: () => void;
  onExportImage: () => Promise<void>;
  onExportPdf: () => Promise<void>;
}) {
  const [exportingImage, setExportingImage] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);

  const topFixSignals = summary.topFixes
    .map((id) => signals.find((s) => s.id === id))
    .filter((s): s is SignalResult => Boolean(s));

  async function handleExportImage() {
    setExportingImage(true);
    try {
      await onExportImage();
    } finally {
      setExportingImage(false);
    }
  }

  async function handleExportPdf() {
    setExportingPdf(true);
    try {
      await onExportPdf();
    } finally {
      setExportingPdf(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-8"
    >
      <OrynHeader />

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="max-w-[32ch] truncate font-[family-name:var(--font-mono)] text-sm text-[var(--color-text-muted)]">
          {summary.url}
        </p>
        <div className="font-[family-name:var(--font-display)] text-7xl font-extrabold text-[var(--color-text)] sm:text-8xl">
          <CountUpNumber value={summary.overallScore} />
        </div>
        <TierBadge tier={summary.tier} label={summary.tierLabel} />
      </div>

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 divide-y divide-[var(--color-border)]">
        {signals.map((signal) => (
          <SignalRow key={signal.id} signal={signal} />
        ))}
      </div>

      {topFixSignals.length > 0 && (
        <div className="rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent-soft)] p-6">
          <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]">
            Arreglos prioritarios
          </h2>
          <ol className="flex flex-col gap-4">
            {topFixSignals.map((signal, index) => {
              const copy = getFixCopy(signal);
              return (
                <li key={signal.id} className="flex gap-3">
                  <span className="font-[family-name:var(--font-mono)] text-sm font-bold text-[var(--color-accent)]">
                    {index + 1}
                  </span>
                  <p className="text-[15px] leading-relaxed text-[var(--color-text-muted)]">
                    <span className="font-bold text-[var(--color-text)]">{copy.title}</span> {copy.body}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleExportImage}
            disabled={exportingImage}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-text)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Imagen
          </button>
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={exportingPdf}
            className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 text-sm font-bold text-[var(--color-text)] transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exportingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            PDF
          </button>
        </div>

        <button
          type="button"
          className="flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-6 text-base font-bold text-[#14101f] transition-transform active:scale-[0.98]"
        >
          <CalendarCheck className="h-5 w-5" strokeWidth={2.5} />
          Agendar diagnóstico completo
        </button>

        <button
          type="button"
          onClick={onReset}
          className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl text-sm font-medium text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
        >
          <RotateCcw className="h-4 w-4" />
          Probar otro sitio
        </button>
      </div>
    </motion.div>
  );
}

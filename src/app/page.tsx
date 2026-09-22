"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AmbientBackground } from "@/components/AmbientBackground";
import { ScreenShell } from "@/components/ScreenShell";
import { InputScreen } from "@/components/InputScreen";
import { ScanScreen } from "@/components/ScanScreen";
import { ResultScreen } from "@/components/ResultScreen";
import { ExportCard } from "@/components/ExportCard";
import { scanUrl } from "@/lib/scanClient";
import { useRevealQueue } from "@/lib/useRevealQueue";
import { SIGNAL_CONFIG, STATUS_MULTIPLIER, TOTAL_WEIGHT } from "@/lib/constants";
import { exportCardAsImage, exportCardAsPdf } from "@/lib/export";
import type { SignalRowData } from "@/components/SignalRow";
import type { ScanSummary } from "@/lib/types";

type Phase = "input" | "scanning" | "result";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("input");
  const [targetUrl, setTargetUrl] = useState("");
  const [summary, setSummary] = useState<ScanSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { revealed, push, reset } = useRevealQueue();
  const abortRef = useRef<AbortController | null>(null);
  const exportCardRef = useRef<HTMLDivElement>(null);

  const startScan = useCallback((url: string, businessName?: string) => {
    setError(null);
    setSummary(null);
    reset();
    setTargetUrl(url);
    setPhase("scanning");

    const controller = new AbortController();
    abortRef.current = controller;

    scanUrl(
      url,
      businessName,
      {
        onSignal: (event) => push(event.signal),
        onDone: (event) => {
          const { url, scannedAt, overallScore, tier, tierLabel, topFixes } = event;
          setSummary({ url, scannedAt, overallScore, tier, tierLabel, topFixes });
        },
        onError: (message) => {
          setError(message);
          setPhase("input");
        },
      },
      controller.signal
    ).catch(() => {
      // aborted or network failure already surfaced via onError
    });
  }, [push, reset]);

  useEffect(() => {
    if (phase !== "scanning" || !summary) return;
    if (revealed.length < SIGNAL_CONFIG.length) return;

    const timer = setTimeout(() => setPhase("result"), 500);
    return () => clearTimeout(timer);
  }, [phase, summary, revealed.length]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  function handleReset() {
    setPhase("input");
    setSummary(null);
    setError(null);
    reset();
  }

  async function handleExportImage() {
    if (!exportCardRef.current || !summary) return;
    const filename = `diagnostico-${summary.url.replace(/[^a-z0-9]+/gi, "-")}.png`;
    await exportCardAsImage(exportCardRef.current, filename);
  }

  async function handleExportPdf() {
    if (!exportCardRef.current || !summary) return;
    const filename = `diagnostico-${summary.url.replace(/[^a-z0-9]+/gi, "-")}.pdf`;
    await exportCardAsPdf(exportCardRef.current, filename);
  }

  const displaySignals: SignalRowData[] = SIGNAL_CONFIG.map((cfg) => {
    const resolved = revealed.find((s) => s.id === cfg.id);
    if (resolved) return resolved;
    return { id: cfg.id, label: cfg.label, status: "pending", source: cfg.source };
  });

  const earnedPoints = revealed.reduce((sum, s) => sum + s.weight * STATUS_MULTIPLIER[s.status], 0);
  const runningScore = Math.round((earnedPoints / TOTAL_WEIGHT) * 100);

  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-bg)]">
      <AmbientBackground />
      <ScreenShell>
        {error && phase === "input" && (
          <p role="alert" className="rounded-xl border border-[var(--color-fail)]/30 bg-[var(--color-fail)]/10 px-4 py-3 text-sm text-[var(--color-fail)]">
            {error}
          </p>
        )}

        <AnimatePresence mode="wait">
          {phase === "input" && (
            <motion.div key="input" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <InputScreen onSubmit={startScan} />
            </motion.div>
          )}

          {phase === "scanning" && (
            <motion.div key="scanning" exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.3 }}>
              <ScanScreen url={targetUrl} signals={displaySignals} runningScore={runningScore} />
            </motion.div>
          )}

          {phase === "result" && summary && (
            <motion.div key="result" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <ResultScreen
                summary={summary}
                signals={revealed}
                onReset={handleReset}
                onExportImage={handleExportImage}
                onExportPdf={handleExportPdf}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </ScreenShell>

      <div style={{ position: "fixed", top: -10000, left: -10000, pointerEvents: "none" }} aria-hidden>
        {summary && <ExportCard ref={exportCardRef} summary={summary} signals={revealed} />}
      </div>
    </div>
  );
}

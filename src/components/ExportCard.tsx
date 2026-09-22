"use client";

import { forwardRef, useState } from "react";
import { TIER_COLORS } from "@/lib/constants";
import { getFixCopy } from "@/lib/fixCopy";
import type { ScanSummary, SignalResult } from "@/lib/types";
import { CARD_WIDTH, CARD_HEIGHT } from "@/lib/export";

function Logo({
  src,
  fallback,
  size,
  fallbackStyle,
}: {
  src: string;
  fallback: string;
  size: number;
  fallbackStyle?: React.CSSProperties;
}) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, color: "#f5f4f8", ...fallbackStyle }}>
        {fallback}
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={fallback}
      style={{ height: size, width: size, objectFit: "contain", borderRadius: 8 }}
      onError={() => setBroken(true)}
    />
  );
}

export const ExportCard = forwardRef<HTMLDivElement, { summary: ScanSummary; signals: SignalResult[] }>(
  function ExportCard({ summary, signals }, ref) {
    const tierColor = TIER_COLORS[summary.tier];
    const topFixSignals = summary.topFixes
      .map((id) => signals.find((s) => s.id === id))
      .filter((s): s is SignalResult => Boolean(s));

    return (
      <div
        ref={ref}
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          background: "#0f0f13",
          fontFamily: "var(--font-dm-sans), sans-serif",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: "72px 76px",
          color: "#f5f4f8",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "-14%",
            right: "-16%",
            width: "60%",
            height: "40%",
            borderRadius: "9999px",
            background: "radial-gradient(circle, #8368ff 0%, transparent 70%)",
            opacity: 0.18,
            filter: "blur(120px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
          <Logo src="/logo-oryn-presence.png" fallback="O" size={56} fallbackStyle={{ fontSize: 30 }} />
          <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 30 }}>
            Oryn Presence
          </span>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, position: "relative" }}>
          <p style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 26, color: "#97949f" }}>
            {summary.url}
          </p>
          <div style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 800, fontSize: 230, lineHeight: 1 }}>
            {summary.overallScore}
          </div>
          <span
            style={{
              display: "inline-flex",
              borderRadius: 9999,
              padding: "12px 28px",
              fontSize: 26,
              fontWeight: 700,
              backgroundColor: `${tierColor}26`,
              color: tierColor,
            }}
          >
            {summary.tierLabel}
          </span>
        </div>

        {topFixSignals.length > 0 && (
          <div
            style={{
              position: "relative",
              borderRadius: 24,
              background: "rgba(131, 104, 255, 0.1)",
              border: "1px solid rgba(131, 104, 255, 0.2)",
              padding: "36px 40px",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <span style={{ fontFamily: "var(--font-syne), sans-serif", fontWeight: 700, fontSize: 28 }}>
              Arreglos prioritarios
            </span>
            {topFixSignals.map((signal, index) => {
              const copy = getFixCopy(signal);
              return (
                <div key={signal.id} style={{ display: "flex", gap: 16 }}>
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontWeight: 700, fontSize: 24, color: "#8368ff" }}>
                    {index + 1}
                  </span>
                  <p style={{ fontSize: 24, lineHeight: 1.45, color: "#c7c5cf", margin: 0 }}>
                    <span style={{ fontWeight: 700, color: "#f5f4f8" }}>{copy.title}</span>
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
          <Logo src="/logo-pcl.png" fallback="Purple Cove Labs" size={64} fallbackStyle={{ fontSize: 22 }} />
          <span style={{ fontSize: 18, color: "#65626d", fontFamily: "var(--font-jetbrains-mono), monospace" }}>
            {new Date(summary.scannedAt).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    );
  }
);

"use client";

import { useState } from "react";

function OrynMark() {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[var(--color-accent)]" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-oryn-presence.png"
      alt=""
      className="h-6 w-6 shrink-0 rounded-md"
      onError={() => setBroken(true)}
    />
  );
}

function PclMark() {
  const [broken, setBroken] = useState(false);

  if (broken) {
    return <span className="text-xs font-bold text-[var(--color-text-muted)]">PCL</span>;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo-pcl.png"
      alt="Purple Cove Labs"
      className="h-7 w-7 shrink-0 rounded-full opacity-80"
      onError={() => setBroken(true)}
    />
  );
}

export function OrynHeader() {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <OrynMark />
        <span className="font-[family-name:var(--font-display)] text-lg font-bold text-[var(--color-text)]">
          Oryn Presence
        </span>
        <span className="hidden text-sm text-[var(--color-text-muted)] sm:inline">
          · diagnóstico instantáneo
        </span>
      </div>
      <PclMark />
    </div>
  );
}

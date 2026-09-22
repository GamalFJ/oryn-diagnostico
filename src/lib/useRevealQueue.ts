"use client";

import { useCallback, useRef, useState } from "react";
import type { SignalResult } from "./types";

const MIN_INTERVAL_MS = 400;

export function useRevealQueue() {
  const [revealed, setRevealed] = useState<SignalResult[]>([]);
  const queueRef = useRef<SignalResult[]>([]);
  const lastRevealRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) return;
    if (queueRef.current.length === 0) return;

    const elapsed = Date.now() - lastRevealRef.current;
    const wait = Math.max(0, MIN_INTERVAL_MS - elapsed);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const next = queueRef.current.shift();
      if (next) {
        lastRevealRef.current = Date.now();
        setRevealed((prev) => [...prev, next]);
      }
      scheduleNext();
    }, wait);
  }, []);

  const push = useCallback(
    (signal: SignalResult) => {
      queueRef.current.push(signal);
      scheduleNext();
    },
    [scheduleNext]
  );

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    queueRef.current = [];
    lastRevealRef.current = 0;
    setRevealed([]);
  }, []);

  const isDraining = queueRef.current.length > 0 || timerRef.current !== null;

  return { revealed, push, reset, isDraining };
}

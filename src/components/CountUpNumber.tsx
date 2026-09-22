"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue } from "framer-motion";

export function CountUpNumber({ value, className }: { value: number; className?: string }) {
  const motionValue = useMotionValue(0);
  const spanRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1],
    });
    return controls.stop;
  }, [value, motionValue]);

  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      if (spanRef.current) spanRef.current.textContent = String(Math.round(latest));
    });
    return unsubscribe;
  }, [motionValue]);

  return (
    <span ref={spanRef} className={className}>
      0
    </span>
  );
}

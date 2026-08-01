"use client";

import { useEffect } from "react";

export function AutoPrint({ delayMs = 400 }: { delayMs?: number }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.print();
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  return null;
}

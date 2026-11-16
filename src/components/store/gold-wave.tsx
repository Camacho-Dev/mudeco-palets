"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Cinta dorada ondulada del encabezado de "Mi cuenta".
 *
 * Mantiene la forma original (fase 0) y la hace ondular: cada punto de
 * control de la curva sube y baja con un desfase, así la cresta "viaja"
 * de lado a lado como una ola. Solo cambia el atributo `d` del SVG.
 * Con "reducir movimiento" queda quieta en su forma original.
 */

type Pt = [number, number];

// Puntos de la forma original: M p0 C p1, p2, p3 C p4, p5, p6
const RIBBON: Pt[] = [[0, 95], [320, 125], [480, 35], [860, 65], [1120, 85], [1320, 20], [1440, 35]];
const THIN: Pt[] = [[0, 102], [340, 130], [520, 45], [900, 75], [1160, 95], [1340, 30], [1440, 45]];
const FILL: Pt[] = [[0, 100], [380, 135], [720, 55], [1080, 80], [1260, 92], [1380, 50], [1440, 60]];

// Amplitud vertical por punto (los extremos se mueven menos para no "despegarse")
const AMP = [5, 11, 12, 9, 10, 12, 6];
const STEPS = 12; // fotogramas clave por ciclo (más = más suave)
const DURATION = 9; // segundos por ciclo completo

function shape(points: Pt[], phase: number, closeBottom = false) {
  const p = points.map(([x, y], i) => {
    const dy = AMP[i] * (Math.sin(phase + i * 0.95) - Math.sin(i * 0.95));
    return [x, Math.round((y + dy) * 10) / 10] as Pt;
  });
  const f = (q: Pt) => `${q[0]} ${q[1]}`;
  const d = `M ${f(p[0])} C ${f(p[1])}, ${f(p[2])}, ${f(p[3])} C ${f(p[4])}, ${f(p[5])}, ${f(p[6])}`;
  return closeBottom ? `${d} L 1440 120 L 0 120 Z` : d;
}

function frames(points: Pt[], closeBottom = false) {
  return Array.from({ length: STEPS + 1 }, (_, i) =>
    shape(points, (i / STEPS) * Math.PI * 2, closeBottom),
  );
}

const RIBBON_FRAMES = frames(RIBBON);
const THIN_FRAMES = frames(THIN);
const FILL_FRAMES = frames(FILL, true);

export function GoldWave({ fill = "#f7f4ef" }: { fill?: string }) {
  const reduce = useReducedMotion();
  const loop = reduce
    ? { duration: 0 }
    : { duration: DURATION, ease: "linear" as const, repeat: Infinity };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden leading-none"
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="block h-16 w-full sm:h-24 lg:h-28"
      >
        <defs>
          <linearGradient id="goldWaveRibbon" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#fbe3a8" />
            <stop offset="35%" stopColor="#d4af37" />
            <stop offset="70%" stopColor="#caa466" />
            <stop offset="100%" stopColor="#8c6b24" />
          </linearGradient>
          <filter id="goldWaveGlow" x="-10%" y="-20%" width="120%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#d4af37" floodOpacity="0.4" />
          </filter>
        </defs>

        <motion.path
          initial={false}
          animate={{ d: reduce ? RIBBON_FRAMES[0] : RIBBON_FRAMES }}
          transition={loop}
          stroke="url(#goldWaveRibbon)"
          strokeWidth="4"
          fill="none"
          filter="url(#goldWaveGlow)"
        />
        <motion.path
          initial={false}
          animate={{ d: reduce ? THIN_FRAMES[0] : THIN_FRAMES }}
          transition={loop}
          stroke="rgba(245, 223, 168, 0.45)"
          strokeWidth="1.5"
          fill="none"
        />
        <motion.path
          initial={false}
          animate={{ d: reduce ? FILL_FRAMES[0] : FILL_FRAMES }}
          transition={loop}
          fill={fill}
        />
      </svg>
    </div>
  );
}

"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { useRef } from "react";

/** Curva de aceleración natural de alta gama (Silk Smooth) */
export const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export function Reveal({
  children,
  className = "",
  delay = 0,
  y = 8,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={{ duration: 0.55, delay, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({
  children,
  className = "",
  delay = 0,
  y = 8,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function ScaleIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}

export function HeroParallax({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [0, 100]);
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.75],
    reduce ? [1, 1] : [1, 0.4],
  );

  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y, opacity }} className="will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Contenedor Stagger para listas, cuadrículas y colecciones */
const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: (staggerVal: number = 0.04) => ({
    opacity: 1,
    transition: {
      staggerChildren: staggerVal,
      delayChildren: 0.02,
    },
  }),
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: LUXURY_EASE,
    },
  },
};

export function StaggerContainer({
  children,
  className = "",
  stagger = 0.04,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      variants={staggerContainerVariants}
      custom={stagger}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: "some" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/** Tarjeta interactiva con microinteracción al tacto y hover */
export function InteractiveCard({
  children,
  className = "",
  hoverLift = -4,
}: {
  children: React.ReactNode;
  className?: string;
  hoverLift?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      whileHover={{ y: hoverLift, transition: { duration: 0.25, ease: LUXURY_EASE } }}
      whileTap={{ scale: 0.985, transition: { duration: 0.1 } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Transición de página sutil y conectada */
export function PageTransition({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.32, ease: LUXURY_EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Zoom sutil y pausado en fotografía de portada */
export function HeroZoom({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { scale: 1.05 }}
      animate={{ scale: 1 }}
      transition={{ duration: 6, ease: LUXURY_EASE }}
    >
      {children}
    </motion.div>
  );
}

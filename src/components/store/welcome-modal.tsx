"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/logo";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  X,
  Hammer,
  Leaf,
  Ruler,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

// Partículas doradas ambientales flotantes
const FLOATING_PARTICLES = [
  { id: 1, top: "12%", left: "14%", size: 6, delay: 0.2, duration: 4.5 },
  { id: 2, top: "24%", right: "12%", size: 5, delay: 0.5, duration: 5.2 },
  { id: 3, bottom: "18%", left: "18%", size: 7, delay: 0.8, duration: 4.8 },
  { id: 4, bottom: "28%", right: "16%", size: 4, delay: 0.1, duration: 6.0 },
  { id: 5, top: "45%", left: "8%", size: 5, delay: 1.1, duration: 5.5 },
  { id: 6, top: "60%", right: "8%", size: 6, delay: 0.7, duration: 4.9 },
];

export function WelcomeModal({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  const handleDismiss = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    // Si la URL pide explícitamente ocultar con ?welcome=0
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.get("welcome") === "0") return;

        // Limpiar cualquier residuo de sessionStorage de pruebas anteriores
        sessionStorage.removeItem("mudeco_welcome_seen");
      }
    } catch {}

    // En entorno de desarrollo o cuando no esté autenticado, abrir automáticamente
    const isDev = process.env.NODE_ENV !== "production";
    if (isAuthenticated && !isDev) {
      return;
    }

    // Micro-retraso para que el montaje de React active la animación de Framer Motion
    const timer = setTimeout(() => {
      setOpen(true);
    }, 120);

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  // Permitir reabrir con evento global si se requiere
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("mudeco:welcome", onOpen);
    return () => window.removeEventListener("mudeco:welcome", onOpen);
  }, []);

  // Soporte para cerrar con la tecla Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleDismiss();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleDismiss]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="welcome-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => {
            // Cerrar si se hace clic fuera de la tarjeta
            if (e.target === e.currentTarget) handleDismiss();
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-title"
          style={{ perspective: 1200 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-2xl p-4 sm:p-6 overflow-y-auto"
        >
          {/* Partículas doradas sutiles que flotan en el fondo borroso */}
          {FLOATING_PARTICLES.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0.2, 0.75, 0.2],
                scale: [0.8, 1.25, 0.8],
                y: [-12, 12, -12],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{
                position: "absolute",
                top: p.top,
                bottom: p.bottom,
                left: p.left,
                right: p.right,
                width: p.size,
                height: p.size,
              }}
              className="pointer-events-none rounded-full bg-[#c9a15a] shadow-[0_0_12px_#c9a15a]"
            />
          ))}

          {/* Tarjeta Modal animada con física elástica de alta gama y borde dorado */}
          <motion.div
            key="welcome-card"
            initial={{
              opacity: 0,
              scale: 0.76,
              y: 75,
              rotateX: 14,
              filter: "blur(10px)",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              rotateX: 0,
              filter: "blur(0px)",
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 35,
              filter: "blur(6px)",
              transition: { duration: 0.26, ease: "easeIn" },
            }}
            transition={{
              type: "spring",
              damping: 20,
              stiffness: 220,
              mass: 0.85,
            }}
            className="group/card relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-[#c9a15a]/45 bg-[#110f0c]/95 p-6 sm:p-10 shadow-[0_40px_120px_rgba(0,0,0,0.98),0_0_60px_rgba(201,161,90,0.18)] text-white text-center backdrop-blur-3xl"
          >
            {/* Haz de luz perimetral dorado animado que recorre el borde */}
            <div className="pointer-events-none absolute -inset-[1px] rounded-[28px] overflow-hidden opacity-40">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-[150%] bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(201,161,90,0.9)_360deg)]"
              />
            </div>

            {/* Haz de luz dorada radial en el fondo interior */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.35, 0.55, 0.35],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="pointer-events-none absolute -top-28 left-1/2 -translate-x-1/2 h-72 w-96 rounded-full bg-gradient-to-b from-[#c9a15a]/30 to-transparent blur-3xl"
            />
            <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-[#c9a15a]/15 blur-3xl" />

            {/* Borde sutil interior decorativo */}
            <div className="pointer-events-none absolute inset-2 rounded-[22px] border border-[#c9a15a]/12" />

            {/* Botón de cierre en esquina superior con animación hover */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.15, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleDismiss}
              className="absolute top-5 right-5 z-20 rounded-full border border-white/10 bg-white/[0.04] p-2.5 text-white/60 hover:border-[#c9a15a]/50 hover:bg-[#c9a15a]/15 hover:text-white transition cursor-pointer shadow-sm"
              title="Cerrar y ver la tienda (Esc)"
              aria-label="Cerrar modal"
            >
              <X className="h-4 w-4" />
            </motion.button>

            {/* Contenido con revelación escalonada (Stagger) */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.09,
                    delayChildren: 0.12,
                  },
                },
              }}
              className="relative z-10"
            >
              {/* Logo con halo sutil pulsante */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: -25, scale: 0.75 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    transition: { type: "spring", damping: 16, stiffness: 280 },
                  },
                }}
                className="flex justify-center mb-4"
              >
                <div className="relative inline-flex items-center justify-center p-2.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.01] border border-[#c9a15a]/35 shadow-[0_0_35px_rgba(201,161,90,0.22)]">
                  {/* Anillo de pulso exterior */}
                  <motion.div
                    animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="pointer-events-none absolute inset-0 rounded-2xl border border-[#c9a15a]/50"
                  />
                  <BrandLogo width={140} height={110} className="h-14 w-auto sm:h-16" priority />
                </div>
              </motion.div>

              {/* Badge artesanal brillante */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, scale: 0.7, y: 10 },
                  show: {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: { type: "spring", stiffness: 320, damping: 20 },
                  },
                }}
                className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/50 bg-gradient-to-r from-[#c9a15a]/20 via-[#c9a15a]/10 to-[#c9a15a]/20 px-4 py-1.5 text-[0.66rem] font-bold tracking-[0.22em] text-[#d4b06e] uppercase backdrop-blur-md mb-3.5 shadow-[0_0_20px_rgba(201,161,90,0.15)]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#c9a15a] animate-spin-slow" />
                <span>Taller Artesanal · República Dominicana</span>
              </motion.div>

              {/* Título principal con tipografía display y gradiente dorado sutil */}
              <motion.h2
                id="welcome-title"
                variants={{
                  hidden: { opacity: 0, y: 18, filter: "blur(4px)" },
                  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: "easeOut" } },
                }}
                className="font-display text-2xl sm:text-4xl text-white font-medium leading-tight tracking-tight"
              >
                ¡Te damos la bienvenida a{" "}
                <span className="bg-gradient-to-r from-white via-[#f5e1b8] to-[#c9a15a] bg-clip-text text-transparent">
                  Mudeco Palets
                </span>!
              </motion.h2>

              {/* Subtítulo editorial */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                }}
                className="mt-3 text-xs sm:text-sm text-white/75 max-w-lg mx-auto leading-relaxed"
              >
                Muebles con alma de taller hechos con madera recuperada 100% ecológica y curada contra plagas. Diseños únicos listos para entrega o proyectos a tu medida.
              </motion.p>

              {/* 3 Pilares destacados con tarjetas interactivas */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 22 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left"
              >
                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.025,
                    borderColor: "rgba(201,161,90,0.65)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.6), 0 0 20px rgba(201,161,90,0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 transition-colors"
                >
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a15a]/40 to-transparent" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a15a]/15 text-[#c9a15a] mb-2.5 shadow-inner">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ecológico</h3>
                  <p className="text-[0.72rem] text-white/60 mt-1 leading-snug">
                    Pino noble seleccionado con tratamiento antiparasitario.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.025,
                    borderColor: "rgba(201,161,90,0.65)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.6), 0 0 20px rgba(201,161,90,0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 transition-colors"
                >
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a15a]/40 to-transparent" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a15a]/15 text-[#c9a15a] mb-2.5 shadow-inner">
                    <Hammer className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hecho a mano</h3>
                  <p className="text-[0.72rem] text-white/60 mt-1 leading-snug">
                    Ebanistería fina sin moldes industriales masivos.
                  </p>
                </motion.div>

                <motion.div
                  whileHover={{
                    y: -5,
                    scale: 1.025,
                    borderColor: "rgba(201,161,90,0.65)",
                    backgroundColor: "rgba(255,255,255,0.06)",
                    boxShadow: "0 12px 28px rgba(0,0,0,0.6), 0 0 20px rgba(201,161,90,0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-4 transition-colors"
                >
                  <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c9a15a]/40 to-transparent" />
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c9a15a]/15 text-[#c9a15a] mb-2.5 shadow-inner">
                    <Ruler className="h-4 w-4" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">A tu medida</h3>
                  <p className="text-[0.72rem] text-white/60 mt-1 leading-snug">
                    Adaptamos cada centímetro para que calce en tu espacio.
                  </p>
                </motion.div>
              </motion.div>

              {/* Botones de acción principales */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                }}
                className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3.5"
              >
                <motion.button
                  type="button"
                  whileHover={{
                    scale: 1.04,
                    boxShadow: "0 0 35px rgba(201,161,90,0.55), 0 10px 24px rgba(0,0,0,0.6)",
                  }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleDismiss}
                  className="group relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a15a] bg-gradient-to-r from-[#c9a15a] via-[#dfbe78] to-[#c9a15a] bg-[length:200%_auto] px-8 py-3.5 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase shadow-lg transition-all cursor-pointer"
                >
                  {/* Destello de luz pasando por encima */}
                  <span className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
                  <span>Explorar catálogo</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </motion.button>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
                  <Link
                    href="/login"
                    onClick={handleDismiss}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-7 py-3.5 text-xs font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm transition-all hover:border-[#c9a15a]/70 hover:bg-white/[0.09]"
                  >
                    <LogIn className="h-4 w-4 text-[#c9a15a]" />
                    <span>Iniciar sesión</span>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Micro-nota inferior y tip de teclado */}
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { duration: 0.3 } },
                }}
                className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[0.72rem] text-white/50"
              >
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Compras y cotizaciones directas como invitado</span>
                </span>
                <span className="hidden sm:inline text-white/20">•</span>
                <span className="text-white/40 text-[0.68rem]">
                  Presiona <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.62rem] text-white/80">Esc</kbd> para explorar libremente
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}


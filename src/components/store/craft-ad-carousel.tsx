"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CraftSlide = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
};

const SLIDES: CraftSlide[] = [
  {
    src: "/brand/craft-ad-1.jpg",
    alt: "Selección y curado artesanal de madera de pino recuperada en el taller Mudeco Palets",
    eyebrow: "01 · Taller artesanal",
    title: "Pino noble seleccionado a mano",
  },
  {
    src: "/brand/craft-ad-2.jpg",
    alt: "Mesa de centro en madera de palet con acabado satinado y detalles dorados Mudeco Palets",
    eyebrow: "02 · Diseño a medida",
    title: "Piezas con carácter para tu hogar",
  },
  {
    src: "/brand/craft-ad-3.jpg",
    alt: "Vinera y barra artesanal en madera recuperada iluminada Mudeco Palets",
    eyebrow: "03 · Espacios únicos",
    title: "Vineras y barras hechas para durar",
  },
  {
    src: "/brand/craft-ad-4.jpg",
    alt: "Aplicación de aceite natural satinado sobre madera de pino recuperada Mudeco Palets",
    eyebrow: "04 · Acabado satinado",
    title: "Aceite natural y sellado protector",
  },
];

const INTERVAL_MS = 4500;

export function CraftAdCarousel() {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % SLIDES.length);
    }, INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const current = SLIDES[index];

  function goPrev() {
    setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }

  function goNext() {
    setIndex((prev) => (prev + 1) % SLIDES.length);
  }

  return (
    <div
      className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.08] bg-[#141414] shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Galería publicitaria del taller Mudeco Palets"
    >
      {/* Fotos con transición tipo anuncio */}
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={current.src}
          src={current.src}
          alt={current.alt}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.07 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </AnimatePresence>

      {/* Velos cinematográficos superior e inferior */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85" />

      {/* Encabezado: logo oficial de Mudeco Palets + contador */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-3.5 sm:p-4">
        <div className="flex items-center rounded-xl border border-white/15 bg-black/50 px-2.5 py-1.5 backdrop-blur-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-clear.png"
            alt="Mudeco Palets"
            className="h-8 w-auto object-contain sm:h-9"
          />
        </div>
        <span className="rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.18em] text-white/85 backdrop-blur-md">
          0{index + 1} / 0{SLIDES.length}
        </span>
      </div>

      {/* Flechas discretas al pasar el mouse */}
      <button
        type="button"
        onClick={goPrev}
        aria-label="Foto anterior"
        className="absolute left-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 opacity-0 backdrop-blur-md transition hover:border-brand-gold hover:bg-brand-gold hover:text-black focus-visible:opacity-100 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={goNext}
        aria-label="Siguiente foto"
        className="absolute right-3 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/45 text-white/90 opacity-0 backdrop-blur-md transition hover:border-brand-gold hover:bg-brand-gold hover:text-black focus-visible:opacity-100 group-hover:opacity-100 cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Pie del anuncio: texto editorial + indicadores */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-3 p-4 sm:p-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.title}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: 0.35 }}
            className="min-w-0"
          >
            <p className="text-[0.65rem] font-semibold tracking-[0.2em] text-brand-gold uppercase">
              {current.eyebrow}
            </p>
            <p className="font-display mt-0.5 truncate text-base leading-snug text-white sm:text-lg">
              {current.title}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="flex shrink-0 items-center gap-1.5 pb-1">
          {SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <button
                key={slide.src}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver anuncio ${i + 1}: ${slide.title}`}
                aria-current={active ? "true" : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  active
                    ? "w-6 bg-brand-gold"
                    : "w-1.5 bg-white/35 hover:bg-white/65"
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Barra de progreso dorada */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[2px] bg-white/10">
        {!paused && !reduceMotion && (
          <motion.div
            key={`progress-${index}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
            style={{ transformOrigin: "left" }}
            className="h-full w-full bg-brand-gold"
          />
        )}
      </div>
    </div>
  );
}

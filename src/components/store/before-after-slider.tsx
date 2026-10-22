"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronsLeftRight, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Transformation {
  id: string;
  title: string;
  category: string;
  description: string;
  beforeImg: string;
  afterImg: string;
  beforeLabel: string;
  afterLabel: string;
}

const TRANSFORMATIONS: Transformation[] = [
  {
    id: "mesa",
    title: "Mesa de centro rústica",
    category: "Restauración artesanal",
    description: "Madera de palets de pino seleccionados, cepillada, curada contra plagas y sellada con aceite natural mate.",
    beforeImg: "/brand/store-workshop.jpg",
    afterImg: "/brand/cat-mesa.jpg",
    beforeLabel: "Antes · Madera en bruto",
    afterLabel: "Después · Ebanistería fina",
  },
  {
    id: "tv",
    title: "Consola de TV moderna",
    category: "Fabricación a medida",
    description: "Diseño minimalista con compartimentos ocultos y ensamble de caja y espiga para máxima rigidez.",
    beforeImg: "/brand/store-craft.jpg",
    afterImg: "/brand/cat-tv.jpg",
    beforeLabel: "Antes · Vetas sin curar",
    afterLabel: "Después · Acabado satinado",
  },
  {
    id: "banco",
    title: "Banco industrial reforzado",
    category: "Mueble de uso intensivo",
    description: "Estructura robusta de doble capa con acabado resistente a la intemperie y tono roble envejecido.",
    beforeImg: "/brand/store-workshop.jpg",
    afterImg: "/brand/cat-banco.jpg",
    beforeLabel: "Antes · Palet desarmado",
    afterLabel: "Después · Barniz protector",
  },
];

export function BeforeAfterSlider() {
  const [activeTab, setActiveTab] = useState<string>("mesa");
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = TRANSFORMATIONS.find((t) => t.id === activeTab) || TRANSFORMATIONS[0];

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pos);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleMove(e.clientX);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      handleMove(e.clientX);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="space-y-6">
      {/* Selector de transformaciones */}
      <div className="flex flex-wrap gap-2">
        {TRANSFORMATIONS.map((t) => {
          const active = t.id === activeTab;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActiveTab(t.id);
                setSliderPos(50);
              }}
              className={`relative px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                active
                  ? "border border-[#c9a15a] bg-[#c9a15a]/15 text-[#c9a15a] shadow-[0_0_15px_rgba(201,161,90,0.15)]"
                  : "border border-white/10 bg-white/[0.03] text-white/60 hover:border-white/25 hover:text-white"
              }`}
            >
              {t.title}
              {active && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#c9a15a]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Visor interactivo Before / After */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6 lg:grid-cols-12 lg:items-center"
        >
          {/* Slider visual interactivo */}
          <div className="lg:col-span-8">
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              className="group relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden border border-white/10 bg-[#161616] select-none cursor-ew-resize shadow-2xl"
            >
              {/* Imagen DESPUÉS (Base completa) */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.afterImg}
                alt={current.afterLabel}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                draggable={false}
              />

              {/* Tag Después */}
              <span className="absolute top-4 right-4 z-20 rounded bg-black/80 px-2.5 py-1 text-[0.62rem] font-bold tracking-widest text-[#c9a15a] uppercase backdrop-blur-md border border-[#c9a15a]/30">
                {current.afterLabel}
              </span>

              {/* Imagen ANTES (Clip interactivo) */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPos}%` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={current.beforeImg}
                  alt={current.beforeLabel}
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  style={{
                    width: containerRef.current ? `${containerRef.current.clientWidth}px` : "100%",
                    maxWidth: "none",
                  }}
                  draggable={false}
                />
                <div className="absolute inset-0 bg-black/25" />
                {/* Tag Antes */}
                <span className="absolute top-4 left-4 z-20 rounded bg-black/85 px-2.5 py-1 text-[0.62rem] font-semibold tracking-widest text-white/90 uppercase backdrop-blur-md border border-white/15">
                  {current.beforeLabel}
                </span>
              </div>

              {/* Línea divisoria y manija */}
              <div
                className="absolute top-0 bottom-0 z-30 w-0.5 bg-[#c9a15a] shadow-[0_0_12px_rgba(201,161,90,0.8)] pointer-events-none"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#c9a15a] bg-[#0a0a0a] text-[#c9a15a] shadow-[0_0_20px_rgba(201,161,90,0.4)] transition-transform group-hover:scale-110">
                  <ChevronsLeftRight className="h-4 w-4" />
                </div>
              </div>

              {/* Hint flotante de interacción */}
              <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/75 px-3 py-1 text-[0.6rem] font-medium tracking-wider text-white/70 uppercase backdrop-blur-md border border-white/10 transition-opacity duration-300 group-hover:opacity-30">
                Desliza para comparar
              </div>
            </div>
          </div>

          {/* Ficha descriptiva del proyecto */}
          <div className="lg:col-span-4 space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.65rem] font-semibold tracking-widest text-[#c9a15a] uppercase">
              <Sparkles className="h-3 w-3" />
              {current.category}
            </div>

            <h3 className="font-display text-2xl text-white sm:text-3xl">
              {current.title}
            </h3>

            <p className="text-sm leading-relaxed text-[#d7d7d7]/85">
              {current.description}
            </p>

            <div className="border-t border-white/10 pt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-white/75">
                <span className="text-[#c9a15a] font-medium">Madera origen:</span>
                <span>Pino americano recuperado</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/75">
                <span className="text-[#c9a15a] font-medium">Tratamiento:</span>
                <span>Anticongelante + antihumedad</span>
              </div>
              <div className="flex items-center justify-between text-xs text-white/75">
                <span className="text-[#c9a15a] font-medium">Garantía:</span>
                <span>Estructural de por vida</span>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/reparaciones"
                className="inline-flex items-center gap-2 border border-[#c9a15a] bg-[#c9a15a] px-5 py-3 text-xs font-semibold tracking-wider text-[#0a0a0a] uppercase transition duration-300 hover:bg-[#d4b06e] hover:shadow-[0_0_20px_rgba(201,161,90,0.3)]"
              >
                Solicitar restauración a medida
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

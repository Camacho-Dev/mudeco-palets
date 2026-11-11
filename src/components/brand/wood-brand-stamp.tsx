"use client";

import { useRef, useState, MouseEvent } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Sparkles, Flame } from "lucide-react";
import { LogoMark } from "@/components/logo";

interface WoodBrandStampProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

export function WoodBrandStamp({
  className = "",
  size = "md",
  showSubtitle = true,
}: WoodBrandStampProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Coordenadas de movimiento para efecto 3D Parallax Tilt
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 220, damping: 22 });
  const mouseYSpring = useSpring(y, { stiffness: 220, damping: 22 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["12deg", "-12deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-14deg", "14deg"]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const sizeClasses = {
    sm: "max-w-[280px] p-4",
    md: "max-w-[380px] p-6",
    lg: "max-w-[460px] p-8",
  }[size];

  return (
    <div
      style={{ perspective: 1200 }}
      className={`relative inline-block w-full ${className}`}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className={`group relative mx-auto overflow-hidden rounded-2xl border border-[#c9a15a]/30 bg-gradient-to-b from-[#1c140d] via-[#140e09] to-[#0a0705] shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(201,161,90,0.12)] ${sizeClasses} select-none cursor-pointer`}
      >
        {/* Veta de Madera Simulada con SVG y Gradientes Orgánicos */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40 mix-blend-overlay"
          style={{
            backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(201,161,90,0.2) 0%, transparent 60%),
                              radial-gradient(ellipse at 80% 20%, rgba(160,110,50,0.25) 0%, transparent 50%),
                              repeating-linear-gradient(92deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 3px, transparent 18px),
                              repeating-linear-gradient(88deg, rgba(0,0,0,0.4) 0px, rgba(0,0,0,0.4) 3px, transparent 4px, transparent 24px)`,
          }}
        />

        {/* Reflejo Dinámico / Specular Light que sigue el ángulo */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: isHovered
              ? "radial-gradient(circle at 50% 30%, rgba(255,215,120,0.15) 0%, rgba(201,161,90,0.04) 50%, transparent 80%)"
              : "radial-gradient(circle at 50% 50%, rgba(201,161,90,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Borde Biselado Típico del Bloque de Madera de Palet */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/10 [box-shadow:inset_0_2px_4px_rgba(255,255,255,0.1),inset_0_-2px_6px_rgba(0,0,0,0.8)]" />

        {/* Clavos Rústicos en las 4 Esquinas del Bloque */}
        <span className="absolute top-3 left-3 h-2 w-2 rounded-full bg-[#18110b] border border-[#c9a15a]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_0_2px_rgba(201,161,90,0.4)]" />
        <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-[#18110b] border border-[#c9a15a]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_0_2px_rgba(201,161,90,0.4)]" />
        <span className="absolute bottom-3 left-3 h-2 w-2 rounded-full bg-[#18110b] border border-[#c9a15a]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_0_2px_rgba(201,161,90,0.4)]" />
        <span className="absolute bottom-3 right-3 h-2 w-2 rounded-full bg-[#18110b] border border-[#c9a15a]/40 shadow-[inset_0_1px_2px_rgba(0,0,0,0.9),0_0_2px_rgba(201,161,90,0.4)]" />

        {/* Contenido Central: El Sello Grabado a Fuego */}
        <div
          style={{ transform: "translateZ(30px)" }}
          className="relative z-10 flex flex-col items-center justify-center text-center"
        >
          {/* Insignia Superior */}
          <div className="mb-3 flex items-center gap-1.5 rounded-full border border-[#c9a15a]/35 bg-black/60 px-3 py-0.5 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase backdrop-blur-md">
            <Flame className="h-3 w-3 text-amber-500 animate-pulse" />
            <span>Marca Oficial al Fuego</span>
          </div>

          {/* El Ícono Tallado / Pirograbado con Efecto Relieve y Brasas */}
          <div className="relative my-2 p-2">
            {/* Halo de brasa ardiente debajo */}
            <motion.div
              animate={{
                opacity: isHovered ? [0.6, 0.9, 0.6] : [0.35, 0.55, 0.35],
                scale: isHovered ? [1, 1.08, 1] : [1, 1.03, 1],
              }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-600/30 via-[#c9a15a]/40 to-yellow-600/30 blur-xl"
            />

            {/* Sello hundido en la madera (Inner Shadow & Incisión) */}
            <div className="relative [filter:drop-shadow(0_2px_3px_rgba(0,0,0,0.95))_drop-shadow(0_-1px_1px_rgba(255,200,100,0.25))]">
              <LogoMark
                className="h-16 w-16 text-[#0f0b08] transition-colors duration-500 group-hover:text-[#180f08]"
                color="currentColor"
              />

              {/* Borde incandescente dorado que parpadea como fuego vivo */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  maskImage: "radial-gradient(circle, black 70%, transparent 100%)",
                }}
              >
                <motion.div
                  animate={{
                    opacity: isHovered ? [0.75, 1, 0.75] : [0.4, 0.7, 0.4],
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="h-full w-full"
                >
                  <LogoMark
                    className="h-16 w-16 text-[#c9a15a] mix-blend-color-dodge"
                    color="#c9a15a"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Tipografía de la Marca Estampada */}
          <div className="mt-2 space-y-0.5">
            <h3
              className="text-2xl font-black tracking-[0.28em] text-transparent bg-clip-text bg-gradient-to-b from-[#fcedc7] via-[#d4af37] to-[#8d6928] uppercase font-serif [text-shadow:0_2px_10px_rgba(0,0,0,0.9)]"
            >
              MUDECO
            </h3>
            <p className="text-[0.68rem] font-bold tracking-[0.42em] text-[#c9a15a]/90 uppercase">
              PALETS · EST. 2020
            </p>
          </div>

          {showSubtitle && (
            <p className="mt-3 text-[0.72rem] leading-relaxed text-white/60 max-w-[280px]">
              Ebanistería con madera de pino curada y recuperada.
            </p>
          )}

          {/* Indicador de calidad y autenticidad */}
          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[#c9a15a]/20 text-[0.62rem] text-[#c9a15a]/80 font-medium">
            <Sparkles className="h-3 w-3" />
            <span>Piezas 100% Auténticas y Garantizadas</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/logo";
import {
  Sparkles,
  ArrowRight,
  LogIn,
  X,
  Hammer,
  Leaf,
  ShieldCheck,
  Ruler,
} from "lucide-react";

export function WelcomeModal({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Si ya inició sesión, no mostrar la bienvenida
    if (isAuthenticated) return;

    try {
      const seen = sessionStorage.getItem("mudeco_welcome_seen");
      if (!seen) {
        // Breve retraso suave de 400ms para una aparición elegante
        const timer = setTimeout(() => {
          setOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    } catch {
      // Ignorar errores de storage en modo incógnito estricto
    }
  }, [isAuthenticated]);

  const handleDismiss = () => {
    setOpen(false);
    try {
      sessionStorage.setItem("mudeco_welcome_seen", "true");
    } catch {}
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6 transition-all duration-300 animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-[#c9a15a]/45 bg-[#12100d] p-6 sm:p-10 shadow-[0_30px_90px_rgba(0,0,0,0.95)] text-white text-center">
        {/* Glow atmosférico dorado */}
        <div className="pointer-events-none absolute -top-24 -left-24 h-56 w-56 rounded-full bg-[#c9a15a]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-[#c9a15a]/15 blur-3xl" />

        {/* Botón cerrar X en esquina */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-5 right-5 rounded-full p-2 text-white/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
          title="Cerrar y ver la tienda"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo de Mudeco */}
        <div className="flex justify-center mb-4">
          <BrandLogo width={130} height={100} className="h-14 w-auto" priority />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-3.5 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase backdrop-blur-md mb-3 shadow-xs">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Taller Artesanal · República Dominicana</span>
        </div>

        {/* Título de bienvenida */}
        <h2 id="welcome-title" className="font-display text-2xl sm:text-4xl text-white font-medium leading-tight">
          ¡Te damos la bienvenida a Mudeco Palets!
        </h2>

        {/* Subtítulo */}
        <p className="mt-3 text-sm sm:text-base text-white/75 max-w-lg mx-auto leading-relaxed">
          Muebles con alma de taller hechos con madera recuperada 100% ecológica y curada contra plagas. Diseños listos o proyectos hechos a la medida de tu espacio.
        </p>

        {/* 3 Pilares destacados del taller */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-[#c9a15a]/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a15a]/15 text-[#c9a15a] mb-2">
              <Leaf className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Ecológico</h3>
            <p className="text-[0.72rem] text-white/60 mt-0.5 leading-snug">
              Pino noble reciclado con tratamiento antiparasitario.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-[#c9a15a]/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a15a]/15 text-[#c9a15a] mb-2">
              <Hammer className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Hecho a mano</h3>
            <p className="text-[0.72rem] text-white/60 mt-0.5 leading-snug">
              Ebanistería fina sin moldes industriales masivos.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 transition hover:border-[#c9a15a]/40">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#c9a15a]/15 text-[#c9a15a] mb-2">
              <Ruler className="h-4 w-4" />
            </div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">A tu medida</h3>
            <p className="text-[0.72rem] text-white/60 mt-0.5 leading-snug">
              Adaptamos cada centímetro para que calce en tu hogar.
            </p>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleDismiss}
            className="group relative inline-flex items-center justify-center gap-2 rounded-xl border border-[#c9a15a] bg-[#c9a15a] px-7 py-3.5 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition-all duration-300 hover:bg-[#d4b06e] hover:shadow-[0_0_24px_rgba(201,161,90,0.4)] cursor-pointer"
          >
            <span>Explorar catálogo</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          <Link
            href="/login"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/[0.05] px-7 py-3.5 text-xs font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm transition-all hover:border-[#c9a15a]/60 hover:bg-white/[0.1]"
          >
            <LogIn className="h-4 w-4 text-[#c9a15a]" />
            <span>Iniciar sesión</span>
          </Link>
        </div>

        {/* Pie del modal */}
        <p className="mt-5 text-[0.7rem] text-white/40">
          Puedes comprar y cotizar directamente como visitante sin necesidad de registro previo.
        </p>
      </div>
    </div>
  );
}

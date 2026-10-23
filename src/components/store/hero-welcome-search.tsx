"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  ArrowRight,
  User,
  LogIn,
  SlidersHorizontal,
  Compass,
  X,
  CheckCircle2,
} from "lucide-react";

type UserProp = {
  name?: string | null;
  role?: string | null;
} | null;

const QUICK_TAGS = [
  { label: "Comedores", query: "MESA DE COMEDOR", isCategory: true },
  { label: "Centros TV", query: "REPISA DE TV", isCategory: true },
  { label: "Mesas de noche", query: "MESA DE NOCHE", isCategory: true },
  { label: "Bancos", query: "BANCO", isCategory: true },
  { label: "A medida", href: "/reparaciones" },
];

export function HeroWelcomeSearch({ user }: { user: UserProp }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    try {
      const visited = localStorage.getItem("mudeco_hero_visited");
      if (!visited) {
        setIsFirstVisit(true);
        localStorage.setItem("mudeco_hero_visited", "true");
      }
    } catch {
      // Ignore storage errors in private browsing
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/catalogo?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/catalogo");
    }
  };

  const handleQuickTag = (tag: (typeof QUICK_TAGS)[number]) => {
    if ("href" in tag && tag.href) {
      router.push(tag.href);
    } else if ("isCategory" in tag && tag.isCategory && "query" in tag) {
      router.push(`/catalogo?cat=${encodeURIComponent(tag.query)}`);
    } else if ("query" in tag && tag.query) {
      router.push(`/catalogo?q=${encodeURIComponent(tag.query)}`);
    }
  };

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => setMinimized(false)}
        className="group flex items-center gap-2.5 rounded-full border border-[#c9a15a]/40 bg-[#14120e]/90 px-4 py-2 text-xs font-semibold text-[#c9a15a] shadow-lg backdrop-blur-md transition-all hover:bg-[#c9a15a] hover:text-[#0a0a0a]"
      >
        <Search className="h-4 w-4" />
        <span>Buscador & Bienvenida</span>
        <span className="rounded-full bg-white/10 px-1.5 py-0.2 text-[0.6rem]">Abrir</span>
      </button>
    );
  }

  return (
    <div className="relative w-full max-w-xl rounded-2xl border border-[#c9a15a]/35 bg-[#14120e]/85 p-5 sm:p-6 shadow-[0_24px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl transition-all duration-300">
      {/* Luz ambiental sutil dorada en la esquina */}
      <div className="pointer-events-none absolute -top-16 -right-16 h-36 w-36 rounded-full bg-[#c9a15a]/15 blur-2xl" />

      {/* Cabecera con botón de minimizar y badges */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!user ? (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-[#c9a15a] uppercase shadow-xs">
              <Sparkles className="h-3 w-3" />
              <span>{isFirstVisit ? "¡Primera visita!" : "Bienvenido a Mudeco"}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold tracking-wider text-emerald-400 uppercase">
              <CheckCircle2 className="h-3 w-3" />
              <span>Sesión iniciada</span>
            </div>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 text-[0.62rem] text-white/50 tracking-wider uppercase">
            <Compass className="h-3 w-3 text-[#c9a15a]/60" />
            Taller & Catálogo
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMinimized(true)}
          className="rounded-lg p-1 text-white/40 hover:bg-white/10 hover:text-white transition"
          title="Minimizar panel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Saludo y bienvenida */}
      <div className="mt-3">
        {!user ? (
          <>
            <h2 className="font-display text-xl sm:text-2xl text-white font-medium leading-tight">
              ¡Te damos la bienvenida a Mudeco Palets!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/75 leading-relaxed">
              Muebles artesanales hechos a mano con madera curada. Escribe qué pieza buscas para tu hogar o proyecto.
            </p>
          </>
        ) : (
          <>
            <h2 className="font-display text-xl sm:text-2xl text-white font-medium leading-tight">
              ¡Hola, {user.name ? user.name.split(" ")[0] : "Artesano"}!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-white/70 leading-relaxed">
              ¿Qué mueble, material o pedido deseas consultar hoy?
            </p>
          </>
        )}
      </div>

      {/* Buscador Interactivo */}
      <form onSubmit={handleSearch} className="mt-4">
        <div className="group relative flex items-center rounded-xl border border-white/20 bg-black/60 px-3.5 py-2.5 transition-all duration-300 focus-within:border-[#c9a15a] focus-within:ring-2 focus-within:ring-[#c9a15a]/30">
          <Search className="h-4 w-4 text-[#c9a15a] shrink-0 mr-2.5 transition-transform duration-200 group-focus-within:scale-110" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar comedor, repisa TV, cama, barra..."
            className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mr-2 text-white/40 hover:text-white transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#c9a15a] px-3.5 py-1.5 text-[0.68rem] font-bold text-[#0a0a0a] uppercase tracking-wider transition-all duration-200 hover:bg-[#d4b06e] hover:shadow-[0_0_14px_rgba(201,161,90,0.4)] shrink-0"
          >
            <span>Buscar</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </form>

      {/* Chips de búsquedas y categorías populares */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[0.62rem] font-semibold tracking-wider text-[#c9a15a]/80 uppercase mr-1">
          Populares:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[0.65rem] font-medium text-white/80 transition-all hover:border-[#c9a15a]/60 hover:bg-[#c9a15a]/15 hover:text-[#c9a15a]"
          >
            {tag.label}
          </button>
        ))}
      </div>

      {/* Pie del recuadro con acceso a cuenta o al panel */}
      <div className="mt-4 pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs">
        {!user ? (
          <>
            <span className="text-white/50 text-[0.7rem]">
              ¿Tienes cuenta o eres del taller?
            </span>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#c9a15a] hover:text-[#d4b06e] uppercase tracking-wider transition"
            >
              <LogIn className="h-3 w-3" />
              <span>Iniciar sesión →</span>
            </Link>
          </>
        ) : (
          <>
            <span className="text-white/50 text-[0.7rem]">
              Acceso a gestión y operaciones
            </span>
            <Link
              href="/panel"
              className="inline-flex items-center gap-1 text-[0.68rem] font-semibold text-[#c9a15a] hover:text-[#d4b06e] uppercase tracking-wider transition"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span>Ir al Panel de Control →</span>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

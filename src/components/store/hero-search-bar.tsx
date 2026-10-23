"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, X } from "lucide-react";

const QUICK_TAGS = [
  { label: "Comedores", query: "MESA DE COMEDOR", isCategory: true },
  { label: "Centros TV", query: "REPISA DE TV", isCategory: true },
  { label: "Mesas de noche", query: "MESA DE NOCHE", isCategory: true },
  { label: "Bancos", query: "BANCO", isCategory: true },
  { label: "A medida", href: "/reparaciones" },
];

export function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

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

  return (
    <div className="w-full max-w-xl">
      {/* Buscador minimalista de alta gama */}
      <form onSubmit={handleSearch} className="relative">
        <div className="group relative flex items-center rounded-2xl border border-white/20 bg-[#12100d]/90 p-2 sm:p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 focus-within:border-[#c9a15a] focus-within:ring-2 focus-within:ring-[#c9a15a]/30 hover:border-white/35">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#c9a15a] transition group-focus-within:bg-[#c9a15a]/15">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué mueble buscas? (ej. comedor, repisa TV, cama)..."
            className="w-full bg-transparent px-3 text-sm text-white placeholder:text-white/40 focus:outline-none"
          />

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 text-white/40 hover:text-white transition"
              title="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}

          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a15a] px-5 py-3 text-xs font-bold text-[#0a0a0a] uppercase tracking-wider transition-all duration-200 hover:bg-[#d4b06e] hover:shadow-[0_0_20px_rgba(201,161,90,0.45)] shrink-0 cursor-pointer"
          >
            <span>Buscar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </form>

      {/* Sugerencias rápidas por categoría */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[0.62rem] font-bold tracking-wider text-[#c9a15a] uppercase mr-1">
          Populares:
        </span>
        {QUICK_TAGS.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-[0.68rem] font-medium text-white/80 backdrop-blur-md transition-all hover:border-[#c9a15a]/70 hover:bg-[#c9a15a]/20 hover:text-[#c9a15a] cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ArrowRight, X, Sparkles } from "lucide-react";

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
  const [isFocused, setIsFocused] = useState(false);

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
      {/* Buscador minimalista de alta gama con animación de focus */}
      <form onSubmit={handleSearch} className="relative">
        <motion.div
          animate={{
            borderColor: isFocused ? "rgba(201, 161, 90, 0.9)" : "rgba(255, 255, 255, 0.16)",
            boxShadow: isFocused
              ? "0 0 35px rgba(201, 161, 90, 0.28), 0 20px 50px rgba(0,0,0,0.85)"
              : "0 20px 50px rgba(0,0,0,0.7)",
          }}
          transition={{ duration: 0.25 }}
          className="group relative flex items-center rounded-2xl border bg-[#14120e]/92 p-2 sm:p-2.5 backdrop-blur-xl"
        >
          <motion.div
            animate={{ scale: isFocused ? 1.08 : 1 }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-[#c9a15a] transition-colors group-focus-within:bg-[#c9a15a]/15 group-focus-within:text-[#d4b06e]"
          >
            <Search className="h-5 w-5" />
          </motion.div>

          <input
            type="text"
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="¿Qué mueble buscas? (ej. comedor, repisa TV, cama)..."
            className="w-full bg-transparent px-3 text-sm text-white placeholder:text-white/45 focus:outline-none"
          />

          {query ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setQuery("")}
              className="p-1.5 text-white/40 hover:text-white transition"
              title="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </motion.button>
          ) : null}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.04, boxShadow: "0 0 24px rgba(201, 161, 90, 0.5)" }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#c9a15a] to-[#d4b06e] px-5 py-3 text-xs font-bold text-[#0a0a0a] uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
          >
            <span>Buscar</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </motion.button>
        </motion.div>
      </form>

      {/* Sugerencias interactivas por categoría */}
      <div className="mt-3.5 flex flex-wrap items-center gap-1.5 px-1">
        <span className="text-[0.62rem] font-bold tracking-wider text-[#c9a15a] uppercase mr-1 inline-flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Populares:
        </span>
        {QUICK_TAGS.map((tag) => (
          <motion.button
            key={tag.label}
            type="button"
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleQuickTag(tag)}
            className="rounded-full border border-white/10 bg-black/50 px-3.5 py-1 text-[0.68rem] font-medium text-white/85 backdrop-blur-md transition-colors hover:border-[#c9a15a]/75 hover:bg-[#c9a15a]/20 hover:text-[#c9a15a] cursor-pointer shadow-xs"
          >
            {tag.label}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

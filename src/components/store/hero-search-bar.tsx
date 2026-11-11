"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Sparkles, ChevronRight, ArrowRight } from "lucide-react";
import { productImage } from "@/lib/product-image";
import { formatCurrency } from "@/lib/format";

export type SearchProductItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUrl?: string | null;
  badge?: string;
};

const QUICK_TAGS = [
  { label: "Comedores", query: "MESA DE COMEDOR", isCategory: true },
  { label: "Centros TV", query: "REPISA DE TV", isCategory: true },
  { label: "Mesas de noche", query: "MESA DE NOCHE", isCategory: true },
  { label: "Bancos", query: "BANCO", isCategory: true },
  { label: "A medida", href: "/contacto" },
];

interface HeroSearchBarProps {
  products?: SearchProductItem[];
}

export function HeroSearchBar({ products = [] }: HeroSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const trimmed = query.trim();
    if (trimmed) {
      router.push(`/catalogo?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/catalogo");
    }
  };

  const handleQuickTag = (tag: (typeof QUICK_TAGS)[number]) => {
    setIsOpen(false);
    if ("href" in tag && tag.href) {
      router.push(tag.href);
    } else if ("isCategory" in tag && tag.isCategory && "query" in tag) {
      router.push(`/catalogo?cat=${encodeURIComponent(tag.query)}`);
    } else if ("query" in tag && tag.query) {
      router.push(`/catalogo?q=${encodeURIComponent(tag.query)}`);
    }
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return products.slice(0, 8);
    }
    return products
      .filter((p) => {
        const name = (p.name || "").toLowerCase();
        const cat = (p.category || "").toLowerCase();
        return name.includes(q) || cat.includes(q);
      })
      .slice(0, 8);
  }, [products, query]);

  return (
    <div ref={containerRef} className="relative w-full max-w-xl">
      {/* Buscador minimalista de alta gama con animación de focus */}
      <form onSubmit={handleSearch} className="relative">
        <motion.div
          animate={{
            borderColor: isFocused || isOpen ? "rgba(201, 161, 90, 0.9)" : "rgba(255, 255, 255, 0.16)",
            boxShadow: isFocused || isOpen
              ? "0 0 35px rgba(201, 161, 90, 0.28), 0 20px 50px rgba(0,0,0,0.85)"
              : "0 20px 50px rgba(0,0,0,0.7)",
          }}
          transition={{ duration: 0.25 }}
          className="group relative flex items-center rounded-2xl border bg-[#14120e]/95 p-1.5 sm:p-2 backdrop-blur-xl"
        >
          <input
            type="text"
            value={query}
            onFocus={() => {
              setIsFocused(true);
              setIsOpen(true);
            }}
            onClick={() => setIsOpen(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="¿Qué mueble buscas? (ej. comedor, repisa TV, cama)..."
            className="w-full bg-transparent px-4 text-sm text-white placeholder:text-white/45 focus:outline-none"
          />

          {query ? (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setQuery("");
                setIsOpen(true);
              }}
              className="p-1.5 text-white/40 hover:text-white transition shrink-0 mr-1 cursor-pointer"
              title="Borrar búsqueda"
            >
              <X className="h-4 w-4" />
            </motion.button>
          ) : null}

          <motion.button
            type="submit"
            whileHover={{ scale: 1.03, boxShadow: "0 0 24px rgba(201, 161, 90, 0.5)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c9a15a] to-[#d4b06e] px-5 py-3 text-xs font-bold text-[#0a0a0a] uppercase tracking-wider shadow-md transition-all shrink-0 cursor-pointer"
            title="Buscar en catálogo"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Buscar</span>
          </motion.button>
        </motion.div>
      </form>

      {/* Menú desplegable interactivo de productos disponibles */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-[100] mt-2 overflow-hidden rounded-2xl border border-[#c9a15a]/40 bg-[#12110e]/98 backdrop-blur-2xl shadow-[0_30px_80px_rgba(0,0,0,0.98),0_0_40px_rgba(201,161,90,0.25)] text-white"
          >
            {/* Cabecera del panel de búsqueda */}
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-2.5 bg-white/[0.02]">
              <span className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#c9a15a] flex items-center gap-1.5">
                <Sparkles className="h-3 w-3" />
                {query.trim()
                  ? `Resultados para "${query.trim()}"`
                  : "Muebles disponibles en catálogo"}
              </span>
              <span className="text-[0.68rem] text-white/50">
                {filteredProducts.length} disponibles
              </span>
            </div>

            {/* Lista de productos interactiva */}
            {filteredProducts.length > 0 ? (
              <div className="max-h-[300px] sm:max-h-[340px] overflow-y-auto divide-y divide-white/[0.05]">
                {filteredProducts.map((p) => {
                  const img = productImage(p);
                  return (
                    <Link
                      key={p.id}
                      href={`/producto/${p.id}`}
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center gap-3.5 px-4 py-3 transition hover:bg-white/[0.06]"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#1a1a1a]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-[#c9a15a]">
                          {p.category}
                        </p>
                        <h4 className="truncate text-xs sm:text-sm font-medium text-white group-hover:text-[#c9a15a] transition-colors">
                          {p.name}
                        </h4>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-xs font-bold text-white">
                            {formatCurrency(p.price)}
                          </span>
                          <span className="text-[10px] text-emerald-400/90 flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            {p.stock > 0 ? "En inventario" : "Hecho a mano"}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-white/30 transition-transform group-hover:translate-x-1 group-hover:text-[#c9a15a]" />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 text-center">
                <p className="text-sm text-white/70">
                  No encontramos muebles para &quot;{query}&quot;
                </p>
                <p className="mt-1 text-xs text-white/40">
                  Fabricamos cualquier mueble a medida en nuestro taller.
                </p>
                <Link
                  href="/contacto"
                  onClick={() => setIsOpen(false)}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-3.5 py-2 text-xs font-semibold text-[#c9a15a] hover:bg-[#c9a15a] hover:text-[#0a0a0a] transition"
                >
                  <span>Solicitar cotización a medida</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Enlace al pie para ir al catálogo completo */}
            <Link
              href={query.trim() ? `/catalogo?q=${encodeURIComponent(query.trim())}` : "/catalogo"}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between border-t border-white/[0.08] bg-[#0c0c0c] px-4 py-2.5 text-xs font-semibold text-[#c9a15a] transition hover:bg-[#c9a15a] hover:text-[#0a0a0a]"
            >
              <span>Ver todos los muebles en catálogo →</span>
              <span className="text-[10px] uppercase tracking-wider text-white/40">
                Catálogo completo
              </span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

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

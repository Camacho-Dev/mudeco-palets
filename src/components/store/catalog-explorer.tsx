"use client";

import { useState, useMemo, useTransition } from "react";
import { Search, X, SlidersHorizontal, MessageCircle, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/store-motion";
import { storeWhatsApp } from "@/lib/store-info";
import type { StoreProduct } from "@/lib/store";

type Props = {
  products: StoreProduct[];
  categories: string[];
  badges: Record<string, string>;
  popularIds: string[];
  initialCategory?: string;
  initialQuery?: string;
  initialFilter?: string;
  companyPhone: string;
};

export function CatalogExplorer({
  products,
  categories,
  badges,
  popularIds,
  initialCategory = "",
  initialQuery = "",
  initialFilter = "",
  companyPhone,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [filterMode, setFilterMode] = useState<"all" | "popular">(
    initialFilter === "popular" ? "popular" : "all"
  );
  const [, startTransition] = useTransition();

  function updateUrl(cat: string, q: string, filt: string) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (q) params.set("q", q);
    if (filt === "popular") params.set("filter", "popular");
    const qs = params.toString();
    const newUrl = qs ? `/catalogo?${qs}` : "/catalogo";
    window.history.replaceState(null, "", newUrl);
  }

  function handleSelectCategory(cat: string) {
    startTransition(() => {
      setSelectedCategory(cat);
      setFilterMode("all");
      updateUrl(cat, query, "all");
    });
  }

  function handleSelectPopular() {
    startTransition(() => {
      const next = filterMode === "popular" ? "all" : "popular";
      setFilterMode(next);
      if (next === "popular") setSelectedCategory("");
      updateUrl(next === "popular" ? "" : selectedCategory, query, next);
    });
  }

  function handleClearFilters() {
    startTransition(() => {
      setSelectedCategory("");
      setQuery("");
      setFilterMode("all");
      updateUrl("", "", "all");
    });
  }

  const popularSet = useMemo(() => new Set(popularIds), [popularIds]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Filtro de categoría
      if (
        selectedCategory &&
        p.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      // Filtro de populares
      if (filterMode === "popular" && !popularSet.has(p.id)) {
        return false;
      }

      // Filtro de búsqueda
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = (p.description || "").toLowerCase().includes(q);
        const matchesSku = (p.sku || "").toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesSku && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, filterMode, query, popularSet]);

  const hasActiveFilters = Boolean(
    selectedCategory || query.trim() || filterMode === "popular"
  );

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar */}
      <div className="rounded-xl border border-[#e4d8cb] bg-white p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted)] pointer-events-none" />
            <input
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                updateUrl(selectedCategory, val, filterMode);
              }}
              placeholder="Buscar por mesa, repisa, cómoda, madera..."
              className="input pl-10 h-11 text-sm bg-[#faf8f5] focus:bg-white"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  updateUrl(selectedCategory, "", filterMode);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)] hover:text-black cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-secondary h-11 px-4 text-xs tracking-wider uppercase text-rose-700 hover:text-rose-900 border-rose-200"
            >
              Limpiar
            </button>
          ) : null}
        </div>

        {/* Category Chips - INSTANT 0ms CLICK FILTERING */}
        <div className="mt-4 pt-4 border-t border-[#f0e6db] flex flex-wrap items-center gap-2">
          <span className="text-[0.65rem] font-bold tracking-wider text-[var(--muted)] uppercase mr-1 flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            Clasificación:
          </span>

          <button
            type="button"
            onClick={() => handleSelectCategory("")}
            className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              !selectedCategory && filterMode !== "popular"
                ? "border-[var(--brand)] bg-[var(--brand)] text-[#faf6f1] shadow-sm font-semibold"
                : "border-[#e4d8cb] bg-white text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={handleSelectPopular}
            className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              filterMode === "popular"
                ? "border-[#c9a15a] bg-[#c9a15a] text-[#111111] shadow-[0_0_12px_rgba(201,161,90,0.35)]"
                : "border-[#c9a15a]/50 bg-[#fdfaf5] text-[#8a682a] hover:border-[#c9a15a] hover:bg-[#c9a15a]/10"
            }`}
          >
            ★ Más vendidos
          </button>

          {categories.map((c) => {
            const active =
              selectedCategory.toLowerCase() === c.toLowerCase() &&
              filterMode !== "popular";
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectCategory(c)}
                className={`rounded-full border px-3.5 py-1.5 text-[0.68rem] tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                  active
                    ? "border-[var(--brand)] bg-[var(--brand)] text-[#faf6f1] shadow-sm font-semibold"
                    : "border-[#e4d8cb] bg-white text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                }`}
              >
                {c}
              </button>
            );
          })}

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={handleClearFilters}
              className="ml-auto text-[0.65rem] font-semibold text-rose-700 hover:underline tracking-wider uppercase cursor-pointer"
            >
              Limpiar filtros ×
            </button>
          ) : null}
        </div>
      </div>

      {/* Results summary bar */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] px-1">
        <p>
          Mostrando{" "}
          <span className="font-bold text-[var(--wood-950)]">
            {filteredProducts.length}
          </span>{" "}
          {filteredProducts.length === 1
            ? "mueble disponible"
            : "muebles disponibles"}
          {selectedCategory ? ` en ${selectedCategory}` : ""}
          {filterMode === "popular" ? " · Más populares" : ""}
          {query ? ` para "${query}"` : ""}
        </p>
        <span className="hidden sm:inline-block">Madera 100% curada y tratada</span>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#e4d8cb] bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-display text-2xl text-[var(--wood-950)]">
            No encontramos muebles para esta selección
          </p>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
            ¿No ves lo que necesitas? Fabricamos cualquier mueble a medida o restauramos el tuyo en nuestro taller.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleClearFilters}
              className="btn btn-primary text-xs uppercase tracking-wider cursor-pointer"
            >
              Ver todo el catálogo
            </button>
            <a
              href={storeWhatsApp(
                companyPhone,
                `Hola Mudeco Palets, busco un mueble con características: ${
                  query || selectedCategory || "a medida"
                }. ¿Lo fabrican?`
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs uppercase tracking-wider"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {filteredProducts.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.03, 0.2)}>
              <ProductCard product={p} badge={badges[p.id]} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

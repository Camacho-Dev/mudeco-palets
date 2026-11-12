"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import {
  Search,
  X,
  SlidersHorizontal,
  MessageCircle,
  Sparkles,
  ArrowUpDown,
  Layers,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CatalogPriceFilter } from "@/components/store/catalog-price-filter";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/store-motion";
import { storeWhatsApp } from "@/lib/store-info";
import { formatStoreCategory } from "@/lib/store-brand";
import { availabilityOf } from "@/lib/made-to-order";
import type { StoreProduct } from "@/lib/store";

type SortOption = "relevance" | "price-asc" | "price-desc" | "newest" | "name";
type AvailabilityOption = "all" | "in-stock" | "custom";

type Props = {
  products: StoreProduct[];
  categories: string[];
  badges: Record<string, string>;
  popularIds: string[];
  initialCategory?: string;
  initialQuery?: string;
  initialFilter?: string;
  initialMinPrice?: number;
  initialMaxPrice?: number;
  companyPhone: string;
};

const formatCategoryName = formatStoreCategory;

/** Monto compacto sin decimales para filtros: "RD$ 12,500" */
function formatPrice(n: number) {
  return `RD$ ${Math.round(n).toLocaleString("es-DO")}`;
}

export function CatalogExplorer({
  products,
  categories,
  badges,
  popularIds,
  initialCategory = "",
  initialQuery = "",
  initialFilter = "",
  initialMinPrice,
  initialMaxPrice,
  companyPhone,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sortBy, setSortBy] = useState<SortOption>("relevance");
  const [availability, setAvailability] = useState<AvailabilityOption>("all");
  const [filterMode, setFilterMode] = useState<"all" | "popular">(
    initialFilter === "popular" ? "popular" : "all",
  );
  const [showPricePanel, setShowPricePanel] = useState(
    Boolean(initialMinPrice != null || initialMaxPrice != null),
  );
  const [, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();

  // Sync local filter state when URL searchParams change (e.g. clicking category or searching from header while already on /catalogo)
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setFilterMode(initialFilter === "popular" ? "popular" : "all");
  }, [initialFilter]);

  // Compute overall min and max prices from the catalog
  const { minPriceLimit, maxPriceLimit } = useMemo(() => {
    if (!products.length) return { minPriceLimit: 0, maxPriceLimit: 50000 };
    let min = Infinity;
    let max = -Infinity;
    for (const p of products) {
      if (p.price < min) min = p.price;
      if (p.price > max) max = p.price;
    }
    const cleanMin = Math.max(0, Math.floor(min / 500) * 500);
    const cleanMax = Math.max(cleanMin + 5000, Math.ceil(max / 1000) * 1000);
    return { minPriceLimit: cleanMin, maxPriceLimit: cleanMax };
  }, [products]);

  // Current price filter range state [min, max]
  const [priceRange, setPriceRange] = useState<[number, number]>(() => {
    const min =
      initialMinPrice != null && !isNaN(initialMinPrice)
        ? Math.max(minPriceLimit, Math.min(initialMinPrice, maxPriceLimit))
        : minPriceLimit;
    const max =
      initialMaxPrice != null && !isNaN(initialMaxPrice)
        ? Math.max(min, Math.min(initialMaxPrice, maxPriceLimit))
        : maxPriceLimit;
    return [min, max];
  });

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.category] = (counts[p.category] || 0) + 1;
    }
    return counts;
  }, [products]);

  // Valid non-empty categories
  const validCategories = useMemo(() => {
    return categories.filter((c) => (categoryCounts[c] || 0) > 0);
  }, [categories, categoryCounts]);

  // Dynamic price preset options based on actual catalog span
  const presets = useMemo(() => {
    const span = maxPriceLimit - minPriceLimit;
    const tier1 = Math.round((minPriceLimit + span * 0.28) / 500) * 500;
    const tier2 = Math.round((minPriceLimit + span * 0.62) / 500) * 500;
    return [
      { label: "Cualquier precio", min: minPriceLimit, max: maxPriceLimit },
      {
        label: `Hasta RD$ ${tier1.toLocaleString("es-DO")}`,
        min: minPriceLimit,
        max: tier1,
      },
      {
        label: `RD$ ${tier1.toLocaleString("es-DO")} – ${tier2.toLocaleString("es-DO")}`,
        min: tier1,
        max: tier2,
      },
      {
        label: `Más de RD$ ${tier2.toLocaleString("es-DO")}`,
        min: tier2,
        max: maxPriceLimit,
      },
    ];
  }, [minPriceLimit, maxPriceLimit]);

  function updateUrl(
    cat: string,
    q: string,
    filt: string,
    minP?: number,
    maxP?: number,
  ) {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (cat) params.set("cat", cat);
    if (q) params.set("q", q);
    if (filt === "popular") params.set("filter", "popular");

    const effMin = minP !== undefined ? minP : priceRange[0];
    const effMax = maxP !== undefined ? maxP : priceRange[1];

    if (effMin > minPriceLimit) params.set("minPrice", String(effMin));
    if (effMax < maxPriceLimit) params.set("maxPrice", String(effMax));

    const qs = params.toString();
    const newUrl = qs ? `/catalogo?${qs}` : "/catalogo";
    window.history.replaceState(null, "", newUrl);
  }

  function handleSelectCategory(cat: string) {
    startTransition(() => {
      setSelectedCategory(cat);
      setFilterMode("all");
      updateUrl(cat, query, "all", priceRange[0], priceRange[1]);
    });
  }

  function handleSelectPopular() {
    startTransition(() => {
      const next = filterMode === "popular" ? "all" : "popular";
      setFilterMode(next);
      if (next === "popular") setSelectedCategory("");
      updateUrl(
        next === "popular" ? "" : selectedCategory,
        query,
        next,
        priceRange[0],
        priceRange[1],
      );
    });
  }

  function handleClearFilters() {
    startTransition(() => {
      setSelectedCategory("");
      setQuery("");
      setSortBy("relevance");
      setAvailability("all");
      setFilterMode("all");
      setPriceRange([minPriceLimit, maxPriceLimit]);
      updateUrl("", "", "all", minPriceLimit, maxPriceLimit);
    });
  }

  function handleResetPrice() {
    startTransition(() => {
      setPriceRange([minPriceLimit, maxPriceLimit]);
      updateUrl(
        selectedCategory,
        query,
        filterMode,
        minPriceLimit,
        maxPriceLimit,
      );
    });
  }

  function handlePriceChange(next: [number, number]) {
    setPriceRange(next);
    startTransition(() => {
      updateUrl(selectedCategory, query, filterMode, next[0], next[1]);
    });
  }

  const popularSet = useMemo(() => new Set(popularIds), [popularIds]);

  const isPriceFiltered =
    priceRange[0] > minPriceLimit || priceRange[1] < maxPriceLimit;

  const priceSample = useMemo(() => products.map((p) => p.price), [products]);

  // Filtered and sorted products
  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter((p) => {
      if (
        selectedCategory &&
        p.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }

      if (filterMode === "popular" && !popularSet.has(p.id)) {
        return false;
      }

      if (availability === "in-stock" && availabilityOf(p) !== "in-stock") return false;
      if (availability === "custom" && availabilityOf(p) === "in-stock") return false;

      if (p.price < priceRange[0] || p.price > priceRange[1]) {
        return false;
      }

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

    switch (sortBy) {
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case "newest":
        result = [...result].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime(),
        );
        break;
      case "name":
        result = [...result].sort((a, b) => a.name.localeCompare(b.name, "es"));
        break;
      case "relevance":
        result = [...result].sort((a, b) => (availabilityOf(a) === "sold-out" ? 1 : 0) - (availabilityOf(b) === "sold-out" ? 1 : 0));
        break;
      default:
        break;
    }

    return result;
  }, [
    products,
    selectedCategory,
    filterMode,
    query,
    availability,
    priceRange,
    sortBy,
    popularSet,
  ]);

  const hasActiveFilters = Boolean(
    selectedCategory ||
      query.trim() ||
      filterMode === "popular" ||
      availability !== "all" ||
      sortBy !== "relevance" ||
      isPriceFiltered,
  );

  const chipBase =
    "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 cursor-pointer";
  const chipIdle =
    "border-[#e4ddd2] bg-white text-[#5c4f43] hover:border-[#c9a15a] hover:text-[#1b1511]";
  const chipActive = "border-[#1b1511] bg-[#1b1511] text-white";

  const sortLabels: Record<SortOption, string> = {
    relevance: "Destacados",
    "price-asc": "Menor precio",
    "price-desc": "Mayor precio",
    newest: "Más recientes",
    name: "Nombre A-Z",
  };

  const activeTags: { key: string; label: string; onRemove: () => void }[] = [];
  if (selectedCategory)
    activeTags.push({
      key: "cat",
      label: formatCategoryName(selectedCategory),
      onRemove: () => handleSelectCategory(""),
    });
  if (filterMode === "popular")
    activeTags.push({ key: "pop", label: "Más vendidos", onRemove: handleSelectPopular });
  if (query.trim())
    activeTags.push({
      key: "q",
      label: `“${query.trim()}”`,
      onRemove: () => {
        setQuery("");
        updateUrl(selectedCategory, "", filterMode);
      },
    });
  if (availability !== "all")
    activeTags.push({
      key: "av",
      label: availability === "in-stock" ? "Listos para entrega" : "Por encargo",
      onRemove: () => setAvailability("all"),
    });
  if (isPriceFiltered)
    activeTags.push({
      key: "price",
      label: `${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`,
      onRemove: handleResetPrice,
    });
  if (sortBy !== "relevance")
    activeTags.push({
      key: "sort",
      label: sortLabels[sortBy],
      onRemove: () => setSortBy("relevance"),
    });

  const selectClass =
    "h-11 w-full appearance-none rounded-xl border border-[#e4ddd2] bg-white pl-9 pr-9 text-[13px] font-medium text-[#1b1511] transition-colors hover:border-[#c9a15a] focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[#e7e1d8] bg-white shadow-[0_1px_2px_rgba(27,21,17,0.04),0_12px_32px_-16px_rgba(27,21,17,0.18)]">
        {/* Búsqueda, disponibilidad, orden y precio */}
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative lg:flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#a39483]" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                updateUrl(selectedCategory, val, filterMode);
              }}
              placeholder="Buscar cama, mesa, comedor, repisa…"
              aria-label="Buscar en el catálogo"
              className="h-11 w-full rounded-xl border border-[#e4ddd2] bg-[#faf8f5] pr-10 pl-10 text-sm text-[#1b1511] placeholder:text-[#a39483] transition-colors focus:border-[#c9a15a] focus:bg-white focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  updateUrl(selectedCategory, "", filterMode);
                }}
                className="absolute top-1/2 right-3 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[#a39483] transition hover:bg-black/5 hover:text-[#1b1511]"
                aria-label="Borrar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:flex lg:shrink-0">
            <div className="relative lg:w-52">
              <Layers className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#a39483]" />
              <select
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as AvailabilityOption)
                }
                aria-label="Disponibilidad"
                className={selectClass}
              >
                <option value="all">Toda disponibilidad</option>
                <option value="in-stock">Listos para entrega</option>
                <option value="custom">Por encargo</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#a39483]" />
            </div>

            <div className="relative lg:w-52">
              <ArrowUpDown className="pointer-events-none absolute top-1/2 left-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#a39483]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                aria-label="Ordenar"
                className={selectClass}
              >
                <option value="relevance">Destacados</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="newest">Más recientes</option>
                <option value="name">Nombre: A a Z</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 h-3.5 w-3.5 -translate-y-1/2 text-[#a39483]" />
            </div>

            <button
              type="button"
              onClick={() => setShowPricePanel((prev) => !prev)}
              aria-expanded={showPricePanel}
              aria-controls="catalog-price-panel"
              className={`col-span-2 flex h-11 items-center justify-between gap-2 rounded-xl border px-3.5 text-[13px] font-medium transition-colors sm:col-span-1 lg:w-auto lg:min-w-44 cursor-pointer ${
                showPricePanel
                  ? "border-[#1b1511] bg-[#1b1511] text-white"
                  : isPriceFiltered
                    ? "border-[#c9a15a] bg-[#fbf7ef] text-[#1b1511]"
                    : "border-[#e4ddd2] bg-white text-[#1b1511] hover:border-[#c9a15a]"
              }`}
            >
              <span className="flex min-w-0 items-center gap-2">
                <SlidersHorizontal
                  className={`h-3.5 w-3.5 shrink-0 ${
                    showPricePanel ? "text-[#c9a15a]" : "text-[#a39483]"
                  }`}
                />
                <span className="truncate tabular-nums">
                  {isPriceFiltered
                    ? `${formatPrice(priceRange[0])} – ${formatPrice(priceRange[1])}`
                    : "Precio"}
                </span>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  showPricePanel ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Panel de precio */}
        <AnimatePresence initial={false}>
          {showPricePanel ? (
            <motion.div
              id="catalog-price-panel"
              key="price-panel"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[#efe9e0] bg-[#faf8f5] p-4 sm:p-6">
                <div>
                  <CatalogPriceFilter
                    prices={priceSample}
                    limits={[minPriceLimit, maxPriceLimit]}
                    value={priceRange}
                    presets={presets}
                    resultCount={filteredAndSortedProducts.length}
                    onChange={handlePriceChange}
                  />
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Colecciones */}
        <div className="border-t border-[#efe9e0] px-4 py-3 sm:px-5">
          <div
            className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:-mx-5 sm:px-5 [&::-webkit-scrollbar]:hidden"
            role="group"
            aria-label="Colecciones"
          >
            <button
              type="button"
              onClick={() => handleSelectCategory("")}
              aria-pressed={!selectedCategory && filterMode !== "popular"}
              className={`${chipBase} ${
                !selectedCategory && filterMode !== "popular" ? chipActive : chipIdle
              }`}
            >
              Todas
              <span
                className={`text-[11px] tabular-nums ${
                  !selectedCategory && filterMode !== "popular"
                    ? "text-[#c9a15a]"
                    : "text-[#a39483]"
                }`}
              >
                {products.length}
              </span>
            </button>

            {popularIds.length > 0 ? (
              <button
                type="button"
                onClick={handleSelectPopular}
                aria-pressed={filterMode === "popular"}
                className={`${chipBase} ${filterMode === "popular" ? chipActive : chipIdle}`}
              >
                <Sparkles
                  className={`h-3.5 w-3.5 ${
                    filterMode === "popular" ? "text-[#c9a15a]" : "text-[#b0894f]"
                  }`}
                />
                Más vendidos
                <span
                  className={`text-[11px] tabular-nums ${
                    filterMode === "popular" ? "text-[#c9a15a]" : "text-[#a39483]"
                  }`}
                >
                  {popularIds.length}
                </span>
              </button>
            ) : null}

            <span className="my-1.5 w-px shrink-0 bg-[#e4ddd2]" aria-hidden />

            {validCategories.map((c) => {
              const count = categoryCounts[c] || 0;
              const active =
                selectedCategory.toLowerCase() === c.toLowerCase() &&
                filterMode !== "popular";
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectCategory(c)}
                  aria-pressed={active}
                  className={`${chipBase} ${active ? chipActive : chipIdle}`}
                >
                  {formatCategoryName(c)}
                  <span
                    className={`text-[11px] tabular-nums ${
                      active ? "text-[#c9a15a]" : "text-[#a39483]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filtros activos */}
        <AnimatePresence initial={false}>
          {hasActiveFilters ? (
            <motion.div
              key="active-filters"
              initial={reduceMotion ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 border-t border-[#efe9e0] px-4 py-3 sm:px-5">
                {activeTags.map((t) => (
                  <span
                    key={t.key}
                    className="inline-flex h-7 items-center gap-1 rounded-full bg-[#f3eee6] pr-1 pl-3 text-xs font-medium text-[#3d3229]"
                  >
                    {t.label}
                    <button
                      type="button"
                      onClick={t.onRemove}
                      className="flex h-5 w-5 items-center justify-center rounded-full text-[#8a7a6a] transition hover:bg-[#1b1511] hover:text-white cursor-pointer"
                      aria-label={`Quitar filtro: ${t.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="ml-auto text-xs font-semibold text-[#8a7a6a] underline-offset-4 transition hover:text-[#1b1511] hover:underline cursor-pointer"
                >
                  Limpiar todo
                </button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Contador de resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 text-xs text-[#8a7260]">
        <p>
          Mostrando{" "}
          <span className="font-bold text-[#1b1511]">
            {filteredAndSortedProducts.length}
          </span>{" "}
          {filteredAndSortedProducts.length === 1
            ? "mueble"
            : "muebles"}
          {selectedCategory ? ` en ${formatCategoryName(selectedCategory)}` : ""}
          {filterMode === "popular" ? " · Más Vendidos" : ""}
          {isPriceFiltered
            ? ` · Entre ${formatPrice(priceRange[0])} y ${formatPrice(priceRange[1])}`
            : ""}
          {query ? ` para "${query}"` : ""}
        </p>
      </div>

      {/* Cuadrícula de productos */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#e4d8cb] bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-display text-2xl text-[var(--wood-950)]">
            No se encontraron muebles para esta combinación
          </p>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
            Fabricamos cualquier mueble a tus dimensiones exactas en nuestro taller.
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
                }${
                  isPriceFiltered
                    ? ` con presupuesto entre ${formatPrice(priceRange[0])} y ${formatPrice(priceRange[1])}`
                    : ""
                }. ¿Podrían cotizármelo?`,
              )}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary text-xs uppercase tracking-wider inline-flex items-center gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              Cotizar a medida por WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-4">
          {filteredAndSortedProducts.map((p, i) => (
            <Reveal key={p.id} delay={Math.min(i * 0.02, 0.2)}>
              <ProductCard product={p} badge={badges[p.id]} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}

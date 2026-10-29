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
  RotateCcw,
} from "lucide-react";
import { ProductCard } from "@/components/store/product-card";
import { Reveal } from "@/components/store/store-motion";
import { storeWhatsApp } from "@/lib/store-info";
import { formatStoreCategory } from "@/lib/store-brand";
import { formatCurrency } from "@/lib/format";
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
      { label: "Todos", min: minPriceLimit, max: maxPriceLimit },
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

  function handleMinPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    const clamped = Math.min(val, priceRange[1] - 500);
    const next: [number, number] = [clamped, priceRange[1]];
    setPriceRange(next);
    startTransition(() => {
      updateUrl(selectedCategory, query, filterMode, next[0], next[1]);
    });
  }

  function handleMaxPriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    const clamped = Math.max(val, priceRange[0] + 500);
    const next: [number, number] = [priceRange[0], clamped];
    setPriceRange(next);
    startTransition(() => {
      updateUrl(selectedCategory, query, filterMode, next[0], next[1]);
    });
  }

  function handleApplyPreset(min: number, max: number) {
    const next: [number, number] = [min, max];
    setPriceRange(next);
    startTransition(() => {
      updateUrl(selectedCategory, query, filterMode, min, max);
    });
  }

  const popularSet = useMemo(() => new Set(popularIds), [popularIds]);

  const isPriceFiltered =
    priceRange[0] > minPriceLimit || priceRange[1] < maxPriceLimit;

  // Percentage calculations for the visual price bar highlight
  const minPercent =
    maxPriceLimit > minPriceLimit
      ? Math.max(
          0,
          Math.min(
            100,
            ((priceRange[0] - minPriceLimit) /
              (maxPriceLimit - minPriceLimit)) *
              100,
          ),
        )
      : 0;

  const maxPercent =
    maxPriceLimit > minPriceLimit
      ? Math.max(
          0,
          Math.min(
            100,
            ((priceRange[1] - minPriceLimit) /
              (maxPriceLimit - minPriceLimit)) *
              100,
          ),
        )
      : 100;

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

      if (availability === "in-stock" && p.stock <= 0) return false;
      if (availability === "custom" && p.stock > 0) return false;

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

  return (
    <div className="space-y-5">
      {/* Barra de búsqueda y filtros compacta y alineada */}
      <div className="rounded-2xl border border-[#e2d5c5] bg-[#fffdfa] p-4 sm:p-5 shadow-[0_4px_20px_rgba(28,20,16,0.04)]">
        {/* Fila 1: Buscador + Disponibilidad + Orden + Botón de Presupuesto en una sola línea en desktop */}
        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-12 lg:items-center">
          {/* Buscador */}
          <div className="relative md:col-span-2 lg:col-span-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a7260] pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                const val = e.target.value;
                setQuery(val);
                updateUrl(selectedCategory, val, filterMode);
              }}
              placeholder="Buscar por cama, mesa, comedor, repisa..."
              style={{ paddingLeft: "2.65rem", paddingRight: "2.25rem" }}
              className="w-full h-11 rounded-xl border border-[#d8c8b4] bg-[#faf7f2] text-sm text-[#1b1511] placeholder:text-[#9c8978] transition-all duration-200 focus:bg-white focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/25 focus:outline-none"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  updateUrl(selectedCategory, "", filterMode);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-[#8a7260] hover:bg-black/5 hover:text-black transition"
                aria-label="Borrar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Disponibilidad */}
          <div className="relative lg:col-span-2">
            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7260] pointer-events-none" />
            <select
              value={availability}
              onChange={(e) =>
                setAvailability(e.target.value as AvailabilityOption)
              }
              style={{ paddingLeft: "2.2rem" }}
              className="w-full h-11 appearance-none rounded-xl border border-[#d8c8b4] bg-[#faf7f2] pr-8 text-xs font-semibold text-[#1b1511] transition-all duration-200 hover:border-[#c9a15a] focus:bg-white focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/25 focus:outline-none cursor-pointer"
            >
              <option value="all">Disponibilidad: Todas</option>
              <option value="in-stock">Listos para entrega</option>
              <option value="custom">Bajo pedido / A medida</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7260]" />
          </div>

          {/* Ordenar por */}
          <div className="relative lg:col-span-3">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7260] pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ paddingLeft: "2.2rem" }}
              className="w-full h-11 appearance-none rounded-xl border border-[#d8c8b4] bg-[#faf7f2] pr-8 text-xs font-semibold text-[#1b1511] transition-all duration-200 hover:border-[#c9a15a] focus:bg-white focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/25 focus:outline-none cursor-pointer"
            >
              <option value="relevance">Ordenar: Destacados del taller</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
              <option value="newest">Más recientes</option>
              <option value="name">Nombre: A a Z</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8a7260]" />
          </div>

          {/* Botón desplegable de Presupuesto */}
          <div className="lg:col-span-2">
            <button
              type="button"
              onClick={() => setShowPricePanel((prev) => !prev)}
              className={`flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                showPricePanel || isPriceFiltered
                  ? "border-[#c9a15a] bg-[#16120f] text-[#faf6f1]"
                  : "border-[#d8c8b4] bg-[#faf7f2] text-[#1b1511] hover:border-[#c9a15a] hover:bg-white"
              }`}
            >
              <span className="flex items-center gap-2 truncate">
                <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-[#c9a15a]" />
                <span className="truncate">
                  {isPriceFiltered ? "Precio activo" : "Presupuesto"}
                </span>
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                  showPricePanel ? "rotate-180 text-[#c9a15a]" : "opacity-60"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Fila 2: Colecciones completas visibles sin cortes */}
        <div className="mt-4 pt-3.5 border-t border-[#ebdccf]">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Todas las piezas */}
            <button
              type="button"
              onClick={() => handleSelectCategory("")}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                !selectedCategory && filterMode !== "popular"
                  ? "bg-[#16120f] text-[#faf6f1] shadow-xs border border-[#c9a15a]/50"
                  : "bg-white text-[#5c4a3b] border border-[#e0d2c1] hover:border-[#c9a15a] hover:bg-[#faf7f2]"
              }`}
            >
              <span>Todas</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.62rem] font-bold ${
                  !selectedCategory && filterMode !== "popular"
                    ? "bg-[#c9a15a] text-[#16120f]"
                    : "bg-[#f2e9dd] text-[#755f4d]"
                }`}
              >
                {products.length}
              </span>
            </button>

            {/* Más vendidos */}
            <button
              type="button"
              onClick={handleSelectPopular}
              className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                filterMode === "popular"
                  ? "bg-[#c9a15a] text-[#16120f] shadow-xs border border-[#b3883b]"
                  : "bg-white text-[#8a682a] border border-[#c9a15a]/40 hover:border-[#c9a15a] hover:bg-[#fbf7ee]"
              }`}
            >
              <Sparkles className="h-3 w-3" />
              <span>Más Vendidos</span>
              <span
                className={`rounded-full px-1.5 py-0.2 text-[0.62rem] font-bold ${
                  filterMode === "popular"
                    ? "bg-[#16120f] text-[#faf6f1]"
                    : "bg-[#f5ebd7] text-[#8a682a]"
                }`}
              >
                {popularIds.length}
              </span>
            </button>

            {/* Categorías reales */}
            {validCategories.map((c) => {
              const count = categoryCounts[c] || 0;
              const active =
                selectedCategory.toLowerCase() === c.toLowerCase() &&
                filterMode !== "popular";
              const label = formatCategoryName(c);

              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => handleSelectCategory(c)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer ${
                    active
                      ? "bg-[#16120f] text-[#faf6f1] shadow-xs border border-[#c9a15a]/50"
                      : "bg-white text-[#5c4a3b] border border-[#e0d2c1] hover:border-[#c9a15a] hover:bg-[#faf7f2]"
                  }`}
                >
                  <span>{label}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[0.62rem] font-bold ${
                      active
                        ? "bg-[#c9a15a] text-[#16120f]"
                        : "bg-[#f2e9dd] text-[#755f4d]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Panel colapsable de Rango de Presupuesto (solo abierto cuando el usuario lo solicita o está activo) */}
        {showPricePanel ? (
          <div className="mt-4 rounded-xl border border-[#e5d8c8] bg-[#faf7f2] p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#e5d8c8]">
              <div>
                <span className="text-xs font-bold tracking-[0.14em] text-[#2c221a] uppercase">
                  Rango de Presupuesto
                </span>
                <p className="text-[11px] text-[#85705e]">
                  RD$ {priceRange[0].toLocaleString("es-DO")} — RD${" "}
                  {priceRange[1].toLocaleString("es-DO")} (
                  {filteredAndSortedProducts.length} piezas)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {presets.map((preset) => {
                  const active =
                    priceRange[0] === preset.min &&
                    priceRange[1] === preset.max;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleApplyPreset(preset.min, preset.max)}
                      className={`rounded-full px-3 py-1 text-xs transition-all duration-150 cursor-pointer ${
                        active
                          ? "bg-[#1b1511] text-[#c9a15a] font-semibold"
                          : "bg-white text-[#5c4a3b] border border-[#d8c8b4] hover:border-[#c9a15a]"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
                {isPriceFiltered ? (
                  <button
                    type="button"
                    onClick={handleResetPrice}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d8c8b4] bg-white text-[#8a2b2b] hover:bg-[#8a2b2b]/10 transition cursor-pointer"
                    title="Restablecer precio"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="pt-3 px-1">
              <div className="relative h-2 w-full rounded-full bg-[#dfd0be] overflow-hidden">
                <div
                  className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#c9a15a] via-[#e5c47a] to-[#b3883b]"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />
              </div>

              <div className="relative -mt-2 h-5">
                <input
                  type="range"
                  min={minPriceLimit}
                  max={maxPriceLimit}
                  step={250}
                  value={priceRange[0]}
                  onChange={handleMinPriceChange}
                  aria-label="Precio mínimo"
                  className="price-slider-input"
                />
                <input
                  type="range"
                  min={minPriceLimit}
                  max={maxPriceLimit}
                  step={250}
                  value={priceRange[1]}
                  onChange={handleMaxPriceChange}
                  aria-label="Precio máximo"
                  className="price-slider-input"
                />
              </div>

              <div className="flex items-center justify-between text-[0.68rem] text-[#85705e] font-medium pt-0.5">
                <span>Mín: RD$ {minPriceLimit.toLocaleString("es-DO")}</span>
                <span>Máx: RD$ {maxPriceLimit.toLocaleString("es-DO")}</span>
              </div>
            </div>
          </div>
        ) : null}

        {/* Barra de filtros activos */}
        {hasActiveFilters ? (
          <div className="mt-3.5 pt-3 border-t border-[#ebdccf] flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[0.68rem] text-[#8a7260] uppercase tracking-wider font-semibold mr-1">
                Filtros activos:
              </span>

              {selectedCategory ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16120f] px-3 py-1 text-xs text-[#faf6f1]">
                  {formatCategoryName(selectedCategory)}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("")}
                    className="hover:text-[#c9a15a] cursor-pointer"
                    aria-label="Quitar filtro de colección"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {filterMode === "popular" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c9a15a] px-3 py-1 text-xs text-[#16120f] font-semibold">
                  Más Vendidos
                  <button
                    type="button"
                    onClick={handleSelectPopular}
                    className="hover:text-black cursor-pointer"
                    aria-label="Quitar filtro de más vendidos"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {query ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16120f] px-3 py-1 text-xs text-[#faf6f1]">
                  &ldquo;{query}&rdquo;
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      updateUrl(selectedCategory, "", filterMode);
                    }}
                    className="hover:text-[#c9a15a] cursor-pointer"
                    aria-label="Quitar búsqueda"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {availability !== "all" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16120f] px-3 py-1 text-xs text-[#faf6f1]">
                  {availability === "in-stock"
                    ? "Listos para entrega"
                    : "Bajo pedido"}
                  <button
                    type="button"
                    onClick={() => setAvailability("all")}
                    className="hover:text-[#c9a15a] cursor-pointer"
                    aria-label="Quitar filtro de disponibilidad"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {isPriceFiltered ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16120f] px-3 py-1 text-xs text-[#faf6f1] border border-[#c9a15a]/40">
                  {formatCurrency(priceRange[0])} –{" "}
                  {formatCurrency(priceRange[1])}
                  <button
                    type="button"
                    onClick={handleResetPrice}
                    className="hover:text-[#c9a15a] cursor-pointer ml-0.5"
                    aria-label="Quitar filtro de precio"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}

              {sortBy !== "relevance" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#16120f] px-3 py-1 text-xs text-[#faf6f1]">
                  {sortBy === "price-asc"
                    ? "Menor precio"
                    : sortBy === "price-desc"
                      ? "Mayor precio"
                      : sortBy === "newest"
                        ? "Más recientes"
                        : "Nombre A-Z"}
                  <button
                    type="button"
                    onClick={() => setSortBy("relevance")}
                    className="hover:text-[#c9a15a] cursor-pointer"
                    aria-label="Quitar orden"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a2b2b] hover:text-[#5c1c1c] transition uppercase tracking-wider cursor-pointer ml-auto"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer
            </button>
          </div>
        ) : null}
      </div>

      {/* Contador de resultados */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1 text-xs text-[#8a7260]">
        <p>
          Mostrando{" "}
          <span className="font-bold text-[#1b1511]">
            {filteredAndSortedProducts.length}
          </span>{" "}
          {filteredAndSortedProducts.length === 1
            ? "mueble artesanal"
            : "muebles artesanales"}
          {selectedCategory ? ` en ${formatCategoryName(selectedCategory)}` : ""}
          {filterMode === "popular" ? " · Colección Más Vendidos" : ""}
          {isPriceFiltered
            ? ` · Entre ${formatCurrency(priceRange[0])} y ${formatCurrency(
                priceRange[1],
              )}`
            : ""}
          {query ? ` para "${query}"` : ""}
        </p>

        <span className="text-[0.72rem] tracking-wider text-[#a08a78] uppercase">
          Taller Mudeco · Santo Domingo Oeste
        </span>
      </div>

      {/* Cuadrícula de productos */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="rounded-2xl border border-[#e4d8cb] bg-white px-6 py-16 text-center shadow-sm">
          <p className="font-display text-2xl text-[var(--wood-950)]">
            No se encontraron muebles para esta combinación
          </p>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-md mx-auto">
            Fabricamos cualquier mueble artesanal a tus dimensiones exactas en
            nuestro taller de Santo Domingo Oeste.
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
                    ? ` con presupuesto entre ${formatCurrency(
                        priceRange[0],
                      )} y ${formatCurrency(priceRange[1])}`
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

"use client";

import type { RefObject } from "react";
import { Plus, Search } from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { IconField } from "@/components/icon-field";
import type { ProductOption } from "./quick-sale-types";

export function QuickSaleCatalog({
  query,
  setQuery,
  categories,
  filtered,
  addProduct,
  searchWrapperRef,
}: {
  query: string;
  setQuery: (q: string) => void;
  categories: string[];
  filtered: ProductOption[];
  addProduct: (p: ProductOption) => void;
  searchWrapperRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <>
      <div className="card p-4">
        <div ref={searchWrapperRef}>
        <IconField
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar mueble por nombre, SKU o categoría… (atajo: Ctrl+K)"
          icon={<Search strokeWidth={2.25} />}
        />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setQuery("")}
            className={`rounded-full border px-3 py-1 text-xs transition ${
              !query
                ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white font-medium"
                : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => setQuery("comedor")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
              query === "comedor"
                ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                : "border-[var(--brass)] bg-[#fbf7f2] text-[var(--wood-950)] hover:bg-[var(--brass)] hover:text-white"
            }`}
          >
            Más pedidos
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setQuery(c)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                query === c
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                  : "border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)] hover:text-[var(--wood-800)]"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.length === 0 ? (
          <div className="card col-span-full p-8 text-center">
            <p className="text-sm font-medium text-[var(--wood-950)]">
              No se encontraron productos para “{query}”
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="btn btn-secondary mt-3 text-xs"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          filtered.map((p) => {
          const outOfStock = p.sku !== "CUS-001" && p.stock <= 0;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => addProduct(p)}
              disabled={outOfStock}
              className={`card group p-4 text-left transition ${
                outOfStock
                  ? "cursor-not-allowed opacity-50"
                  : "hover:border-[var(--wood-700)] hover:shadow-md"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] font-semibold tracking-wider text-[var(--muted)] uppercase">
                    {p.category}
                    {p.sku ? ` · ${p.sku}` : ""}
                  </p>
                  <p className="mt-1 font-medium text-[var(--wood-950)] group-hover:text-[var(--wood-800)]">
                    {p.name}
                  </p>
                </div>
                {!outOfStock ? (
                  <Plus className="h-4 w-4 shrink-0 text-[var(--brass)] opacity-0 transition group-hover:opacity-100" />
                ) : null}
              </div>
              <div className="mt-3 flex items-end justify-between">
                <p className="font-display text-lg">
                  {p.price > 0 ? formatCurrency(p.price) : "A cotizar"}
                </p>
                <p
                  className={`text-xs ${
                    outOfStock
                      ? "font-semibold text-rose-700"
                      : p.stock <= 2
                        ? "text-amber-700"
                        : "text-[var(--muted)]"
                  }`}
                >
                  {outOfStock ? "Sin stock" : `Stock: ${p.stock}`}
                </p>
              </div>
            </button>
          );
        })
        )}
      </div>
    </>
  );
}

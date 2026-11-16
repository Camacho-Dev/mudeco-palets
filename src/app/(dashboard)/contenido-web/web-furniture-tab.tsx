"use client";

import type React from "react";
import {
  RefreshCw,
  ExternalLink,
  FolderOpen,
  Plus,
  Search,
  X,
  Package,
  Filter,
  CheckCircle2,
} from "lucide-react";
import { productImage } from "@/lib/product-image";
import type { FileUploadHandler, ProductItem } from "./web-media-types";

export function FurnitureTab({
  products,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  savingProductId,
  savedSuccessId,
  editingPrices,
  setEditingPrices,
  uploadingProductId,
  setUploadingProductId,
  setShowAddModal,
  availableCategories,
  filteredProducts,
  handleFileUpload,
  handleSavePrice,
  handleChangeProductPhoto,
  handleToggleActive,
}: {
  products: ProductItem[];
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  selectedCategory: string;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string>>;
  savingProductId: string | null;
  savedSuccessId: string | null;
  editingPrices: Record<string, string>;
  setEditingPrices: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  uploadingProductId: string | null;
  setUploadingProductId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  availableCategories: string[];
  filteredProducts: ProductItem[];
  handleFileUpload: FileUploadHandler;
  handleSavePrice: (productId: string) => Promise<void>;
  handleChangeProductPhoto: (productId: string, newUrl: string) => Promise<void>;
  handleToggleActive: (productId: string, currentActive: boolean) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      {/* Barra de filtros y búsqueda */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, categoría o SKU…"
            className="input pl-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Categoría:
          </span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input py-1 px-2.5 text-xs max-w-[200px]"
          >
            <option value="TODAS">Todas las categorías ({products.length})</option>
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cuadrícula de muebles con foto y precio */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-3 font-semibold text-foreground">
            No se encontraron muebles
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {searchQuery || selectedCategory !== "TODAS"
              ? "Intenta con otros filtros o limpia la búsqueda."
              : "Aún no tienes muebles registrados. Agrega uno nuevo para la web."}
          </p>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary mt-4 inline-flex items-center gap-2 text-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Agregar mueble ahora</span>
          </button>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p) => {
            const currentPriceVal =
              editingPrices[p.id] !== undefined
                ? editingPrices[p.id]
                : String(p.price);
            const isPriceDirty =
              editingPrices[p.id] !== undefined &&
              parseFloat(editingPrices[p.id]) !== p.price;
            const isSavingThis = savingProductId === p.id;
            const isSuccessThis = savedSuccessId === p.id;
            const isUploadingThis = uploadingProductId === p.id;
            const displayImg = productImage(p);

            return (
              <div
                key={p.id}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300 hover:shadow-md ${
                  !p.active
                    ? "border-border/60 opacity-60 bg-muted/15"
                    : "border-border hover:border-brand-gold-strong/60"
                }`}
              >
                {/* Contenedor de la foto */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={displayImg}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradiente superior sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Badges superiores */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2">
                    <span className="rounded-md bg-black/75 px-2 py-0.5 text-[0.62rem] font-bold tracking-wider text-white uppercase backdrop-blur-md border border-white/10">
                      {p.category}
                    </span>

                    <span
                      className={`rounded-md px-2 py-0.5 text-[0.62rem] font-bold uppercase backdrop-blur-md ${
                        p.active
                          ? "bg-emerald-500/85 text-white"
                          : "bg-stone-700/85 text-stone-200"
                      }`}
                    >
                      {p.active ? "En tienda" : "Oculto"}
                    </span>
                  </div>

                  {/* Botón flotante para cambiar foto */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                    <label className="btn btn-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1.5 text-[0.68rem] font-semibold text-white backdrop-blur-md hover:bg-black hover:text-brand-gold border border-white/20 shadow-sm transition">
                      <FolderOpen className="h-3.5 w-3.5 text-brand-gold" />
                      <span>
                        {isUploadingThis ? "Subiendo..." : "Cambiar foto"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploadingThis}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingProductId(p.id);
                            handleFileUpload(file, (url) => {
                              handleChangeProductPhoto(p.id, url);
                              setUploadingProductId(null);
                            });
                          }
                        }}
                      />
                    </label>

                    {p.active && (
                      <a
                        href={`/producto/${p.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg bg-black/80 p-1.5 text-white/80 hover:text-white hover:bg-black border border-white/20 backdrop-blur-md transition"
                        title="Ver en la tienda web"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>

                  {isUploadingThis && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/70 text-white z-20">
                      <RefreshCw className="h-6 w-6 animate-spin text-brand-gold" />
                    </div>
                  )}
                </div>

                {/* Ficha inferior con Nombre y PRECIO editable */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
                        {p.name}
                      </h4>
                    </div>
                    {p.sku && (
                      <p className="text-[0.65rem] font-mono text-muted-foreground mt-0.5">
                        SKU: {p.sku}
                      </p>
                    )}
                  </div>

                  {/* CAJA DE PRECIO RD$ EDITABLE */}
                  <div className="rounded-lg border border-border bg-muted/40 p-2.5 space-y-1.5">
                    <label className="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
                      <span>Precio en Tienda Web</span>
                      {isSuccessThis && (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[0.65rem]">
                          <CheckCircle2 className="h-3 w-3" />
                          Guardado
                        </span>
                      )}
                    </label>

                    <div className="flex items-center gap-1.5">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gold-strong">
                          RD$
                        </span>
                        <input
                          type="number"
                          step="1"
                          value={currentPriceVal}
                          onChange={(e) => {
                            setEditingPrices({
                              ...editingPrices,
                              [p.id]: e.target.value,
                            });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSavePrice(p.id);
                            }
                          }}
                          className="input pl-10 pr-2 py-1 text-sm font-bold text-foreground text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSavePrice(p.id)}
                        disabled={isSavingThis}
                        className={`btn text-xs px-3 py-1 font-semibold transition ${
                          isPriceDirty
                            ? "btn-primary animate-pulse"
                            : "btn-secondary text-muted-foreground"
                        }`}
                        title="Guardar precio para este mueble"
                      >
                        {isSavingThis ? (
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          "Guardar"
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Controles de estado y enlace */}
                  <div className="flex items-center justify-between pt-1 text-xs border-t border-border">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(p.id, p.active)}
                      disabled={isSavingThis}
                      className={`text-[0.68rem] font-medium transition ${
                        p.active
                          ? "text-muted-foreground hover:text-red-600"
                          : "text-brand-gold-strong hover:underline font-semibold"
                      }`}
                    >
                      {p.active ? "Ocultar de la web" : "Mostrar en la web"}
                    </button>

                    <a
                      href={`/productos/${p.id}`}
                      className="text-[0.68rem] font-medium text-muted-foreground hover:text-foreground underline"
                    >
                      Ficha completa
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

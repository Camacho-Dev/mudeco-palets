"use client";

import { useState, useMemo } from "react";
import {
  Upload,
  RefreshCw,
  Check,
  ExternalLink,
  Eye,
  Sparkles,
  Layers,
  Camera,
  FolderOpen,
  Plus,
  Search,
  X,
  Package,
  Filter,
  CheckCircle2,
} from "lucide-react";
import {
  updateWebMedia,
  updateProductQuick,
  createProductQuick,
} from "./actions";
import { productImage } from "@/lib/product-image";
import { STORE_CATEGORIES } from "@/lib/store-brand";

interface ProductItem {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  description: string | null;
}

interface WebMediaManagerProps {
  initialData: {
    heroImage: string;
    heroBadge: string;
    heroTitle: string;
    heroSubtitle: string;
    workshopImage: string;
    craftImage: string;
    promoMesaImage: string;
    promoTvImage: string;
    galleryImages: string[];
  };
  initialProducts?: ProductItem[];
}

export function WebMediaManager({
  initialData,
  initialProducts = [],
}: WebMediaManagerProps) {
  const [activeTab, setActiveTab] = useState<"furniture" | "hero" | "gallery">(
    "furniture",
  );

  // Estados de Portadas y Galería
  const [formData, setFormData] = useState(initialData);
  const [savingMedia, setSavingMedia] = useState(false);
  const [mediaSavedSuccess, setMediaSavedSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  function showNotice(type: "error" | "success", message: string) {
    setFeedbackNotice({ type, message });
    setTimeout(() => setFeedbackNotice(null), 5000);
  }

  // Estados de Muebles / Catálogo Web
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("TODAS");
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);
  const [editingPrices, setEditingPrices] = useState<Record<string, string>>({});
  const [uploadingProductId, setUploadingProductId] = useState<string | null>(null);

  // Modal para agregar nuevo mueble
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  const [newProductCategory, setNewProductCategory] = useState("MESA DE CENTRO");
  const [newProductPrice, setNewProductPrice] = useState("");
  const [newProductImageUrl, setNewProductImageUrl] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Categorías combinadas para filtros
  const availableCategories = useMemo(() => {
    const catsFromProducts = products.map((p) => p.category);
    const set = new Set([...catsFromProducts, ...STORE_CATEGORIES]);
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, "es"));
  }, [products]);

  // Filtrado de muebles
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q));
      const matchCat =
        selectedCategory === "TODAS" ||
        p.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchQuery && matchCat;
    });
  }, [products, searchQuery, selectedCategory]);

  // Subida de imagen genérica
  async function handleFileUpload(file: File, onDone: (url: string) => void) {
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        showNotice("error", json.error || "Error al subir la imagen");
        return;
      }

      onDone(json.url);
    } catch {
      showNotice("error", "Error de conexión al subir la imagen");
    }
  }

  // Guardar portada / banners / galería
  async function handleSaveMedia(e: React.FormEvent) {
    e.preventDefault();
    setSavingMedia(true);
    setMediaSavedSuccess(false);

    try {
      await updateWebMedia({
        heroImage: formData.heroImage,
        heroBadge: formData.heroBadge,
        heroTitle: formData.heroTitle,
        heroSubtitle: formData.heroSubtitle,
        workshopImage: formData.workshopImage,
        craftImage: formData.craftImage,
        promoMesaImage: formData.promoMesaImage,
        promoTvImage: formData.promoTvImage,
        galleryImages: formData.galleryImages,
      });

      setMediaSavedSuccess(true);
      setTimeout(() => setMediaSavedSuccess(false), 3500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Intente nuevamente";
      showNotice("error", "Error al guardar: " + msg);
    } finally {
      setSavingMedia(false);
    }
  }

  // Guardar cambio de precio de un mueble
  async function handleSavePrice(productId: string) {
    const priceStr = editingPrices[productId];
    if (priceStr === undefined) return;
    const priceNum = parseFloat(priceStr);
    if (isNaN(priceNum) || priceNum < 0) {
      showNotice("error", "Ingresa un precio válido mayor o igual a 0");
      return;
    }

    setSavingProductId(productId);
    try {
      const res = await updateProductQuick({
        id: productId,
        price: priceNum,
      });

      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, price: priceNum } : p)),
        );
        setSavedSuccessId(productId);
        setTimeout(() => setSavedSuccessId(null), 2500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      showNotice("error", "Error al guardar precio: " + msg);
    } finally {
      setSavingProductId(null);
    }
  }

  // Cambiar foto de un mueble directamente
  async function handleChangeProductPhoto(productId: string, newUrl: string) {
    setSavingProductId(productId);
    try {
      const res = await updateProductQuick({
        id: productId,
        imageUrl: newUrl,
      });

      if (res.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, imageUrl: newUrl } : p)),
        );
        setSavedSuccessId(productId);
        setTimeout(() => setSavedSuccessId(null), 2500);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      showNotice("error", "Error al actualizar foto: " + msg);
    } finally {
      setSavingProductId(null);
    }
  }

  // Alternar visibilidad en la tienda web
  async function handleToggleActive(productId: string, currentActive: boolean) {
    setSavingProductId(productId);
    try {
      const res = await updateProductQuick({
        id: productId,
        active: !currentActive,
      });

      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId ? { ...p, active: !currentActive } : p,
          ),
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      showNotice("error", "Error al cambiar estado: " + msg);
    } finally {
      setSavingProductId(null);
    }
  }

  // Crear nuevo mueble rápido
  async function handleCreateNewProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!newProductName.trim()) {
      showNotice("error", "Por favor ingresa el nombre del mueble");
      return;
    }
    const priceNum = parseFloat(newProductPrice);
    if (isNaN(priceNum) || priceNum < 0) {
      showNotice("error", "Por favor ingresa un precio válido");
      return;
    }

    setCreatingProduct(true);
    try {
      const res = await createProductQuick({
        name: newProductName,
        category: newProductCategory,
        price: priceNum,
        imageUrl: newProductImageUrl || undefined,
        description: newProductDescription || undefined,
      });

      if (res.success && res.product) {
        setProducts((prev) => [res.product as ProductItem, ...prev]);
        setShowAddModal(false);
        setNewProductName("");
        setNewProductPrice("");
        setNewProductImageUrl("");
        setNewProductDescription("");
        showNotice("success", "¡Mueble agregado con éxito a la tienda web!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error inesperado";
      showNotice("error", "Error al agregar mueble: " + msg);
    } finally {
      setCreatingProduct(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Selector de pestañas profesional */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("furniture")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "furniture"
                ? "bg-[#b0894f] text-[#2c1d14] shadow-md shadow-[#b0894f]/20 scale-102"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Muebles de la Web (Fotos y Precios)</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                activeTab === "furniture"
                  ? "bg-[#2c1d14]/20 text-[#2c1d14]"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("hero")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "hero"
                ? "bg-[#b0894f] text-[#2c1d14] shadow-md shadow-[#b0894f]/20 scale-102"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Portadas y Banners</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === "gallery"
                ? "bg-[#b0894f] text-[#2c1d14] shadow-md shadow-[#b0894f]/20 scale-102"
                : "bg-card text-muted-foreground hover:bg-muted hover:text-foreground border border-border"
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Galería del Pie ({formData.galleryImages.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "furniture" ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="btn btn-primary inline-flex items-center gap-2 text-xs shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Agregar nuevo mueble con foto</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSaveMedia}
              disabled={savingMedia}
              className="btn btn-primary inline-flex items-center gap-2 text-xs"
            >
              {savingMedia ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : mediaSavedSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Guardado con éxito</span>
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  <span>Guardar cambios de fotos</span>
                </>
              )}
            </button>
          )}

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline inline-flex items-center gap-1.5 text-xs"
            title="Abrir tienda pública"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver tienda</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>
        </div>
      </div>

      {feedbackNotice && (
        <div
          className={`flex items-center justify-between gap-3 rounded-xl border p-3.5 text-xs font-medium ${
            feedbackNotice.type === "error"
              ? "border-rose-300 bg-rose-50 text-rose-800"
              : "border-emerald-300 bg-emerald-50 text-emerald-800"
          }`}
        >
          <span>{feedbackNotice.message}</span>
          <button
            type="button"
            onClick={() => setFeedbackNotice(null)}
            className="opacity-70 hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {mediaSavedSuccess && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Las fotos y textos de las portadas se han actualizado y publicado con éxito en la tienda online.
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 1: MUEBLES DE LA WEB (FOTOS Y PRECIOS) */}
      {/* ========================================================================= */}
      {activeTab === "furniture" && (
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
                        : "border-border hover:border-[#b0894f]/60"
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
                        <label className="btn btn-secondary inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-black/80 px-2.5 py-1.5 text-[0.68rem] font-semibold text-white backdrop-blur-md hover:bg-black hover:text-[#c9a15a] border border-white/20 shadow-sm transition">
                          <FolderOpen className="h-3.5 w-3.5 text-[#c9a15a]" />
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
                          <RefreshCw className="h-6 w-6 animate-spin text-[#c9a15a]" />
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
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#b0894f]">
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
                              : "text-[#b0894f] hover:underline font-semibold"
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
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: PORTADAS Y BANNERS PRINCIPALES */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <form onSubmit={handleSaveMedia} className="space-y-8">
          {/* SECCIÓN 1: Hero Principal */}
          <div className="card space-y-6 p-6">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  1. Portada Principal (Hero Banner)
                </h3>
                <p className="text-xs text-muted-foreground">
                  La imagen de fondo principal que ven los clientes al entrar a la tienda
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-12">
              <div className="lg:col-span-6 space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Vista previa actual
                </label>
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.heroImage}
                    alt="Hero preview"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 flex flex-col justify-end text-white">
                    <span className="text-[0.6rem] font-bold tracking-widest text-[#c9a15a] uppercase">
                      {formData.heroBadge}
                    </span>
                    <p className="font-serif text-lg font-bold leading-tight mt-1">
                      {formData.heroTitle}
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div>
                  <label className="label" htmlFor="heroImage">
                    URL de la Imagen de Fondo
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="heroImage"
                      value={formData.heroImage}
                      onChange={(e) =>
                        setFormData({ ...formData, heroImage: e.target.value })
                      }
                      className="input flex-1 text-xs"
                      placeholder="/brand/store-hero.jpg o URL externa https://..."
                    />
                    <label className="btn btn-outline inline-flex cursor-pointer items-center gap-1.5 text-xs shrink-0">
                      <FolderOpen className="h-3.5 w-3.5" />
                      <span>Subir</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploadingField("heroImage");
                            handleFileUpload(file, (url) => {
                              setFormData((prev) => ({ ...prev, heroImage: url }));
                              setUploadingField(null);
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                  {uploadingField === "heroImage" && (
                    <p className="mt-1 text-xs text-amber-500 animate-pulse">
                      Subiendo archivo al servidor...
                    </p>
                  )}
                </div>

                <div>
                  <label className="label" htmlFor="heroBadge">
                    Insignia del Hero
                  </label>
                  <input
                    id="heroBadge"
                    value={formData.heroBadge}
                    onChange={(e) =>
                      setFormData({ ...formData, heroBadge: e.target.value })
                    }
                    className="input text-xs"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="heroTitle">
                    Título Principal
                  </label>
                  <input
                    id="heroTitle"
                    value={formData.heroTitle}
                    onChange={(e) =>
                      setFormData({ ...formData, heroTitle: e.target.value })
                    }
                    className="input text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="label" htmlFor="heroSubtitle">
                    Párrafo Descriptivo
                  </label>
                  <textarea
                    id="heroSubtitle"
                    rows={2}
                    value={formData.heroSubtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, heroSubtitle: e.target.value })
                    }
                    className="input text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Fotos de Bloques Promocionales y Estilos */}
          <div className="card space-y-6 p-6">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Layers className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  2. Fotos de Bloques Promocionales en la Portada
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tarjetas destacadas de &ldquo;Explora por estilo&rdquo; en la página principal
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Foto Mesas */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <span className="text-xs font-semibold text-foreground">
                  Tarjeta &ldquo;Colección rústica / Comedores y Mesas&rdquo;
                </span>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.promoMesaImage}
                    alt="Promo mesa preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    value={formData.promoMesaImage}
                    onChange={(e) =>
                      setFormData({ ...formData, promoMesaImage: e.target.value })
                    }
                    className="input flex-1 text-xs"
                  />
                  <label className="btn btn-outline inline-flex cursor-pointer items-center gap-1 text-xs">
                    <FolderOpen className="h-3 w-3" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingField("promoMesa");
                          handleFileUpload(file, (url) => {
                            setFormData((prev) => ({ ...prev, promoMesaImage: url }));
                            setUploadingField(null);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Foto Centros TV */}
              <div className="space-y-3 rounded-lg border border-border p-4">
                <span className="text-xs font-semibold text-foreground">
                  Tarjeta &ldquo;Centros de TV y Entretenimiento&rdquo;
                </span>
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={formData.promoTvImage}
                    alt="Promo TV preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <input
                    value={formData.promoTvImage}
                    onChange={(e) =>
                      setFormData({ ...formData, promoTvImage: e.target.value })
                    }
                    className="input flex-1 text-xs"
                  />
                  <label className="btn btn-outline inline-flex cursor-pointer items-center gap-1 text-xs">
                    <FolderOpen className="h-3 w-3" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingField("promoTv");
                          handleFileUpload(file, (url) => {
                            setFormData((prev) => ({ ...prev, promoTvImage: url }));
                            setUploadingField(null);
                          });
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingMedia}
              className="btn btn-primary inline-flex items-center gap-2 text-xs"
            >
              {savingMedia ? "Guardando..." : "Guardar cambios de portadas"}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: GALERÍA DE FOTOS (PIE DE PÁGINA) */}
      {/* ========================================================================= */}
      {activeTab === "gallery" && (
        <form onSubmit={handleSaveMedia} className="space-y-6">
          <div className="card space-y-6 p-6">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Camera className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Galería del Taller (8 fotos del pie de página)
                </h3>
                <p className="text-xs text-muted-foreground">
                  Estas 8 fotos aparecen en la cuadrícula inferior de la tienda pública como muestra de proyectos artesanales
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {formData.galleryImages.map((src, idx) => (
                <div
                  key={idx}
                  className="space-y-2 rounded-lg border border-border bg-muted/30 p-2.5"
                >
                  <div className="flex items-center justify-between text-[0.65rem] font-semibold text-muted-foreground uppercase">
                    <span>Foto #{idx + 1}</span>
                  </div>
                  <div className="relative aspect-square w-full overflow-hidden rounded border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`Galería ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex gap-1">
                    <input
                      value={src}
                      onChange={(e) => {
                        const next = [...formData.galleryImages];
                        next[idx] = e.target.value;
                        setFormData({ ...formData, galleryImages: next });
                      }}
                      className="input flex-1 px-1.5 py-1 text-[0.65rem]"
                      placeholder="URL..."
                    />
                    <label
                      className="btn btn-outline inline-flex cursor-pointer items-center p-1.5"
                      title="Subir archivo"
                    >
                      <FolderOpen className="h-3 w-3" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleFileUpload(file, (url) => {
                              const next = [...formData.galleryImages];
                              next[idx] = url;
                              setFormData({ ...formData, galleryImages: next });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={savingMedia}
                className="btn btn-primary inline-flex items-center gap-2 text-xs"
              >
                {savingMedia ? "Guardando..." : "Guardar fotos de galería"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR NUEVO MUEBLE A LA WEB */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-semibold text-foreground text-base">
                  Agregar Nuevo Mueble a la Tienda Web
                </h3>
                <p className="text-xs text-muted-foreground">
                  Asigna la fotografía real y el precio que verá el cliente
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewProduct} className="space-y-4">
              <div>
                <label className="label">Nombre del Mueble *</label>
                <input
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Ej. Mesa de Comedor Rústica 6 Puestos"
                  className="input text-xs"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Categoría *</label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value)}
                    className="input text-xs"
                  >
                    {availableCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">Precio (RD$) *</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#b0894f]">
                      RD$
                    </span>
                    <input
                      required
                      type="number"
                      step="1"
                      min="0"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="Ej. 14500"
                      className="input pl-10 text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Subir foto del nuevo mueble */}
              <div className="space-y-2">
                <label className="label">Fotografía del Mueble</label>
                <div className="flex gap-2">
                  <input
                    value={newProductImageUrl}
                    onChange={(e) => setNewProductImageUrl(e.target.value)}
                    placeholder="URL de imagen o sube un archivo"
                    className="input flex-1 text-xs"
                  />
                  <label className="btn btn-outline inline-flex cursor-pointer items-center gap-1.5 text-xs shrink-0">
                    <FolderOpen className="h-3.5 w-3.5 text-[#b0894f]" />
                    <span>Subir foto</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (url) => {
                            setNewProductImageUrl(url);
                          });
                        }
                      }}
                    />
                  </label>
                </div>

                {newProductImageUrl && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-border bg-muted mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={newProductImageUrl}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="label">Descripción breve (opcional)</label>
                <textarea
                  rows={2}
                  value={newProductDescription}
                  onChange={(e) => setNewProductDescription(e.target.value)}
                  placeholder="Detalles de la madera, dimensiones o características…"
                  className="input text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn btn-outline text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="btn btn-primary inline-flex items-center gap-2 text-xs"
                >
                  {creatingProduct ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Publicar mueble en la web</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

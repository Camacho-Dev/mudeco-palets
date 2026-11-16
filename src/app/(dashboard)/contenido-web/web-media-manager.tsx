"use client";

import { useState, useMemo } from "react";
import {
  Upload,
  RefreshCw,
  Check,
  ExternalLink,
  Eye,
  Sparkles,
  Camera,
  Plus,
  X,
  Package,
} from "lucide-react";
import {
  updateWebMedia,
  updateProductQuick,
  createProductQuick,
} from "./actions";
import { STORE_CATEGORIES } from "@/lib/store-brand";
import type { ProductItem, WebMediaData } from "./web-media-types";
import { FurnitureTab } from "./web-furniture-tab";
import { HeroTab } from "./web-hero-tab";
import { GalleryTab } from "./web-gallery-tab";
import { AddProductModal } from "./web-add-product-modal";

interface WebMediaManagerProps {
  initialData: WebMediaData;
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
                ? "bg-brand-gold-strong text-[#2c1d14] shadow-md shadow-brand-gold-strong/20 scale-102"
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
                ? "bg-brand-gold-strong text-[#2c1d14] shadow-md shadow-brand-gold-strong/20 scale-102"
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
                ? "bg-brand-gold-strong text-[#2c1d14] shadow-md shadow-brand-gold-strong/20 scale-102"
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
        <FurnitureTab
          products={products}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          savingProductId={savingProductId}
          savedSuccessId={savedSuccessId}
          editingPrices={editingPrices}
          setEditingPrices={setEditingPrices}
          uploadingProductId={uploadingProductId}
          setUploadingProductId={setUploadingProductId}
          setShowAddModal={setShowAddModal}
          availableCategories={availableCategories}
          filteredProducts={filteredProducts}
          handleFileUpload={handleFileUpload}
          handleSavePrice={handleSavePrice}
          handleChangeProductPhoto={handleChangeProductPhoto}
          handleToggleActive={handleToggleActive}
        />
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: PORTADAS Y BANNERS PRINCIPALES */}
      {/* ========================================================================= */}
      {activeTab === "hero" && (
        <HeroTab
          formData={formData}
          setFormData={setFormData}
          savingMedia={savingMedia}
          uploadingField={uploadingField}
          setUploadingField={setUploadingField}
          handleFileUpload={handleFileUpload}
          handleSaveMedia={handleSaveMedia}
        />
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 3: GALERÍA DE FOTOS (PIE DE PÁGINA) */}
      {/* ========================================================================= */}
      {activeTab === "gallery" && (
        <GalleryTab
          formData={formData}
          setFormData={setFormData}
          savingMedia={savingMedia}
          handleFileUpload={handleFileUpload}
          handleSaveMedia={handleSaveMedia}
        />
      )}

      {/* ========================================================================= */}
      {/* MODAL: AGREGAR NUEVO MUEBLE A LA WEB */}
      {/* ========================================================================= */}
      {showAddModal && (
        <AddProductModal
          setShowAddModal={setShowAddModal}
          newProductName={newProductName}
          setNewProductName={setNewProductName}
          newProductCategory={newProductCategory}
          setNewProductCategory={setNewProductCategory}
          newProductPrice={newProductPrice}
          setNewProductPrice={setNewProductPrice}
          newProductImageUrl={newProductImageUrl}
          setNewProductImageUrl={setNewProductImageUrl}
          newProductDescription={newProductDescription}
          setNewProductDescription={setNewProductDescription}
          creatingProduct={creatingProduct}
          availableCategories={availableCategories}
          handleFileUpload={handleFileUpload}
          handleCreateNewProduct={handleCreateNewProduct}
        />
      )}
    </div>
  );
}

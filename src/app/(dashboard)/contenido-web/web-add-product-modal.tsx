"use client";

import type React from "react";
import {
  RefreshCw,
  FolderOpen,
  Plus,
  X,
} from "lucide-react";
import type { FileUploadHandler } from "./web-media-types";

export function AddProductModal({
  setShowAddModal,
  newProductName,
  setNewProductName,
  newProductCategory,
  setNewProductCategory,
  newProductPrice,
  setNewProductPrice,
  newProductImageUrl,
  setNewProductImageUrl,
  newProductDescription,
  setNewProductDescription,
  creatingProduct,
  availableCategories,
  handleFileUpload,
  handleCreateNewProduct,
}: {
  setShowAddModal: React.Dispatch<React.SetStateAction<boolean>>;
  newProductName: string;
  setNewProductName: React.Dispatch<React.SetStateAction<string>>;
  newProductCategory: string;
  setNewProductCategory: React.Dispatch<React.SetStateAction<string>>;
  newProductPrice: string;
  setNewProductPrice: React.Dispatch<React.SetStateAction<string>>;
  newProductImageUrl: string;
  setNewProductImageUrl: React.Dispatch<React.SetStateAction<string>>;
  newProductDescription: string;
  setNewProductDescription: React.Dispatch<React.SetStateAction<string>>;
  creatingProduct: boolean;
  availableCategories: string[];
  handleFileUpload: FileUploadHandler;
  handleCreateNewProduct: (e: React.FormEvent) => Promise<void>;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-product-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      onClick={() => setShowAddModal(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 id="add-product-modal-title" className="font-semibold text-foreground text-base">
              Agregar Nuevo Mueble a la Tienda Web
            </h3>
            <p className="text-xs text-muted-foreground">
              Asigna la fotografía real y el precio que verá el cliente
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(false)}
            aria-label="Cerrar modal"
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-brand-gold-strong">
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
                <FolderOpen className="h-3.5 w-3.5 text-brand-gold-strong" />
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
  );
}

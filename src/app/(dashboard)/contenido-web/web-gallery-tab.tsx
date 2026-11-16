"use client";

import type React from "react";
import {
  Camera,
  FolderOpen,
} from "lucide-react";
import type { FileUploadHandler, WebMediaData } from "./web-media-types";

export function GalleryTab({
  formData,
  setFormData,
  savingMedia,
  handleFileUpload,
  handleSaveMedia,
}: {
  formData: WebMediaData;
  setFormData: React.Dispatch<React.SetStateAction<WebMediaData>>;
  savingMedia: boolean;
  handleFileUpload: FileUploadHandler;
  handleSaveMedia: (e: React.FormEvent) => Promise<void>;
}) {
  return (
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
  );
}

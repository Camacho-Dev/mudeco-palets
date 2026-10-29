"use client";

import { useState } from "react";
import { FolderOpen, X, RefreshCw } from "lucide-react";

export function ProductImageInput({
  defaultValue = "",
  category = "Muebles",
}: {
  defaultValue?: string | null;
  category?: string;
}) {
  const [url, setUrl] = useState(defaultValue || "");
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        alert(json.error || "Error al subir la imagen");
        return;
      }

      setUrl(json.url);
    } catch {
      alert("Error de conexión al subir la imagen");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="label mb-0" htmlFor="imageUrl">
          Fotografía real del mueble (para la tienda web)
        </label>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="inline-flex items-center gap-1 text-[0.68rem] text-red-600 hover:underline"
          >
            <X className="h-3 w-3" />
            <span>Quitar foto</span>
          </button>
        ) : null}
      </div>

      <input type="hidden" name="imageUrl" value={url} />

      <div className="flex flex-col sm:flex-row gap-4 items-start">
        {/* Preview box */}
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[#fbf7f2] shadow-inner">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt="Vista previa"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-[0.62rem] text-[var(--muted)]">
              <span>Sin foto</span>
              <span className="text-[0.55rem] opacity-75">(Usa imagen de {category})</span>
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white">
              <RefreshCw className="h-5 w-5 animate-spin text-[#c9a15a]" />
            </div>
          )}
        </div>

        {/* Inputs */}
        <div className="flex-1 w-full space-y-2">
          <div className="flex gap-2">
            <input
              id="imageUrl"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="input flex-1 text-xs"
              placeholder="/brand/cat-mesa.jpg o https://…"
            />
            <label className="btn btn-outline inline-flex cursor-pointer items-center gap-1.5 text-xs shrink-0">
              <FolderOpen className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>{uploading ? "Subiendo..." : "Subir archivo"}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />
            </label>
          </div>
          <p className="text-[0.7rem] text-[var(--muted)] leading-tight">
            Sube una foto desde tu equipo (JPG, PNG o WebP hasta 10 MB) o pega una URL existente. Esta foto se mostrará en el catálogo y ficha del mueble en la tienda online.
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  Upload,
  RefreshCw,
  Check,
  ExternalLink,
  Eye,
  ImageIcon,
  Sparkles,
  Layers,
  Camera,
  FolderOpen,
} from "lucide-react";
import type { Transformation } from "@/components/store/before-after-slider";
import { updateWebMedia } from "./actions";

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
    beforeAfterItems?: Transformation[];
  };
}

export function WebMediaManager({ initialData }: WebMediaManagerProps) {
  const [formData, setFormData] = useState(initialData);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

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
        alert(json.error || "Error al subir la imagen");
        return;
      }

      onDone(json.url);
    } catch {
      alert("Error de conexión al subir la imagen");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

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
        beforeAfterJson: JSON.stringify(formData.beforeAfterItems || []),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      alert("Error al guardar: " + (err.message || "Intente nuevamente"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Barra de acción superior fija o destacada */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground">
            Gestor de Imágenes y Contenido de la Tienda
          </h2>
          <p className="text-xs text-muted-foreground">
            Los cambios guardados aquí se reflejan de inmediato en la tienda pública
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline inline-flex items-center gap-2 text-xs"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver tienda pública</span>
            <ExternalLink className="h-3 w-3 opacity-60" />
          </a>

          <button
            type="submit"
            disabled={saving}
            className="btn btn-primary inline-flex items-center gap-2 text-xs"
          >
            {saving ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : savedSuccess ? (
              <>
                <Check className="h-3.5 w-3.5 text-white" />
                <span>Cambios guardados</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Guardar fotos en la web</span>
              </>
            )}
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          Las fotos y textos de la tienda web se han actualizado y publicado con éxito.
        </div>
      )}

      {/* SECCIÓN 1: Hero Principal */}
      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">1. Portada Principal (Hero Banner)</h3>
            <p className="text-xs text-muted-foreground">
              La imagen principal que ven los clientes al entrar al sitio web
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Vista previa en vivo */}
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

          {/* Controles de edición */}
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
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, heroImage: "/brand/store-hero.jpg" })
                  }
                  className="btn btn-outline text-xs text-muted-foreground"
                  title="Restablecer original"
                >
                  Reset
                </button>
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

      {/* SECCIÓN 2: Fotos de Taller y Ebanistería */}
      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <ImageIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">2. Fotos del Taller y Proceso Artesanal</h3>
            <p className="text-xs text-muted-foreground">
              Utilizadas en la sección de reparaciones, antes y después y página nosotros
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Foto Taller */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <span className="text-xs font-semibold text-foreground">
              Foto de Reparaciones / Madera en Bruto (Taller)
            </span>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.workshopImage}
                alt="Workshop preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={formData.workshopImage}
                onChange={(e) =>
                  setFormData({ ...formData, workshopImage: e.target.value })
                }
                className="input flex-1 text-xs"
                placeholder="Ruta o URL"
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
                      setUploadingField("workshopImage");
                      handleFileUpload(file, (url) => {
                        setFormData((prev) => ({ ...prev, workshopImage: url }));
                        setUploadingField(null);
                      });
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    workshopImage: "/brand/store-workshop.jpg",
                  })
                }
                className="btn btn-outline text-xs text-muted-foreground"
              >
                Reset
              </button>
            </div>
            {uploadingField === "workshopImage" && (
              <p className="text-xs text-amber-500 animate-pulse">Subiendo...</p>
            )}
          </div>

          {/* Foto Ebanistería */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <span className="text-xs font-semibold text-foreground">
              Foto de Madera Curada / Oficio Artesanal
            </span>
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.craftImage}
                alt="Craft preview"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex gap-2">
              <input
                value={formData.craftImage}
                onChange={(e) =>
                  setFormData({ ...formData, craftImage: e.target.value })
                }
                className="input flex-1 text-xs"
                placeholder="Ruta o URL"
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
                      setUploadingField("craftImage");
                      handleFileUpload(file, (url) => {
                        setFormData((prev) => ({ ...prev, craftImage: url }));
                        setUploadingField(null);
                      });
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    craftImage: "/brand/store-craft.jpg",
                  })
                }
                className="btn btn-outline text-xs text-muted-foreground"
              >
                Reset
              </button>
            </div>
            {uploadingField === "craftImage" && (
              <p className="text-xs text-amber-500 animate-pulse">Subiendo...</p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: Fotos de Estilos y Categorías */}
      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Layers className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">3. Fotos de Bloques Promocionales y Estilos</h3>
            <p className="text-xs text-muted-foreground">
              Tarjetas destacadas de "Explora por estilo" en la página principal
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Foto Mesas */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <span className="text-xs font-semibold text-foreground">
              Tarjeta "Colección rústica / Comedores y Mesas"
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
              Tarjeta "Centros de TV y Entretenimiento"
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

      {/* SECCIÓN 4: Galería de Fotos del Taller (8 fotos) */}
      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Camera className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">4. Galería del Taller (Cuadrícula de la Tienda)</h3>
            <p className="text-xs text-muted-foreground">
              Las 8 imágenes que se muestran en el pie de página de la tienda como muestra de proyectos
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
                <label className="btn btn-outline inline-flex cursor-pointer items-center p-1.5" title="Subir archivo">
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
      </div>

      {/* SECCIÓN 5: Transformaciones Antes y Después (Slider Interactivo) */}
      <div className="card space-y-6 p-6">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              5. Transformaciones Antes y Después (Slider Interactivo)
            </h3>
            <p className="text-xs text-muted-foreground">
              Compara fotos de madera en bruto vs el acabado final de ebanistería en la página principal
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {(formData.beforeAfterItems || []).map((item, idx) => (
            <div
              key={item.id || idx}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
                <span className="text-xs font-bold text-[var(--wood-900)] tracking-wider uppercase">
                  Pestaña #{idx + 1}: {item.title}
                </span>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-muted px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground uppercase">
                    ID: {item.id}
                  </span>
                  {(formData.beforeAfterItems || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = (formData.beforeAfterItems || []).filter(
                          (_, i) => i !== idx,
                        );
                        setFormData({ ...formData, beforeAfterItems: next });
                      }}
                      className="text-[0.68rem] text-red-600 hover:underline font-medium"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Título de la Pieza</label>
                  <input
                    value={item.title}
                    onChange={(e) => {
                      const next = [...(formData.beforeAfterItems || [])];
                      next[idx] = { ...next[idx], title: e.target.value };
                      setFormData({ ...formData, beforeAfterItems: next });
                    }}
                    className="input text-xs"
                    placeholder="Ej. Mesa de centro rústica"
                  />
                </div>
                <div>
                  <label className="label">Categoría / Tipo de trabajo</label>
                  <input
                    value={item.category}
                    onChange={(e) => {
                      const next = [...(formData.beforeAfterItems || [])];
                      next[idx] = { ...next[idx], category: e.target.value };
                      setFormData({ ...formData, beforeAfterItems: next });
                    }}
                    className="input text-xs"
                    placeholder="Ej. Restauración artesanal"
                  />
                </div>
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => {
                    const next = [...(formData.beforeAfterItems || [])];
                    next[idx] = { ...next[idx], description: e.target.value };
                    setFormData({ ...formData, beforeAfterItems: next });
                  }}
                  className="input text-xs"
                  placeholder="Detalles sobre el proceso de fabricación o restauración…"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Foto ANTES */}
                <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Foto ANTES (Madera en bruto)
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.beforeImg}
                      alt={item.beforeLabel}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={item.beforeImg}
                      onChange={(e) => {
                        const next = [...(formData.beforeAfterItems || [])];
                        next[idx] = { ...next[idx], beforeImg: e.target.value };
                        setFormData({ ...formData, beforeAfterItems: next });
                      }}
                      className="input flex-1 text-xs"
                      placeholder="URL o ruta"
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
                            handleFileUpload(file, (url) => {
                              const next = [...(formData.beforeAfterItems || [])];
                              next[idx] = { ...next[idx], beforeImg: url };
                              setFormData({ ...formData, beforeAfterItems: next });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Foto DESPUÉS */}
                <div className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground uppercase">
                      Foto DESPUÉS (Mueble terminado)
                    </span>
                  </div>
                  <div className="relative aspect-[16/10] w-full overflow-hidden rounded border border-border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.afterImg}
                      alt={item.afterLabel}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex gap-1.5">
                    <input
                      value={item.afterImg}
                      onChange={(e) => {
                        const next = [...(formData.beforeAfterItems || [])];
                        next[idx] = { ...next[idx], afterImg: e.target.value };
                        setFormData({ ...formData, beforeAfterItems: next });
                      }}
                      className="input flex-1 text-xs"
                      placeholder="URL o ruta"
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
                            handleFileUpload(file, (url) => {
                              const next = [...(formData.beforeAfterItems || [])];
                              next[idx] = { ...next[idx], afterImg: url };
                              setFormData({ ...formData, beforeAfterItems: next });
                            });
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => {
                const count = (formData.beforeAfterItems || []).length + 1;
                const id = `item_${Date.now()}`;
                const next = [
                  ...(formData.beforeAfterItems || []),
                  {
                    id,
                    title: `Proyecto artesanal #${count}`,
                    category: "Fabricación a medida",
                    description: "Madera de pino recuperada curada y tratada artesanalmente.",
                    beforeImg: "/brand/store-workshop.jpg",
                    afterImg: "/brand/cat-mesa.jpg",
                    beforeLabel: "Antes · En bruto",
                    afterLabel: "Después · Acabado fino",
                  },
                ];
                setFormData({ ...formData, beforeAfterItems: next });
              }}
              className="btn btn-outline text-xs inline-flex items-center gap-1.5"
            >
              <span>+ Agregar nueva transformación</span>
            </button>
          </div>
        </div>
      </div>

      {/* Botón de guardado inferior */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Publicar cambios en la web</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

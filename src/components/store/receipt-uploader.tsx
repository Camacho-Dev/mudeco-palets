"use client";

import { useState, useRef, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { OrderReceipt } from "@/lib/order-receipt";
import { uploadOrderReceiptAction } from "@/app/(store)/pedido/[id]/actions";
import {
  UploadCloud,
  FileCheck2,
  FileText,
  Eye,
  RefreshCw,
  MessageCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Building,
  X,
  ShieldCheck,
} from "lucide-react";

interface ReceiptUploaderProps {
  orderId: string;
  orderNumber: string;
  totalFormatted: string;
  initialReceipt: OrderReceipt | null;
  whatsAppUrl: string;
}

export function ReceiptUploader({
  orderId,
  orderNumber,
  totalFormatted,
  initialReceipt,
  whatsAppUrl,
}: ReceiptUploaderProps) {
  const router = useRouter();
  const [receipt, setReceipt] = useState<OrderReceipt | null>(initialReceipt);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [showReplace, setShowReplace] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  function handleFile(file: File) {
    setError(null);
    if (!file) return;

    const mime = file.type || "";
    const isImage = mime.startsWith("image/");
    const isPdf = mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isImage && !isPdf) {
      setError("Solo se permiten imágenes (JPG, PNG, WebP) o documentos PDF.");
      return;
    }

    if (file.size > 4.5 * 1024 * 1024) {
      setError("El archivo supera el límite permitido de 4.5 MB.");
      return;
    }

    setSelectedFile(file);
    if (isImage) {
      const objectUrl = URL.createObjectURL(file);
      setLocalPreview(objectUrl);
    } else {
      setLocalPreview(null);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function onUploadSubmit() {
    if (!selectedFile) return;
    setError(null);

    const formData = new FormData();
    formData.append("receipt", selectedFile);

    startTransition(async () => {
      const res = await uploadOrderReceiptAction(orderId, formData);
      if (res.success && res.receipt) {
        setReceipt(res.receipt);
        setSelectedFile(null);
        setLocalPreview(null);
        setShowReplace(false);
        router.refresh();
      } else {
        setError(res.error || "No se pudo subir el comprobante. Intenta nuevamente.");
      }
    });
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isReceiptPdf =
    receipt?.mimeType === "application/pdf" || receipt?.name?.toLowerCase().endsWith(".pdf");

  function openReceiptInNewTab(url: string) {
    if (!url.startsWith("data:")) {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const [header, base64] = url.split(",");
      const mimeMatch = header.match(/data:([^;]+);base64/);
      const mime = mimeMatch ? mimeMatch[1] : "application/octet-stream";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    } catch {
      setShowModal(true);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg sm:p-8">
      {/* Resplandor decorativo */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

      <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
              <FileCheck2 className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl tracking-tight">
              Adjuntar Comprobante de Transferencia
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Sube el comprobante bancario para validar tu pago de{" "}
            <span className="font-bold text-slate-900 font-mono">{totalFormatted}</span> del pedido{" "}
            <span className="font-mono font-bold text-slate-900">{orderNumber}</span> e iniciar la producción
          </p>
        </div>

        {receipt && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-800 border border-amber-300 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
            </span>
            En proceso de validación
          </span>
        )}
      </div>

      {/* Si ya hay un comprobante y no estamos reemplazando */}
      {receipt && !showReplace ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4.5 shadow-2xs transition">
            <div className="flex items-center gap-3.5 min-w-0">
              {isReceiptPdf ? (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700 shadow-xs">
                  <FileText className="h-7 w-7" />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 border-emerald-400 bg-white shadow-xs focus:outline-hidden cursor-pointer"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receipt.url}
                    alt={receipt.name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                    <Eye className="h-4 w-4 text-white" />
                  </div>
                </button>
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  {receipt.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-2">
                  <span>Subido el {new Date(receipt.uploadedAt).toLocaleString("es-DO")}</span>
                  {receipt.sizeBytes ? <span>· {formatFileSize(receipt.sizeBytes)}</span> : null}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() =>
                  isReceiptPdf
                    ? openReceiptInNewTab(receipt.url)
                    : setShowModal(true)
                }
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-800 border border-slate-200 shadow-2xs hover:bg-slate-50 transition cursor-pointer active:scale-95"
              >
                <Eye className="h-3.5 w-3.5 text-slate-500" />
                <span>Ver comprobante</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setShowReplace(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
              >
                <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
                <span>Cambiar archivo</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 p-4 text-xs text-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <span>
                Comprobante en revisión bancaria (validando ingreso en cuenta). También puedes avisar por WhatsApp:
              </span>
            </div>
            <a
              href={whatsAppUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>Enviar por WhatsApp</span>
            </a>
          </div>
        </motion.div>
      ) : (
        /* Zona de carga y drag-and-drop */
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 space-y-4"
        >
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
              dragActive
                ? "border-[#b0894f] bg-[#fbf7f2] scale-[1.01] shadow-md"
                : "border-stone-300 bg-stone-50/60 hover:border-[#b0894f] hover:bg-[#fffcf7] hover:shadow-xs"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFile(e.target.files[0]);
                }
              }}
            />

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f5ebd7] to-[#e8d5b5] text-[#8e6834] mb-3 shadow-inner group-hover:scale-108 transition duration-300">
              <UploadCloud className="h-7 w-7" />
            </div>

            <p className="text-sm font-bold text-[var(--wood-950)]">
              {selectedFile ? (
                <span className="text-emerald-700">Archivo seleccionado: {selectedFile.name}</span>
              ) : (
                "Haz clic para seleccionar o arrastra aquí tu comprobante"
              )}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Admite capturas JPG, PNG, WebP o documentos bancarios PDF (hasta 4.5 MB)
            </p>

            {localPreview && (
              <div className="mt-4 relative h-32 w-32 overflow-hidden rounded-xl border-2 border-[#c9a15a] bg-white shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={localPreview}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3.5 text-xs text-red-800 border border-red-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="text-xs text-[var(--muted)]">
              {selectedFile ? (
                <span className="font-semibold text-[var(--wood-900)]">
                  Listo para enviar · {formatFileSize(selectedFile.size)}
                </span>
              ) : (
                <span>Una vez adjuntado, nuestro equipo validará que el dinero haya ingresado a la cuenta correspondiente.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              {showReplace && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    setShowReplace(false);
                    setSelectedFile(null);
                    setLocalPreview(null);
                    setError(null);
                  }}
                  className="rounded-lg px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition"
                >
                  Cancelar
                </button>
              )}

              <button
                type="button"
                disabled={!selectedFile || isPending}
                onClick={onUploadSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--wood-900)] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[var(--wood-800)] disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Enviando comprobante...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-4 w-4" />
                    <span>Enviar Comprobante para Verificación</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Modal de zoom para comprobante en pantalla completa */}
      {showModal && receipt && !isReceiptPdf && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-2xl overflow-hidden rounded-2xl bg-white p-4 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-1.5 text-white hover:bg-black transition"
            >
              <X className="h-4 w-4" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={receipt.url}
              alt={receipt.name}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function BankAccountCard({
  bank,
  accountNumber,
  type,
  holder,
  rnc,
}: {
  bank: string;
  accountNumber: string;
  type: string;
  holder: string;
  rnc: string;
}) {
  const [copied, setCopied] = useState(false);

  function copyAccount() {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  }

  // Estilos de marca por banco dominicano
  const lower = bank.toLowerCase();
  const isAPAP = lower.includes("apap") || lower.includes("asociación popular") || lower.includes("asociacion popular");
  const isPopular = !isAPAP && lower.includes("popular");
  const isBanreservas = lower.includes("banreservas") || lower.includes("reservas");
  const isBHD = lower.includes("bhd");
  const isBanesco = lower.includes("banesco");

  const bankTheme = isPopular
    ? {
        border: "border-blue-900/30",
        headerBg: "bg-gradient-to-r from-[#002B49] to-[#004B7A]",
        accent: "text-amber-400",
        badge: "Banco Popular",
      }
    : isBanreservas
      ? {
          border: "border-sky-900/30",
          headerBg: "bg-gradient-to-r from-[#003865] to-[#056BB3]",
          accent: "text-sky-300",
          badge: "Banreservas",
        }
      : isBHD
        ? {
            border: "border-emerald-900/30",
            headerBg: "bg-gradient-to-r from-[#0B4A28] to-[#12703D]",
            accent: "text-emerald-300",
            badge: "Banco BHD",
          }
        : isAPAP
          ? {
              border: "border-amber-900/30",
              headerBg: "bg-gradient-to-r from-[#78350F] to-[#B45309]",
              accent: "text-amber-300",
              badge: "Asociación Popular (APAP)",
            }
          : isBanesco
            ? {
                border: "border-teal-900/30",
                headerBg: "bg-gradient-to-r from-[#004D40] to-[#00695C]",
                accent: "text-teal-300",
                badge: "Banesco",
              }
            : {
                border: "border-stone-300",
                headerBg: "bg-gradient-to-r from-[#2c221e] to-[#45362f]",
                accent: "text-[#d4af37]",
                badge: bank,
              };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border ${bankTheme.border} bg-white shadow-md hover:shadow-xl transition-all duration-300`}
    >
      {/* Cabecera estilizada de tarjeta bancaria */}
      <div className={`${bankTheme.headerBg} p-4 text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <Building className={`h-4.5 w-4.5 ${bankTheme.accent}`} />
          <p className="font-bold text-xs tracking-wider uppercase">{bankTheme.badge}</p>
        </div>
        <span className="text-[10px] font-bold tracking-wider uppercase text-white/90 rounded-md bg-white/20 px-2 py-0.5 backdrop-blur-xs">
          {type}
        </span>
      </div>

      <div className="p-4 text-xs">
        {/* Número de cuenta con botón Copiar con micro-interacción */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 p-3 border border-slate-200/80">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              Número de Cuenta
            </span>
            <p className="font-mono text-base font-bold text-slate-900 tracking-wider">
              {accountNumber}
            </p>
          </div>

          <button
            type="button"
            onClick={copyAccount}
            title="Copiar número de cuenta al portapapeles"
            className="group inline-flex items-center gap-1.5 rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700 font-bold">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                <span>Copiar</span>
              </>
            )}
          </button>
        </div>

        {/* Metadatos del titular */}
        <div className="mt-3 space-y-1 text-[11px] text-slate-600 border-t border-slate-100 pt-2.5">
          <p className="flex justify-between">
            <span className="text-slate-500">Beneficiario:</span>
            <span className="font-bold text-slate-900 truncate max-w-[170px] text-right">
              {holder}
            </span>
          </p>
          {rnc ? (
            <p className="flex justify-between">
              <span className="text-slate-500">RNC:</span>
              <span className="font-mono font-semibold text-slate-800">{rnc}</span>
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

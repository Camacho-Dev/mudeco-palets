"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  XCircle,
  ExternalLink,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  DollarSign,
  User,
} from "lucide-react";
import type { AdminReceiptVerifierProps } from "./admin-receipt-verifier";

export const REJECTION_PRESETS = [
  "Los fondos no se reflejan en el extracto bancario de la empresa.",
  "El comprobante está borroso o los datos no son legibles.",
  "El monto transferido es menor al acordado para este pedido.",
  "La transferencia fue enviada a una cuenta no correspondiente a Mudeco Palets.",
  "Falta el número de confirmación o fecha de la transacción bancaria.",
];

export function formatMoney(amount: number) {
  return `RD$ ${Number(amount || 0).toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

type Receipt = AdminReceiptVerifierProps["receipt"];

/** Paso 1: vista previa del comprobante y resumen del pedido. */
export function ReceiptPreviewColumn({
  receipt,
  isPdf,
  formattedDate,
  totalFormatted,
  customerName,
  invoiceNumber,
  openReceiptFile,
  onZoom,
}: {
  receipt: Receipt;
  isPdf: boolean;
  formattedDate: string;
  totalFormatted: string;
  customerName: string;
  invoiceNumber?: string | null;
  openReceiptFile: () => void;
  onZoom: () => void;
}) {
  return (
    <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/70 p-4.5">
      <div>
        <div className="flex items-center justify-between pb-2 text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider">
          <span>Paso 1: Foto del Comprobante</span>
          <span className="font-normal text-stone-500 font-mono text-[11px]">
            {receipt.sizeBytes
              ? `${Math.round(receipt.sizeBytes / 1024)} KB`
              : ""}
          </span>
        </div>

        <div className="relative mt-1 aspect-[4/3] w-full overflow-hidden rounded-lg border border-stone-300 bg-stone-900 flex items-center justify-center group shadow-inner">
          {isPdf ? (
            <div className="flex flex-col items-center gap-2 text-white p-6 text-center">
              <FileText className="h-12 w-12 text-rose-400" />
              <p className="text-xs font-semibold text-stone-200">
                Documento PDF adjunto
              </p>
              <p className="text-[11px] text-stone-400 truncate max-w-[200px]">
                {receipt.name}
              </p>
              <button
                type="button"
                onClick={openReceiptFile}
                className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white px-3 py-1.5 text-xs font-bold text-stone-900 hover:bg-stone-100"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Abrir PDF
              </button>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={receipt.url}
                alt={receipt.name}
                className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={onZoom}
                  className="rounded-lg bg-white/95 px-3 py-1.5 text-xs font-bold text-stone-900 shadow-md hover:bg-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                  Ampliar con Zoom
                </button>
              </div>
            </>
          )}
        </div>

        <p className="mt-2 truncate text-xs font-medium text-stone-700">
          Archivo: <span className="font-semibold">{receipt.name}</span>
        </p>
        <p className="text-[11px] text-stone-500">
          Adjuntado por el cliente: {formattedDate}
        </p>
      </div>

      <div className="mt-3 rounded-xl bg-white p-3.5 border border-slate-200/90 text-xs space-y-2 shadow-2xs">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <DollarSign className="h-4 w-4 text-emerald-600" />
            Monto del pedido:
          </span>
          <span className="font-bold font-mono text-slate-900 text-sm">
            {totalFormatted}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <User className="h-4 w-4 text-slate-400" />
            Cliente titular:
          </span>
          <span className="font-semibold text-slate-800 truncate max-w-[170px]">
            {customerName}
          </span>
        </div>
        {invoiceNumber && (
          <div className="flex justify-between items-center border-t border-slate-100 pt-1.5">
            <span className="text-slate-500">Factura vinculada:</span>
            <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {invoiceNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Visor ampliado de la foto con zoom y rotación. */
export function ReceiptImageModal({
  receipt,
  orderNumber,
  totalFormatted,
  zoomLevel,
  setZoomLevel,
  rotation,
  setRotation,
  onClose,
}: {
  receipt: Receipt;
  orderNumber: string;
  totalFormatted: string;
  zoomLevel: number;
  setZoomLevel: Dispatch<SetStateAction<number>>;
  rotation: number;
  setRotation: Dispatch<SetStateAction<number>>;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex flex-col max-h-[92vh] max-w-4xl w-full overflow-hidden rounded-2xl bg-stone-950 p-4 shadow-2xl border border-stone-700"
      >
        {/* Barra de herramientas superior */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 text-white">
          <div className="min-w-0 pr-4">
            <p className="truncate text-sm font-bold">{receipt.name}</p>
            <p className="text-xs text-stone-400">
              {orderNumber} · Monto: {totalFormatted}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setZoomLevel((z) => Math.min(3, +(z + 0.25).toFixed(2)))
              }
              className="rounded-lg bg-stone-800 p-2 text-stone-200 hover:bg-stone-700"
              title="Acercar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                setZoomLevel((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))
              }
              className="rounded-lg bg-stone-800 p-2 text-stone-200 hover:bg-stone-700"
              title="Alejar zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="rounded-lg bg-stone-800 p-2 text-stone-200 hover:bg-stone-700"
              title="Rotar 90°"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setZoomLevel(1);
                setRotation(0);
              }}
              className="rounded-lg bg-stone-800 px-2.5 py-1 text-xs text-stone-200 hover:bg-stone-700"
            >
              100%
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-rose-900/50 p-2 text-rose-200 hover:bg-rose-900 ml-2"
              title="Cerrar visor"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Lienzo de imagen con zoom y rotación */}
        <div className="relative mt-3 flex-1 overflow-auto rounded-lg bg-stone-900 flex items-center justify-center p-4 min-h-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={receipt.url}
            alt={receipt.name}
            style={{
              transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
              transition: "transform 0.15s ease-out",
            }}
            className="max-h-[70vh] max-w-full object-contain origin-center select-none shadow-lg"
          />
        </div>
      </div>
    </div>
  );
}

/** Formulario de rechazo del comprobante. */
export function RejectReceiptModal({
  isPending,
  rejectionReason,
  setRejectionReason,
  customRejection,
  setCustomRejection,
  onSubmit,
  onClose,
}: {
  isPending: boolean;
  rejectionReason: string;
  setRejectionReason: (v: string) => void;
  customRejection: string;
  setCustomRejection: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200"
      >
        <div className="flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center gap-2 text-rose-700">
            <XCircle className="h-5 w-5" />
            <h3 className="font-bold text-sm text-stone-900">
              Rechazar Comprobante Bancario
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <p className="text-xs text-stone-600 leading-relaxed">
            Selecciona el motivo por el cual no se pudo validar este
            comprobante. El cliente podrá ver la observación y adjuntar uno
            nuevo desde su pedido:
          </p>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Motivo principal:
            </label>
            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs"
            >
              {REJECTION_PRESETS.map((preset) => (
                <option key={preset} value={preset}>
                  {preset}
                </option>
              ))}
              <option value="Otro motivo">Otro motivo específico...</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-800 mb-1">
              Mensaje explicativo para el cliente:
            </label>
            <textarea
              rows={3}
              value={customRejection}
              onChange={(e) => setCustomRejection(e.target.value)}
              placeholder="Ej. Por favor verifica que el comprobante sea el emitido hoy por tu banco y que muestre el monto completo..."
              className="w-full rounded-lg border border-stone-300 bg-white p-2.5 text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-semibold text-stone-600 hover:bg-stone-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-800 transition disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Rechazando...</span>
                </>
              ) : (
                <span>Confirmar Rechazo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

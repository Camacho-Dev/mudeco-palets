"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isPending?: boolean;
  itemDetails?: {
    name?: string;
    count?: number;
    total?: number | string;
    subtitle?: string;
  };
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Descartar",
  cancelLabel = "Cancelar",
  isDestructive = true,
  isPending = false,
  itemDetails,
}: ConfirmDialogProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isPending) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Enfocar automáticamente el botón cancelar para evitar confirmaciones accidentales
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
        className="w-full max-w-md rounded-2xl border border-[#b0894f]/30 bg-[#faf6f1] p-6 shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                isDestructive
                  ? "bg-rose-100/90 text-rose-700 border border-rose-200"
                  : "bg-[#b0894f]/15 text-[#b0894f] border border-[#b0894f]/30"
              }`}
            >
              {isDestructive ? (
                <Trash2 className="h-6 w-6 stroke-[2.2]" />
              ) : (
                <AlertTriangle className="h-6 w-6 stroke-[2.2]" />
              )}
            </div>
            <div>
              <p className="text-[0.68rem] font-bold tracking-wider text-[var(--brass)] uppercase">
                Confirmación · Mudeco Palets
              </p>
              <h3
                id="confirm-dialog-title"
                className="font-display text-xl font-bold text-[var(--wood-950)] leading-tight"
              >
                {title}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="rounded-lg p-1 text-[var(--muted)] hover:bg-black/5 hover:text-[var(--wood-950)] transition"
            title="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p id="confirm-dialog-desc" className="mt-3.5 text-sm text-[var(--wood-900)] leading-relaxed">
          {description}
        </p>

        {itemDetails ? (
          <div className="mt-4 rounded-xl border border-[var(--border)] bg-white p-3.5 shadow-sm text-xs space-y-1.5">
            {itemDetails.name ? (
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Cuenta / Factura:</span>
                <span className="font-semibold text-[var(--wood-950)]">
                  {itemDetails.name}
                </span>
              </div>
            ) : null}
            {itemDetails.count !== undefined ? (
              <div className="flex items-center justify-between">
                <span className="text-[var(--muted)]">Productos agregados:</span>
                <span className="font-medium text-[var(--wood-900)]">
                  {itemDetails.count} artículo(s)
                </span>
              </div>
            ) : null}
            {itemDetails.total !== undefined ? (
              <div className="flex items-center justify-between border-t border-[var(--border)] pt-1.5">
                <span className="text-[var(--muted)]">Total acumulado:</span>
                <span className="font-bold text-[var(--wood-950)]">
                  {itemDetails.total}
                </span>
              </div>
            ) : null}
            {itemDetails.subtitle ? (
              <p className="text-[0.68rem] text-[var(--muted)] pt-1 italic">
                {itemDetails.subtitle}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[var(--border)] pt-4">
          <button
            ref={cancelBtnRef}
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="btn btn-secondary text-xs px-4 py-2"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={onConfirm}
            className={`btn text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5 shadow-sm transition ${
              isDestructive
                ? "bg-rose-700 hover:bg-rose-800 text-white border-transparent"
                : "btn-primary"
            }`}
          >
            {isPending ? (
              <span>Procesando...</span>
            ) : (
              <>
                {isDestructive ? <Trash2 className="h-3.5 w-3.5" /> : null}
                <span>{confirmLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

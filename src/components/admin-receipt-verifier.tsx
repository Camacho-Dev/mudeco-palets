"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  Eye,
  ExternalLink,
  ShieldCheck,
  Loader2,
  Banknote,
} from "lucide-react";
import {
  approveReceiptPaymentAction,
  rejectReceiptPaymentAction,
} from "@/app/(dashboard)/pedidos-web/actions";

export interface AdminReceiptVerifierProps {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  totalFormatted: string;
  totalAmount?: number;
  receipt: {
    url: string;
    name: string;
    uploadedAt: string;
    mimeType?: string;
    sizeBytes?: number;
  };
  invoiceNumber?: string | null;
  validationNote?: string | null;
}
import {
  REJECTION_PRESETS,
  formatMoney,
  ReceiptImageModal,
  ReceiptPreviewColumn,
  RejectReceiptModal,
} from "./admin-receipt-verifier-parts";
import {
  AdvancedPaymentOptions,
  ConfirmationChecks,
} from "./admin-receipt-verifier-sections";


export function AdminReceiptVerifier({
  orderId,
  orderNumber,
  orderStatus,
  customerName,

  totalFormatted,
  totalAmount,
  receipt,
  invoiceNumber,
  validationNote,
}: AdminReceiptVerifierProps) {
  const [isPending, startTransition] = useTransition();

  // 3 Casillas de confirmación obligatorias
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  // Campos adicionales opcionales
  const [bankReference, setBankReference] = useState("");
  const [staffNote, setStaffNote] = useState("");

  // Menú desplegable de Opciones Avanzadas (Pago Parcial / Incompleto de Muebles)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPartialPayment, setIsPartialPayment] = useState(false);
  const [partialAmountInput, setPartialAmountInput] = useState<string>("");
  const [balanceCondition, setBalanceCondition] = useState<string>(
    "Contra entrega al retirar en taller",
  );

  // Cálculos de saldo y parciales
  const numericTotal =
    typeof totalAmount === "number" && totalAmount > 0
      ? totalAmount
      : parseFloat(totalFormatted.replace(/[^0-9.]/g, "")) || 0;

  const parsedPartial = parseFloat(partialAmountInput) || 0;
  const validPartial =
    isPartialPayment && parsedPartial > 0 && parsedPartial < numericTotal - 0.01;
  const remainingBalance = Math.max(0, numericTotal - parsedPartial);
  const paidPercent =
    numericTotal > 0 ? Math.min(100, (parsedPartial / numericTotal) * 100) : 0;

  // Estado del modal de imagen completa
  const [modalOpen, setModalOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);

  // Estado de rechazo
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState(REJECTION_PRESETS[0]);
  const [customRejection, setCustomRejection] = useState("");

  // Notificaciones
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isPaid = orderStatus === "PAID" || orderStatus === "DONE";
  const isCancelled = orderStatus === "CANCELLED";
  const allChecksConfirmed = check1 && check2 && check3;
  const isPdf =
    receipt.mimeType === "application/pdf" ||
    receipt.name.toLowerCase().endsWith(".pdf");

  function openReceiptFile() {
    if (!isPdf && receipt.url.startsWith("data:image/")) {
      setModalOpen(true);
      return;
    }
    if (!receipt.url.startsWith("data:")) {
      window.open(receipt.url, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      const [header, base64] = receipt.url.split(",");
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
      setModalOpen(true);
    }
  }

  function handleApprove() {
    if (!allChecksConfirmed) return;
    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await approveReceiptPaymentAction(orderId, {
          bankReference: bankReference.trim() || undefined,
          note: staffNote.trim() || undefined,
          isPartial: validPartial,
          partialAmount: validPartial ? parsedPartial : undefined,
          balanceCondition: validPartial ? balanceCondition : undefined,
        });
        if (res.success) {
          setFeedback({ type: "success", message: res.message });
        } else {
          setFeedback({
            type: "error",
            message: res.error || "No se pudo aprobar el comprobante.",
          });
        }
      } catch (err) {
        setFeedback({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Ocurrió un error inesperado al procesar el pago.",
        });
      }
    });
  }

  function handleRejectSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalReason = [rejectionReason, customRejection.trim()]
      .filter(Boolean)
      .join(" — ");
    if (!finalReason) return;

    setFeedback(null);
    startTransition(async () => {
      try {
        const res = await rejectReceiptPaymentAction(orderId, {
          reason: finalReason,
        });
        if (res.success) {
          setRejectOpen(false);
          setFeedback({ type: "success", message: res.message });
        } else {
          setFeedback({
            type: "error",
            message: res.error || "No se pudo rechazar el comprobante.",
          });
        }
      } catch (err) {
        setFeedback({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Ocurrió un error inesperado al rechazar el comprobante.",
        });
      }
    });
  }

  const formattedDate = new Date(receipt.uploadedAt).toLocaleString("es-DO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div
      id="comprobante"
      className="card mb-6 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg transition-all"
    >
      {/* 1. ENCABEZADO SUPERIOR DEL VERIFICADOR */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-6 py-4.5 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/30">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold text-white tracking-tight">
                Verificación de Comprobante Bancario
              </h3>
              {isPaid ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Pago Aprobado en Cuenta
                </span>
              ) : isCancelled ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-slate-700">
                  Orden Cancelada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/40 animate-pulse">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                  Pendiente de 3 Confirmaciones
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Pedido {orderNumber} · Monto a validar:{" "}
              <strong className="text-amber-300 font-mono font-bold">
                {totalFormatted}
              </strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openReceiptFile}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer active:scale-95"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver foto completa</span>
            <ExternalLink className="h-3 w-3 opacity-70" />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`px-6 py-3 text-xs font-medium border-b ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200"
              : "bg-rose-50 text-rose-900 border-rose-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* 2. ÁREA PRINCIPAL: PRIMERO SE ENTRA A VER LA FOTO Y DETALLES */}
      <div className="grid gap-6 p-6 lg:grid-cols-12">
        {/* Columna Izquierda: Vista previa de la foto / comprobante */}
        <ReceiptPreviewColumn
          receipt={receipt}
          isPdf={isPdf}
          formattedDate={formattedDate}
          totalFormatted={totalFormatted}
          customerName={customerName}
          invoiceNumber={invoiceNumber}
          openReceiptFile={openReceiptFile}
          onZoom={() => setModalOpen(true)}
        />

        {/* Columna Derecha: Paso 2 -> 3 Confirmaciones y decisión */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-200 pb-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Paso 2: Protocolo de 3 Confirmaciones de Seguridad
                </span>
                <span className="text-[11px] font-bold text-slate-400">
                  {Number(check1) + Number(check2) + Number(check3)} de 3 listas
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Para evitar fraudes o comprobantes duplicados, marca las 3 confirmaciones tras validar en la banca en línea:
              </p>
            </div>

            {/* LAS 3 CONFIRMACIONES */}
            <ConfirmationChecks
              check1={check1}
              setCheck1={setCheck1}
              check2={check2}
              setCheck2={setCheck2}
              check3={check3}
              setCheck3={setCheck3}
              disabled={isPaid || isCancelled || isPending}
              validPartial={validPartial}
              parsedPartial={parsedPartial}
              paidPercent={paidPercent}
              remainingBalance={remainingBalance}
              balanceCondition={balanceCondition}
              customerName={customerName}
              totalFormatted={totalFormatted}
            />

            {/* Campos opcionales de auditoría bancaria */}
            {!isPaid && !isCancelled && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    No. de referencia bancaria (Opcional)
                  </label>
                  <input
                    type="text"
                    value={bankReference}
                    onChange={(e) => setBankReference(e.target.value)}
                    placeholder="Ej. BHD-784910 o Pop-33219"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Nota interna de validación (Opcional)
                  </label>
                  <input
                    type="text"
                    value={staffNote}
                    onChange={(e) => setStaffNote(e.target.value)}
                    placeholder="Ej. Verificado en cuenta Popular"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            )}

            {/* DROPDOWN / MENÚ DESPLEGABLE: OPCIONES AVANZADAS (PAGO INCOMPLETO / ABONO DE MUEBLES) */}
            {!isPaid && !isCancelled && (
              <AdvancedPaymentOptions
                showAdvanced={showAdvanced}
                setShowAdvanced={setShowAdvanced}
                validPartial={validPartial}
                parsedPartial={parsedPartial}
                isPartialPayment={isPartialPayment}
                setIsPartialPayment={setIsPartialPayment}
                partialAmountInput={partialAmountInput}
                setPartialAmountInput={setPartialAmountInput}
                numericTotal={numericTotal}
                paidPercent={paidPercent}
                remainingBalance={remainingBalance}
                balanceCondition={balanceCondition}
                setBalanceCondition={setBalanceCondition}
              />
            )}
          </div>

          {/* 3. BOTONES DE DECISIÓN: CONFIRMAR O RECHAZAR */}
          <div className="mt-5 border-t border-stone-200 pt-4">
            {isPaid ? (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 border border-emerald-200">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <div>
                  <p>
                    Comprobante validado y aprobado: El pedido está marcado como
                    pagado y la factura oficial emitida.
                  </p>
                  {validationNote && (
                    <p className="text-[11px] text-emerald-700 font-normal mt-0.5">
                      {validationNote}
                    </p>
                  )}
                </div>
              </div>
            ) : isCancelled ? (
              <div className="rounded-xl bg-stone-100 p-3 text-xs text-stone-600">
                Este pedido fue cancelado y no admite confirmación de pagos.
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-xs text-stone-500">
                  {allChecksConfirmed ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      3 confirmaciones listas. Puedes aprobar el pago.
                    </span>
                  ) : (
                    <span>
                      Completa las 3 casillas para habilitar el botón de
                      aprobación.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setRejectOpen(true)}
                    disabled={isPending}
                    className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-100 transition cursor-pointer disabled:opacity-50 active:scale-95"
                  >
                    Rechazar comprobante
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={
                      !allChecksConfirmed ||
                      isPending ||
                      (isPartialPayment && !validPartial)
                    }
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-md cursor-pointer ${
                      allChecksConfirmed &&
                      !isPending &&
                      (!isPartialPayment || validPartial)
                        ? validPartial
                          ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white hover:from-amber-500 hover:to-amber-400 active:scale-95 shadow-amber-600/25"
                          : "bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-500 hover:to-teal-500 active:scale-95 shadow-emerald-600/25"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Procesando pago...</span>
                      </>
                    ) : validPartial ? (
                      <>
                        <Banknote className="h-4 w-4" />
                        <span>Confirmar Abono ({formatMoney(parsedPartial)})</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Confirmar y Aprobar Pago</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: VISOR AMPLIADO DE LA FOTO CON ZOOM Y ROTACIÓN */}
      {modalOpen && (
        <ReceiptImageModal
          receipt={receipt}
          orderNumber={orderNumber}
          totalFormatted={totalFormatted}
          zoomLevel={zoomLevel}
          setZoomLevel={setZoomLevel}
          rotation={rotation}
          setRotation={setRotation}
          onClose={() => setModalOpen(false)}
        />
      )}

      {/* MODAL 2: FORMULARIO DE RECHAZO DE COMPROBANTE */}
      {rejectOpen && (
        <RejectReceiptModal
          isPending={isPending}
          rejectionReason={rejectionReason}
          setRejectionReason={setRejectionReason}
          customRejection={customRejection}
          setCustomRejection={setCustomRejection}
          onSubmit={handleRejectSubmit}
          onClose={() => setRejectOpen(false)}
        />
      )}
    </div>
  );
}

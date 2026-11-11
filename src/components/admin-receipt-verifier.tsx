"use client";

import { useState, useTransition } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ExternalLink,
  ShieldCheck,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
  Building2,
  DollarSign,
  User,
  Calendar,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Banknote,
  Info,
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

const REJECTION_PRESETS = [
  "Los fondos no se reflejan en el extracto bancario de la empresa.",
  "El comprobante está borroso o los datos no son legibles.",
  "El monto transferido es menor al acordado para este pedido.",
  "La transferencia fue enviada a una cuenta no correspondiente a Mudeco Palets.",
  "Falta el número de confirmación o fecha de la transacción bancaria.",
];

function formatMoney(amount: number) {
  return `RD$ ${Number(amount || 0).toLocaleString("es-DO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function AdminReceiptVerifier({
  orderId,
  orderNumber,
  orderStatus,
  customerName,
  customerEmail,
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
                      onClick={() => setModalOpen(true)}
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
            <div className="mt-4 space-y-3">
              {/* Confirmación 1 */}
              <label
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
                  check1
                    ? "border-emerald-500/80 bg-emerald-50/70 text-slate-900 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={check1}
                  disabled={isPaid || isCancelled || isPending}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold flex items-center gap-1 text-slate-900">
                    <span>1. Foto y datos legibles revisados</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    He revisado la foto/documento del comprobante y confirmo que es nítido, con fecha reciente, cuenta bancaria de destino y número de autorización visible.
                  </p>
                </div>
              </label>

              {/* Confirmación 2 */}
              <label
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
                  check2
                    ? "border-emerald-500/80 bg-emerald-50/70 text-slate-900 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={check2}
                  disabled={isPaid || isCancelled || isPending}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold flex items-center gap-1 text-slate-900">
                    <span>2. Fondos confirmados en la cuenta de Mudeco Palets</span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Ingresé al portal o banca móvil de la empresa y verifiqué que el dinero ya fue efectivamente acreditado en el balance disponible.
                  </p>
                </div>
              </label>

              {/* Confirmación 3 */}
              <label
                className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-200 cursor-pointer select-none ${
                  check3
                    ? "border-emerald-500/80 bg-emerald-50/70 text-slate-900 shadow-sm ring-1 ring-emerald-500/30"
                    : "border-slate-200 bg-slate-50/60 hover:bg-white hover:border-slate-300 text-slate-700"
                }`}
              >
                <input
                  type="checkbox"
                  checked={check3}
                  disabled={isPaid || isCancelled || isPending}
                  onChange={(e) => setCheck3(e.target.checked)}
                  className="mt-0.5 h-5 w-5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
                <div className="text-xs leading-relaxed">
                  <p className="font-bold flex items-center gap-1 text-slate-900">
                    <span>
                      {validPartial
                        ? "3. Abono parcial verificado y cliente validado"
                        : "3. Monto exacto y cliente verificado"}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    {validPartial ? (
                      <>
                        El monto transferido es un abono inicial de{" "}
                        <strong className="text-emerald-700 font-bold">
                          {formatMoney(parsedPartial)}
                        </strong>{" "}
                        ({paidPercent.toFixed(1)}% del pedido de muebles). Resta un
                        balance pendiente de{" "}
                        <strong className="text-amber-800 font-bold">
                          {formatMoney(remainingBalance)}
                        </strong>{" "}
                        que se cobrará <em>{balanceCondition.toLowerCase()}</em> a{" "}
                        <strong className="text-slate-900">{customerName}</strong>.
                      </>
                    ) : (
                      <>
                        El monto transferido cubre el valor total de{" "}
                        <strong className="text-slate-900 font-mono font-bold">{totalFormatted}</strong> y corresponde a la orden
                        de <strong className="text-slate-900">{customerName}</strong>.
                      </>
                    )}
                  </p>
                </div>
              </label>
            </div>

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
              <div className="mt-3.5 rounded-xl border border-stone-200 bg-stone-50/60 overflow-hidden transition">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-[var(--wood-900)] hover:bg-stone-100/80 transition select-none cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#b0894f]" />
                    <span>Opciones avanzadas</span>
                    {validPartial ? (
                      <span className="rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        Abono activo: {formatMoney(parsedPartial)}
                      </span>
                    ) : (
                      <span className="text-[11px] font-normal text-[var(--muted)]">
                        (Si no pagó el total / Abono inicial de muebles)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-[#b0894f]">
                    <span>{showAdvanced ? "Ocultar menú" : "Desplegar menú"}</span>
                    {showAdvanced ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {showAdvanced && (
                  <div className="border-t border-stone-200 bg-white p-3.5 space-y-3">
                    <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 p-2.5 border border-amber-200 text-xs text-amber-950">
                      <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <p className="font-semibold">
                          Manejo de Pago Incompleto / Abono de Inicial
                        </p>
                        <p className="text-[11px] text-amber-900 mt-0.5">
                          Usa este menú si el cliente transfirió una parte del
                          dinero (ej. 50% de inicial para comenzar a fabricar los
                          muebles) y pagará el resto contra entrega o retiro en taller.
                        </p>
                      </div>
                    </div>

                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPartialPayment}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setIsPartialPayment(checked);
                          if (checked && !partialAmountInput) {
                            setPartialAmountInput(
                              Math.round(numericTotal * 0.5).toString(),
                            );
                          }
                        }}
                        className="h-4 w-4 rounded border-stone-300 text-[#b0894f] focus:ring-[#b0894f]"
                      />
                      <span className="text-xs font-bold text-stone-800">
                        Registrar como Pago Parcial / Abono de Inicial
                      </span>
                    </label>

                    {isPartialPayment && (
                      <div className="space-y-3 pt-2 border-t border-stone-100">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-stone-700">
                              Monto transferido según el comprobante (RD$):
                            </label>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-stone-500 font-medium">
                                Atajos:
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setPartialAmountInput(
                                    Math.round(numericTotal * 0.3).toString(),
                                  )
                                }
                                className="rounded bg-stone-100 border border-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 hover:bg-stone-200"
                              >
                                30%
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPartialAmountInput(
                                    Math.round(numericTotal * 0.5).toString(),
                                  )
                                }
                                className="rounded bg-stone-100 border border-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 hover:bg-stone-200"
                              >
                                50%
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setPartialAmountInput(
                                    Math.round(numericTotal * 0.7).toString(),
                                  )
                                }
                                className="rounded bg-stone-100 border border-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-700 hover:bg-stone-200"
                              >
                                70%
                              </button>
                            </div>
                          </div>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-xs font-bold text-stone-400">
                              RD$
                            </span>
                            <input
                              type="number"
                              step="0.01"
                              min="1"
                              max={numericTotal}
                              value={partialAmountInput}
                              onChange={(e) =>
                                setPartialAmountInput(e.target.value)
                              }
                              placeholder="Ej. 15000"
                              className="w-full rounded-lg border border-stone-300 bg-white pl-11 pr-3 py-2 text-xs font-bold text-[var(--wood-950)] focus:border-[#b0894f] focus:outline-none focus:ring-1 focus:ring-[#b0894f]"
                            />
                          </div>
                        </div>

                        {/* TARJETAS DE CÁLCULO DE BALANCE */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                              Monto transferido (Abono)
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold text-emerald-950">
                              {formatMoney(parsedPartial)}
                            </p>
                            <p className="text-[10px] text-emerald-700">
                              {paidPercent.toFixed(1)}% del total de muebles
                            </p>
                          </div>

                          <div className="rounded-lg border border-amber-300 bg-amber-50/80 p-2.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900">
                              Resta por cobrar (Pendiente)
                            </p>
                            <p className="mt-0.5 text-sm font-extrabold text-amber-950">
                              {formatMoney(remainingBalance)}
                            </p>
                            <p className="text-[10px] text-amber-800">
                              A cobrar antes de entregar
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-stone-700 mb-1">
                            Condición de cobro del restante:
                          </label>
                          <select
                            value={balanceCondition}
                            onChange={(e) =>
                              setBalanceCondition(e.target.value)
                            }
                            className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs text-stone-800"
                          >
                            <option value="Contra entrega al retirar en taller">
                              Contra entrega al retirar en taller de Mudeco Palets
                            </option>
                            <option value="Contra entrega antes de descargar los muebles en destino">
                              Contra entrega antes de descargar los muebles en destino
                            </option>
                            <option value="Transferencia obligatoria antes del despacho desde fábrica">
                              Transferencia obligatoria antes del despacho desde fábrica
                            </option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
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
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setModalOpen(false)}
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
                  onClick={() => setModalOpen(false)}
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
      )}

      {/* MODAL 2: FORMULARIO DE RECHAZO DE COMPROBANTE */}
      {rejectOpen && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setRejectOpen(false)}
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
                onClick={() => setRejectOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
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
                  onClick={() => setRejectOpen(false)}
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
      )}
    </div>
  );
}


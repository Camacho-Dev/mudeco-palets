"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Hammer,
  Truck,
  Store,
  CreditCard,
  FileCheck,
  HelpCircle,
  Sparkles,
  Printer,
  Share2,
  Check,
} from "lucide-react";

interface OrderTimelineTrackerProps {
  orderNumber: string;
  isPaid: boolean;
  isTransfer?: boolean;
  isDone?: boolean;
  hasReceipt: boolean;
  fulfillmentType: "Entrega a domicilio" | "Retiro en taller";
  estimatedDays?: string;
}

export function OrderTimelineTracker({
  orderNumber,
  isPaid,
  isTransfer = false,
  isDone = false,
  hasReceipt,
  fulfillmentType,
  estimatedDays = "2-4 días hábiles",
}: OrderTimelineTrackerProps) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const steps = [
    {
      num: 1,
      title: "Pedido Registrado",
      shortDesc: "Recibido en el sistema",
      detail:
        "Tu orden ha sido registrada correctamente con un número único. El inventario de maderas nobles de pino y herrajes ha sido reservado.",
      status: "completed",
      icon: CheckCircle2,
    },
    {
      num: 2,
      title: isPaid
        ? "Pago Confirmado"
        : isTransfer
          ? "Validación de Pago"
          : "Pago en el Local",
      shortDesc: isPaid
        ? isTransfer
          ? "Transferencia conciliada"
          : "Pago verificado"
        : isTransfer
          ? hasReceipt
            ? "Comprobante en revisión"
            : "Pendiente de comprobante"
          : "Al retirar o recibir",
      detail: isPaid
        ? isTransfer
          ? "Tu transferencia bancaria fue conciliada satisfactoriamente por nuestro equipo de administración. Tu factura oficial ha sido emitida."
          : "El pago fue confirmado satisfactoriamente en el sistema. Tu factura oficial está disponible para descarga."
        : isTransfer
          ? hasReceipt
            ? "Hemos recibido tu comprobante bancario. Nuestro departamento de tesorería está conciliando los fondos con el banco."
            : "Por favor transfiere el monto exacto a una de nuestras cuentas bancarias y adjunta la foto o PDF para iniciar la fabricación."
          : "Elegiste realizar el pago presencialmente en nuestro taller o contra entrega coordinada con nuestro equipo.",
      status: isPaid
        ? "completed"
        : isTransfer
          ? hasReceipt
            ? "in_progress"
            : "pending"
          : "in_progress",
      icon: isPaid ? CreditCard : hasReceipt ? FileCheck : Clock,
    },
    {
      num: 3,
      title: "Fabricación en Taller",
      shortDesc: isDone ? "Completado en taller" : `Estimado: ${estimatedDays}`,
      detail:
        "Nuestros maestros carpinteros cortan, ensamblan, curan contra polilla y lijan a mano cada pieza de madera de pino garantizada.",
      status: isDone ? "completed" : isPaid ? "in_progress" : "waiting",
      icon: Hammer,
    },
    {
      num: 4,
      title:
        fulfillmentType === "Entrega a domicilio"
          ? "Despacho a Domicilio"
          : "Listo para Retiro",
      shortDesc:
        fulfillmentType === "Entrega a domicilio"
          ? "Transporte seguro"
          : "Taller Santo Domingo Oeste",
      detail:
        fulfillmentType === "Entrega a domicilio"
          ? "Un chofer de nuestro equipo te contactará para coordinar la entrega y descarga segura de tus muebles."
          : "Recibirás una notificación cuando tus piezas estén empacadas y listas para retirar en nuestro taller en Santo Domingo Oeste.",
      status: isDone ? "completed" : "waiting",
      icon: fulfillmentType === "Entrega a domicilio" ? Truck : Store,
    },
  ];

  // Cálculo del porcentaje de progreso de la barra
  const progressPercent = isDone
    ? 100
    : isPaid
      ? 66
      : hasReceipt || !isTransfer
        ? 38
        : 20;

  function handlePrint() {
    window.print();
  }

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: `Pedido ${orderNumber} · Mudeco Palets`,
          text: `Consulta el estado de mi pedido ${orderNumber} de muebles en madera de pino en Mudeco Palets.`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-lg sm:p-8">
      {/* Cabecera del Tracker */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            Trazabilidad en tiempo real
          </span>
          <h2 className="mt-1.5 text-lg font-bold text-slate-900 sm:text-xl tracking-tight">
            Seguimiento de Fabricación y Entrega
          </h2>
        </div>

        {/* Acciones de impresión y compartir */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            title="Imprimir resumen del pedido"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            title="Compartir o copiar enlace del pedido"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-2xs cursor-pointer active:scale-95"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                <span className="text-emerald-700 font-bold">¡Enlace copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Compartir</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de progreso conectora y pasos interactivos */}
      <div className="relative mt-8">
        {/* Línea de fondo inactiva */}
        <div className="absolute top-5 left-6 right-6 h-2 -translate-y-1/2 rounded-full bg-slate-100 sm:left-12 sm:right-12" />

        {/* Línea animada de progreso activo */}
        <motion.div
          initial={{ width: "0%" }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
          className="absolute top-5 left-6 h-2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 shadow-[0_0_12px_rgba(16,185,129,0.4)] sm:left-12"
        />

        {/* Los 4 pasos */}
        <div className="relative grid grid-cols-4 gap-2 text-center">
          {steps.map((st, idx) => {
            const isCompleted = st.status === "completed";
            const isInProgress = st.status === "in_progress";
            const Icon = st.icon;

            return (
              <button
                key={st.num}
                type="button"
                onClick={() => setActiveTab(activeTab === idx ? null : idx)}
                className="group flex flex-col items-center focus:outline-hidden cursor-pointer"
              >
                {/* Nodo circular del paso */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 * idx, duration: 0.4 }}
                  className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 transition-all duration-300 shadow-sm ${
                    isCompleted
                      ? "border-emerald-500 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20"
                      : isInProgress
                        ? "border-amber-400 bg-gradient-to-tr from-amber-500 to-yellow-500 text-white shadow-amber-500/30 ring-4 ring-amber-400/25 animate-pulse"
                        : "border-slate-200 bg-white text-slate-400 group-hover:border-slate-300 group-hover:text-slate-600"
                  }`}
                >
                  <Icon className="h-5 w-5 sm:h-5.5 sm:w-5.5" />

                  {/* Indicador de pulso activo si está en progreso */}
                  {isInProgress && (
                    <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                      <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-amber-600 ring-2 ring-white" />
                    </span>
                  )}
                </motion.div>

                {/* Textos descriptivos */}
                <div className="mt-3 space-y-0.5">
                  <p
                    className={`text-xs font-bold transition-colors ${
                      isCompleted
                        ? "text-emerald-900"
                        : isInProgress
                          ? "text-amber-900"
                          : "text-slate-500 group-hover:text-slate-700"
                    }`}
                  >
                    {st.title}
                  </p>
                  <p className="hidden sm:block text-[11px] text-slate-500">
                    {st.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarjeta explicativa expandible del paso activo o seleccionado */}
      <div className="mt-7 rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4.5 text-xs shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--wood-950)] text-xs uppercase tracking-wider">
                {activeTab !== null
                  ? `Etapa ${steps[activeTab].num}: ${steps[activeTab].title}`
                  : isPaid
                    ? "Etapa Actual: Fabricación en Taller Artesanal"
                    : hasReceipt
                      ? "Etapa Actual: Verificación de Comprobante"
                      : "Etapa Actual: Pendiente de Comprobante Bancario"}
              </span>
              <span className="text-[11px] text-[#8a6a3a] font-medium">
                {activeTab !== null ? "Haz clic en otro paso para ver" : "Detalle oficial"}
              </span>
            </div>
            <p className="mt-1 text-stone-700 leading-relaxed">
              {activeTab !== null
                ? steps[activeTab].detail
                : isPaid
                  ? "Tu pago ha sido acreditado exitosamente. Tus piezas pasan a nuestra orden de trabajo en carpintería para corte de madera de pino y curado artesanal."
                  : hasReceipt
                    ? "Tu comprobante fue adjuntado y nuestro equipo lo está validando con el extracto bancario. Una vez verificado comenzará el corte y armado."
                    : "Para poner en marcha la fabricación de tus muebles, transfiere el monto exacto y carga el comprobante en la sección inferior."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Clock } from "lucide-react";

interface AnimatedSuccessCheckProps {
  title: string;
  subtitle: string;
  orderNumber: string;
  statusLabel: string;
  tone?: "success" | "processing";
  createdAt?: string | Date;
}

export function AnimatedSuccessCheck({
  title,
  subtitle,
  orderNumber,
  statusLabel,
  tone = "success",
  createdAt,
}: AnimatedSuccessCheckProps) {
  const [copied, setCopied] = useState(false);
  const isProcessing = tone === "processing";

  function copyOrderNumber() {
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString("es-DO", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="text-center">
      {/* Icono central: Reloj Ámbar si está En Proceso / Check Verde si ya fue Confirmado con resplandor */}
      <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 18,
          }}
          className={`relative flex h-20 w-20 items-center justify-center rounded-3xl shadow-xl transition-all duration-300 ${
            isProcessing
              ? "bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 text-white shadow-amber-500/30 ring-8 ring-amber-500/15"
              : "bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-emerald-500/30 ring-8 ring-emerald-500/15"
          }`}
        >
          {isProcessing ? (
            <Clock className="h-10 w-10 text-white drop-shadow-md animate-pulse" strokeWidth={2.5} />
          ) : (
            <svg
              className="h-10 w-10 text-white drop-shadow-md"
              viewBox="0 0 24 24"
              fill="none"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  delay: 0.2,
                  duration: 0.45,
                  ease: "easeOut",
                }}
              />
            </svg>
          )}

          {/* Halo decorativo flotante */}
          <span
            className={`absolute -inset-1 -z-10 rounded-3xl opacity-40 blur-lg transition duration-500 ${
              isProcessing ? "bg-amber-400" : "bg-emerald-400"
            }`}
          />
        </motion.div>
      </div>

      {/* Estado y número de orden en pill moderna */}
      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-bold tracking-wider uppercase border shadow-2xs backdrop-blur-md ${
            isProcessing
              ? "bg-amber-500/15 text-amber-700 border-amber-400/50"
              : "bg-emerald-500/15 text-emerald-700 border-emerald-400/50"
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isProcessing ? "animate-ping bg-amber-500" : "bg-emerald-500"
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                isProcessing ? "bg-amber-600" : "bg-emerald-600"
              }`}
            />
          </span>
          {statusLabel}
        </span>

        <button
          type="button"
          onClick={copyOrderNumber}
          title="Copiar número de pedido"
          className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3.5 py-1 text-xs font-semibold text-slate-700 hover:border-amber-400 hover:bg-white hover:text-slate-900 transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
        >
          <span className="font-mono font-bold tracking-wider">{orderNumber}</span>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 font-bold text-[11px]">
              <Check className="h-3 w-3 stroke-[3]" />
              Copiado
            </span>
          ) : (
            <Copy className="h-3 w-3 opacity-50 transition-opacity group-hover:opacity-100" />
          )}
        </button>
      </div>

      {/* Título y subtítulo */}
      <h1 className="font-display mt-5 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
        {title}
      </h1>

      <p className="mx-auto mt-2.5 max-w-xl text-sm text-slate-600 leading-relaxed font-normal sm:text-base">
        {subtitle}
      </p>

      {formattedDate && (
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-slate-100/80 px-3 py-0.5 text-xs text-slate-500 capitalize">
          <Clock className="h-3 w-3 text-slate-400" />
          <span>{formattedDate}</span>
        </div>
      )}
    </div>
  );
}

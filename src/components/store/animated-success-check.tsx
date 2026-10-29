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
      {/* Icono central: Reloj Ámbar si está En Proceso / Check Verde si ya fue Confirmado */}
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 280,
            damping: 20,
          }}
          className={`flex h-20 w-20 items-center justify-center rounded-full shadow-sm ${
            isProcessing
              ? "bg-amber-500 ring-8 ring-amber-500/15"
              : "bg-emerald-500 ring-8 ring-emerald-500/15"
          }`}
        >
          {isProcessing ? (
            <Clock className="h-10 w-10 text-white" strokeWidth={2.5} />
          ) : (
            <svg
              className="h-10 w-10 text-white"
              viewBox="0 0 24 24"
              fill="none"
            >
              <motion.path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  delay: 0.15,
                  duration: 0.35,
                  ease: "easeOut",
                }}
              />
            </svg>
          )}
        </motion.div>
      </div>

      {/* Estado y número de orden */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase border ${
            isProcessing
              ? "bg-amber-50 text-amber-900 border-amber-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isProcessing ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
            }`}
          />
          {statusLabel}
        </span>

        <button
          type="button"
          onClick={copyOrderNumber}
          title="Copiar número de pedido"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer"
        >
          <span className="font-mono font-bold">{orderNumber}</span>
          {copied ? (
            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
              <Check className="h-3.5 w-3.5" />
              Copiado
            </span>
          ) : (
            <Copy className="h-3.5 w-3.5 opacity-60" />
          )}
        </button>
      </div>

      {/* Título y subtítulo */}
      <h1 className="font-display mt-4 text-2xl font-bold tracking-tight text-[var(--wood-950)] sm:text-3xl">
        {title}
      </h1>

      <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--muted)] leading-relaxed">
        {subtitle}
      </p>

      {formattedDate && (
        <p className="mt-3 text-xs text-stone-500 capitalize">
          {formattedDate}
        </p>
      )}
    </div>
  );
}

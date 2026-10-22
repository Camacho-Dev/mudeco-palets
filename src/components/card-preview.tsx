"use client";

import React from "react";
import type { CardBrand, CardCategory } from "@/lib/card-validator";

interface CardPreviewProps {
  cardNumber: string;
  cardholderName: string;
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  brand: CardBrand;
  category: CardCategory;
  isFlipped: boolean;
}

export function CardPreview({
  cardNumber,
  cardholderName,
  expiryMonth,
  expiryYear,
  cvc,
  brand,
  category,
  isFlipped,
}: CardPreviewProps) {
  const displayName = cardholderName.trim()
    ? cardholderName.toUpperCase()
    : "NOMBRE DEL TITULAR";
  const displayExp =
    expiryMonth || expiryYear
      ? `${(expiryMonth || "MM").padStart(2, "0")}/${expiryYear || "AA"}`
      : "MM/AA";

  // Estilos de fondo según la categoría y marca
  const getCardTheme = () => {
    if (category === "DEBIT") {
      return "from-emerald-900 via-teal-950 to-slate-900 text-teal-100 border-teal-500/30";
    }
    if (brand === "amex") {
      return "from-amber-700 via-amber-900 to-stone-950 text-amber-100 border-amber-500/40";
    }
    if (category === "CREDIT") {
      return "from-slate-950 via-zinc-900 to-stone-900 text-amber-200 border-amber-500/30 shadow-amber-950/40";
    }
    return "from-stone-900 via-neutral-900 to-black text-stone-200 border-stone-700/40";
  };

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto h-52 sm:h-56">
      <div
        className={`relative w-full h-full duration-700 ease-out transform-style-3d transition-transform ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRENTE DE LA TARJETA */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br ${getCardTheme()} border shadow-2xl backdrop-blur-md flex flex-col justify-between overflow-hidden backface-hidden`}
        >
          {/* Malla decorativa de fondo */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

          {/* Encabezado: Marca + Badge Débito/Crédito */}
          <div className="flex justify-between items-center z-10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest uppercase opacity-75 font-semibold">
                BANCO EMISOR
              </span>
            </div>

            {/* Badge de Categoría */}
            <div
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                category === "DEBIT"
                  ? "bg-teal-500/20 text-teal-300 border-teal-400/40"
                  : category === "CREDIT"
                  ? "bg-amber-500/20 text-amber-300 border-amber-400/40"
                  : "bg-white/10 text-white/70 border-white/20"
              }`}
            >
              {category === "DEBIT"
                ? "💳 DÉBITO"
                : category === "CREDIT"
                ? "👑 CRÉDITO"
                : "TARJETA"}
            </div>
          </div>

          {/* Chip y Contactless */}
          <div className="flex items-center gap-4 z-10 my-1">
            <div className="w-11 h-8 bg-gradient-to-tr from-amber-300 via-amber-400 to-yellow-200 rounded-md border border-amber-500/60 shadow-inner flex flex-col justify-between p-1">
              <div className="h-0.5 bg-amber-600/40 rounded-full w-full" />
              <div className="h-0.5 bg-amber-600/40 rounded-full w-full" />
              <div className="h-0.5 bg-amber-600/40 rounded-full w-full" />
            </div>

            {/* Ícono de Contactless */}
            <svg
              className="w-6 h-6 opacity-60 text-current"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.117 12a3 3 0 000 4.243M12.36 9.757a6 6 0 010 8.486M16.602 7.514a9 9 0 010 12.728"
              />
            </svg>
          </div>

          {/* Número de Tarjeta */}
          <div className="z-10 tracking-widest font-mono text-lg sm:text-xl font-medium drop-shadow text-center sm:text-left">
            {cardNumber || "•••• •••• •••• ••••"}
          </div>

          {/* Pie: Titular + Expiración + Logo de Red */}
          <div className="flex justify-between items-end z-10">
            <div className="space-y-0.5 max-w-[65%]">
              <p className="text-[9px] uppercase tracking-wider opacity-60">
                Titular de la tarjeta
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold truncate tracking-wide">
                {displayName}
              </p>
            </div>

            <div className="space-y-0.5 text-right">
              <p className="text-[9px] uppercase tracking-wider opacity-60">
                Vence
              </p>
              <p className="font-mono text-xs sm:text-sm font-semibold tracking-wider">
                {displayExp}
              </p>
            </div>

            {/* Logo de la Franquicia */}
            <div className="font-bold font-serif text-sm tracking-wider uppercase bg-white/10 px-2.5 py-1 rounded-md border border-white/10 backdrop-blur-sm">
              {brand === "visa" && <span className="text-blue-400 italic">VISA</span>}
              {brand === "mastercard" && (
                <span className="text-orange-400">Mastercard</span>
              )}
              {brand === "amex" && <span className="text-cyan-300">AMEX</span>}
              {brand === "discover" && <span className="text-orange-300">DISCOVER</span>}
              {brand === "unknown" && <span className="opacity-50">CARD</span>}
              {!["visa", "mastercard", "amex", "discover", "unknown"].includes(brand) && (
                <span className="capitalize">{brand}</span>
              )}
            </div>
          </div>
        </div>

        {/* REVERSO DE LA TARJETA */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br ${getCardTheme()} border shadow-2xl backdrop-blur-md flex flex-col justify-between py-6 overflow-hidden backface-hidden rotate-y-180`}
        >
          {/* Banda Magnética */}
          <div className="w-full h-10 bg-black/90 mt-2" />

          {/* Banda de Firma y CVV */}
          <div className="px-6 space-y-1">
            <div className="flex justify-between items-center text-[9px] text-white/70 tracking-wider">
              <span>FIRMA AUTORIZADA</span>
              <span>CVC / CVV</span>
            </div>
            <div className="w-full bg-white/80 rounded h-9 flex items-center justify-end px-3">
              <span className="font-mono text-slate-950 font-bold tracking-widest text-sm sm:text-base">
                {cvc || "•••"}
              </span>
            </div>
          </div>

          <div className="px-6 text-[9px] opacity-50 space-y-1 text-center">
            <p>Esta tarjeta es propiedad del banco emisor. Uso sujeto a contrato.</p>
            <p className="font-mono text-[8px]">SERVICIO AL CLIENTE: 1-800-000-0000</p>
          </div>
        </div>
      </div>
    </div>
  );
}

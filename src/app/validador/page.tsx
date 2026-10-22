"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CreditCard,
  Info,
  FileEdit,
  Activity,
  ShieldCheck,
  RotateCw,
} from "lucide-react";
import {
  inspectCard,
  formatCardNumber,
  type CardValidationResult,
} from "@/lib/card-validator";
import { CardPreview } from "@/components/card-preview";

export default function CardValidatorPage() {
  const [cardNumber, setCardNumber] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvc, setCvc] = useState("");
  const [isFlipped, setIsFlipped] = useState(false);
  const [simulatedAuth, setSimulatedAuth] = useState<{
    status: "IDLE" | "LOADING" | "SUCCESS" | "FAILED";
    message?: string;
  }>({ status: "IDLE" });

  // Inspección dinámica en tiempo real
  const inspection: CardValidationResult = useMemo(() => {
    return inspectCard({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvc,
      cardholderName,
    });
  }, [cardNumber, expiryMonth, expiryYear, cvc, cardholderName]);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (raw.length <= 19) {
      setCardNumber(formatCardNumber(raw));
    }
  };

  // Botones de prueba rápida
  const loadPreset = (preset: "visa-credit" | "debit" | "amex" | "invalid") => {
    setSimulatedAuth({ status: "IDLE" });
    setIsFlipped(false);
    if (preset === "visa-credit") {
      setCardNumber(formatCardNumber("4242424242424242"));
      setCardholderName("JUAN PEREZ");
      setExpiryMonth("12");
      setExpiryYear("28");
      setCvc("123");
    } else if (preset === "debit") {
      setCardNumber(formatCardNumber("4000001234567890"));
      setCardholderName("MARIA RODRIGUEZ");
      setExpiryMonth("10");
      setExpiryYear("27");
      setCvc("456");
    } else if (preset === "amex") {
      setCardNumber(formatCardNumber("378282246310005"));
      setCardholderName("CARLOS GOMEZ");
      setExpiryMonth("08");
      setExpiryYear("29");
      setCvc("1234");
    } else if (preset === "invalid") {
      setCardNumber(formatCardNumber("4242424242424241")); // Fallo de Luhn
      setCardholderName("PRUEBA INVALIDA");
      setExpiryMonth("01");
      setExpiryYear("22");
      setCvc("999");
    }
  };

  // Simulación didáctica de autorización con pasarela de pago
  const runSimulatedGatewayAuth = () => {
    if (!inspection.isComplete) return;

    const cleanNum = cardNumber.replace(/\D/g, "");
    const isTestCard = cleanNum.startsWith("42424242");

    setSimulatedAuth({ status: "LOADING" });
    setTimeout(() => {
      if (!inspection.isValidLuhn) {
        setSimulatedAuth({
          status: "FAILED",
          message:
            "ESTRUCTURA INVÁLIDA: El número de tarjeta no supera el algoritmo de Luhn (error matemático de checksum). Ningún banco aceptará esta tarjeta.",
        });
      } else if (!inspection.isExpirationValid) {
        setSimulatedAuth({
          status: "FAILED",
          message:
            "TARJETA VENCIDA: La fecha ingresada es igual o anterior al mes/año actual.",
        });
      } else if (isTestCard) {
        setSimulatedAuth({
          status: "SUCCESS",
          message:
            "TARJETA DE PRUEBA APROBADA (Sandbox Stripe): Esta es una tarjeta de test oficial de Stripe utilizada para desarrollo.",
        });
      } else {
        setSimulatedAuth({
          status: "SUCCESS",
          message:
            "ESTRUCTURA MATEMÁTICA CORRECTA: La tarjeta cumple con Luhn, la red Visa/Mastercard y el formato de CVC. Nota: Para confirmar si el plástico físico pertenece a una persona real y tiene fondos disponibles hoy, un sistema de pago real (Stripe/Azul/Bancario) realiza una autorización en vivo por $0.00 USD mediante API privada.",
        });
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500 selection:text-slate-950 font-sans">
      {/* Encabezado */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <CreditCard className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white">
                Validador & Inspector de Tarjetas
              </h1>
              <p className="text-xs text-slate-400">
                Verificador de Débito, Crédito, Algoritmo Luhn y BIN
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            ← Volver al ERP
          </Link>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* presets rápida */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-900/40 border border-slate-800">
          <span className="text-xs font-medium text-slate-400">
            Cargar datos de prueba:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => loadPreset("visa-credit")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20 transition"
            >
              Visa Crédito
            </button>
            <button
              onClick={() => loadPreset("debit")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20 hover:bg-teal-500/20 transition"
            >
              Visa Débito
            </button>
            <button
              onClick={() => loadPreset("amex")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20 transition"
            >
              Amex Crédito
            </button>
            <button
              onClick={() => loadPreset("invalid")}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 transition"
            >
              Tarjeta Inválida
            </button>
          </div>
        </div>

        {/* Nota informativa didáctica sobre privacidad y fecha de vencimiento */}
        <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 leading-relaxed flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-100 mb-0.5">
              ¿Por qué debes introducir la Fecha de Vencimiento manualmente?
            </p>
            <p className="text-blue-300/90">
              Por razones de seguridad internacional (**PCI-DSS**), el número de 16 dígitos de una tarjeta **NO almacena ni codifica la fecha de vencimiento ni el CVC dentro de sus dígitos**. Esos datos solo están impresos en el plástico físico y almacenados en la base de datos privada del banco emisor. La aplicación valida el **Algoritmo de Luhn, la Franquicia y el tipo Débito/Crédito por BIN**, mientras verifica que la fecha que escribes sea vigente.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Vista Previa 3D + Diagnóstico */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-4 text-center">
                Vista Previa de Tarjeta Virtual 3D
              </h2>
              <CardPreview
                cardNumber={cardNumber}
                cardholderName={cardholderName}
                expiryMonth={expiryMonth}
                expiryYear={expiryYear}
                cvc={cvc}
                brand={inspection.brand}
                category={inspection.category}
                isFlipped={isFlipped}
              />
              <p className="text-[11px] text-center text-slate-500 mt-4">
                Haz clic en el campo CVC para girar la tarjeta
              </p>
            </div>

            {/* Panel de Diagnóstico Rápido */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center justify-between">
                <span>Resultado del Análisis</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    inspection.score === 100
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : inspection.score >= 60
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  Puntaje: {inspection.score}%
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Tipo de Tarjeta
                  </p>
                  <p
                    className={`font-semibold text-sm mt-0.5 ${
                      inspection.category === "DEBIT"
                        ? "text-teal-300"
                        : inspection.category === "CREDIT"
                        ? "text-amber-300"
                        : "text-slate-300"
                    }`}
                  >
                    {inspection.categoryName}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Franquicia / Red
                  </p>
                  <p className="font-semibold text-sm mt-0.5 text-white capitalize">
                    {inspection.brandName}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    Banco Emisor (BIN)
                  </p>
                  <p className="font-semibold text-xs mt-0.5 text-amber-200 truncate">
                    {inspection.issuerGuess || "Identificando..."}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                    País de Origen
                  </p>
                  <p className="font-semibold text-xs mt-0.5 text-slate-300 truncate">
                    {inspection.countryGuess || "Internacional"}
                  </p>
                </div>
              </div>

              {/* Lista de Verificaciones */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Algoritmo de Luhn (Checksum):</span>
                  <span
                    className={`font-semibold ${
                      inspection.isValidLuhn
                        ? "text-emerald-400"
                        : cardNumber.length >= 13
                        ? "text-rose-400"
                        : "text-slate-500"
                    }`}
                  >
                    {inspection.isValidLuhn
                      ? "✓ VÁLIDO"
                      : cardNumber.length >= 13
                      ? "✗ INVÁLIDO"
                      : "Pendiente"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Longitud de Dígitos:</span>
                  <span
                    className={`font-semibold ${
                      inspection.isLengthValid
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {inspection.currentLength} dígitos (Esperado:{" "}
                    {inspection.expectedLength.join(" o ")})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Fecha de Vencimiento:</span>
                  <span
                    className={`font-semibold ${
                      inspection.isExpirationValid
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {inspection.isExpirationValid ? "✓ VIGENTE" : "Revisar MM/AA"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs py-1">
                  <span className="text-slate-300">Formato CVC / CVV:</span>
                  <span
                    className={`font-semibold ${
                      inspection.isCvcValid
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }`}
                  >
                    {inspection.isCvcValid ? "✓ CORRECTO" : "Incompleto"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Formulario + Simulador de Pasarela */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-5">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center gap-2">
                <FileEdit className="w-4 h-4 text-amber-400" />
                <span>Formulario de Entrada de Datos</span>
              </h2>

              <div className="space-y-4">
                {/* Número de Tarjeta */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Número de Tarjeta (13 a 19 dígitos)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="4000 0000 0000 0000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-base tracking-widest focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                {/* Nombre del Titular */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                    Nombre del Titular (Como aparece en el plástico)
                  </label>
                  <input
                    type="text"
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    onFocus={() => setIsFlipped(false)}
                    placeholder="EJ. JUAN PEREZ"
                    className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm uppercase focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                  />
                </div>

                {/* Expiración y CVC */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Mes (MM)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={expiryMonth}
                      onChange={(e) =>
                        setExpiryMonth(e.target.value.replace(/\D/g, ""))
                      }
                      onFocus={() => setIsFlipped(false)}
                      placeholder="12"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Año (AA)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={expiryYear}
                      onChange={(e) =>
                        setExpiryYear(e.target.value.replace(/\D/g, ""))
                      }
                      onFocus={() => setIsFlipped(false)}
                      placeholder="28"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, ""))}
                      onFocus={() => setIsFlipped(true)}
                      onBlur={() => setIsFlipped(false)}
                      placeholder="123"
                      className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-center text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Módulo Didáctico: Simulador de Pasarela de Pago */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  <span>Simulador de Verificación Bancaria en Vivo</span>
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Modo Sandbox
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Para verificar si una tarjeta está **realmente activa con fondos en un banco**, las pasarelas reales (Stripe, Azul, Visa, Mastercard) envían una solicitud de autorización por $0.00 USD con verificación AVS y 3D Secure.
              </p>

              <button
                onClick={runSimulatedGatewayAuth}
                disabled={!inspection.isComplete || simulatedAuth.status === "LOADING"}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  inspection.isComplete
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {simulatedAuth.status === "LOADING" ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Conectando con Red Bancaria Visa/Mastercard...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Simular Verificación de Autorización Bancaria</span>
                  </>
                )}
              </button>

              {simulatedAuth.status !== "IDLE" && simulatedAuth.message && (
                <div
                  className={`p-4 rounded-xl text-xs font-medium leading-relaxed border ${
                    simulatedAuth.status === "SUCCESS"
                      ? "bg-emerald-950/40 text-emerald-300 border-emerald-500/30"
                      : "bg-rose-950/40 text-rose-300 border-rose-500/30"
                  }`}
                >
                  {simulatedAuth.message}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

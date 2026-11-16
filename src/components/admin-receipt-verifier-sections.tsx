"use client";

import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { formatMoney } from "./admin-receipt-verifier-parts";

/** Las 3 confirmaciones obligatorias de seguridad. */
export function ConfirmationChecks({
  check1,
  setCheck1,
  check2,
  setCheck2,
  check3,
  setCheck3,
  disabled,
  validPartial,
  parsedPartial,
  paidPercent,
  remainingBalance,
  balanceCondition,
  customerName,
  totalFormatted,
}: {
  check1: boolean;
  setCheck1: (v: boolean) => void;
  check2: boolean;
  setCheck2: (v: boolean) => void;
  check3: boolean;
  setCheck3: (v: boolean) => void;
  disabled: boolean;
  validPartial: boolean;
  parsedPartial: number;
  paidPercent: number;
  remainingBalance: number;
  balanceCondition: string;
  customerName: string;
  totalFormatted: string;
}) {
  return (
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
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled}
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
  );
}

/** Menú desplegable de opciones avanzadas (pago parcial / abono inicial). */
export function AdvancedPaymentOptions({
  showAdvanced,
  setShowAdvanced,
  validPartial,
  parsedPartial,
  isPartialPayment,
  setIsPartialPayment,
  partialAmountInput,
  setPartialAmountInput,
  numericTotal,
  paidPercent,
  remainingBalance,
  balanceCondition,
  setBalanceCondition,
}: {
  showAdvanced: boolean;
  setShowAdvanced: (v: boolean) => void;
  validPartial: boolean;
  parsedPartial: number;
  isPartialPayment: boolean;
  setIsPartialPayment: (v: boolean) => void;
  partialAmountInput: string;
  setPartialAmountInput: (v: string) => void;
  numericTotal: number;
  paidPercent: number;
  remainingBalance: number;
  balanceCondition: string;
  setBalanceCondition: (v: string) => void;
}) {
  return (
    <div className="mt-3.5 rounded-xl border border-stone-200 bg-stone-50/60 overflow-hidden transition">
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex w-full items-center justify-between px-3.5 py-2.5 text-xs font-bold text-[var(--wood-900)] hover:bg-stone-100/80 transition select-none cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-gold-strong" />
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
        <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-gold-strong">
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
              className="h-4 w-4 rounded border-stone-300 text-brand-gold-strong focus:ring-brand-gold-strong"
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
                    className="w-full rounded-lg border border-stone-300 bg-white pl-11 pr-3 py-2 text-xs font-bold text-[var(--wood-950)] focus:border-brand-gold-strong focus:outline-none focus:ring-1 focus:ring-brand-gold-strong"
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
  );
}

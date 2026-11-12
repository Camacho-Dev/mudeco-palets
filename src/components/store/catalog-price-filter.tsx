"use client";

import { useEffect, useId, useMemo, useState } from "react";

type Range = [number, number];

type Preset = { label: string; min: number; max: number };

const BINS = 28;
const STEP = 250;

function formatRD(n: number) {
  return `RD$ ${Math.round(n).toLocaleString("es-DO")}`;
}

/** Campo de monto editable: acepta "12,500", "12500" o "RD$ 12 500" */
function AmountInput({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: number;
  onCommit: (n: number) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value.toLocaleString("es-DO"));

  useEffect(() => {
    setDraft(value.toLocaleString("es-DO"));
  }, [value]);

  function commit() {
    const digits = draft.replace(/[^\d]/g, "");
    if (!digits) {
      setDraft(value.toLocaleString("es-DO"));
      return;
    }
    onCommit(Number(digits));
  }

  return (
    <div className="flex-1">
      <label
        htmlFor={id}
        className="mb-1.5 block text-[0.68rem] font-semibold tracking-[0.12em] text-[#8a7a6a] uppercase"
      >
        {label}
      </label>
      <div className="flex h-11 items-center rounded-xl border border-[#e4ddd2] bg-white px-3.5 transition focus-within:border-[#c9a15a] focus-within:ring-2 focus-within:ring-[#c9a15a]/20">
        <span className="mr-2 text-xs font-medium text-[#a39483]">RD$</span>
        <input
          id={id}
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
            }
          }}
          className="w-full bg-transparent text-sm font-semibold text-[#1b1511] tabular-nums outline-none"
        />
      </div>
    </div>
  );
}

export function CatalogPriceFilter({
  prices,
  limits,
  value,
  presets,
  resultCount,
  onChange,
}: {
  prices: number[];
  limits: Range;
  value: Range;
  presets: Preset[];
  resultCount: number;
  onChange: (next: Range) => void;
}) {
  const [minLimit, maxLimit] = limits;
  const span = Math.max(1, maxLimit - minLimit);

  // Distribución de precios del catálogo para el histograma
  const bins = useMemo(() => {
    const counts = new Array<number>(BINS).fill(0);
    for (const p of prices) {
      const idx = Math.min(
        BINS - 1,
        Math.max(0, Math.floor(((p - minLimit) / span) * BINS)),
      );
      counts[idx] += 1;
    }
    const peak = Math.max(1, ...counts);
    return counts.map((c, i) => ({
      height: c === 0 ? 0 : 18 + (c / peak) * 82,
      from: minLimit + (span / BINS) * i,
      to: minLimit + (span / BINS) * (i + 1),
    }));
  }, [prices, minLimit, span]);

  const showHistogram = prices.length >= 12;

  const pct = (n: number) =>
    Math.max(0, Math.min(100, ((n - minLimit) / span) * 100));
  const left = pct(value[0]);
  const right = pct(value[1]);

  function setMin(n: number) {
    const clamped = Math.max(minLimit, Math.min(n, value[1] - STEP));
    onChange([clamped, value[1]]);
  }

  function setMax(n: number) {
    const clamped = Math.min(maxLimit, Math.max(n, value[0] + STEP));
    onChange([value[0], clamped]);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1b1511]">Rango de precio</p>
          <p className="mt-0.5 text-xs text-[#8a7a6a]">
            Precios del catálogo entre {formatRD(minLimit)} y {formatRD(maxLimit)}
          </p>
        </div>
        <p className="text-xs text-[#8a7a6a]">
          <span className="font-semibold text-[#1b1511] tabular-nums">
            {resultCount}
          </span>{" "}
          {resultCount === 1 ? "pieza" : "piezas"} en este rango
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-10">
        {/* Histograma (solo con suficientes piezas para que sea útil) + slider doble */}
        <div className="px-2.5 select-none lg:col-span-7">
          <div
            className={`items-end gap-[3px] ${showHistogram ? "flex h-16" : "hidden"}`}
            aria-hidden
          >
            {bins.map((b, i) => {
              const inRange = b.to > value[0] && b.from < value[1];
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[3px] transition-colors duration-200 ${
                    inRange ? "bg-[#c9a15a]" : "bg-[#e9e2d7]"
                  }`}
                  style={{ height: `${b.height}%` }}
                />
              );
            })}
          </div>

          <div className="relative h-6">
            <div className="absolute top-1/2 left-0 h-[3px] w-full -translate-y-1/2 rounded-full bg-[#e9e2d7]" />
            <div
              className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#1b1511]"
              style={{ left: `${left}%`, width: `${Math.max(0, right - left)}%` }}
            />
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={STEP}
              value={value[0]}
              onChange={(e) => setMin(Number(e.target.value))}
              aria-label="Precio mínimo"
              aria-valuetext={formatRD(value[0])}
              className="price-slider-input"
            />
            <input
              type="range"
              min={minLimit}
              max={maxLimit}
              step={STEP}
              value={value[1]}
              onChange={(e) => setMax(Number(e.target.value))}
              aria-label="Precio máximo"
              aria-valuetext={formatRD(value[1])}
              className="price-slider-input"
            />
          </div>
        </div>

        <div className="space-y-4 lg:col-span-5">
          {/* Montos exactos */}
          <div className="flex items-end gap-3">
            <AmountInput label="Mínimo" value={value[0]} onCommit={setMin} />
            <span className="mb-3 h-px w-4 shrink-0 bg-[#d8cfc2]" aria-hidden />
            <AmountInput label="Máximo" value={value[1]} onCommit={setMax} />
          </div>

          {/* Atajos */}
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => {
              const active = value[0] === p.min && value[1] === p.max;
              return (
                <button
                  key={p.label}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange([p.min, p.max])}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? "border-[#1b1511] bg-[#1b1511] text-white"
                      : "border-[#e4ddd2] bg-white text-[#5c4f43] hover:border-[#c9a15a] hover:text-[#1b1511]"
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarRange } from "lucide-react";
import {
  DATE_FILTER_STORAGE_KEY,
  monthOptions,
  type PeriodKind,
  type StoredDateFilter,
  buildDateRange,
  currentMonthKey,
} from "@/lib/date-range";

function readStored(): StoredDateFilter | null {
  try {
    const raw = localStorage.getItem(DATE_FILTER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredDateFilter;
  } catch {
    return null;
  }
}

function saveStored(value: StoredDateFilter) {
  localStorage.setItem(DATE_FILTER_STORAGE_KEY, JSON.stringify(value));
}

export function DateFilterBar({ label }: { label?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const months = useMemo(() => monthOptions(24), []);

  const urlKind = (searchParams.get("kind") as PeriodKind | null) || null;
  const urlMonth = searchParams.get("month");
  const urlFrom = searchParams.get("from");
  const urlTo = searchParams.get("to");

  const [kind, setKind] = useState<PeriodKind>(urlKind || "month");
  const [month, setMonth] = useState(urlMonth || currentMonthKey());
  const [from, setFrom] = useState(urlFrom || "");
  const [to, setTo] = useState(urlTo || "");
  const [hydrated, setHydrated] = useState(false);

  // Restaura filtro guardado si la URL no trae parámetros
  useEffect(() => {
    if (hydrated) return;
    setHydrated(true);

    if (urlKind || urlMonth || urlFrom || urlTo) {
      const stored: StoredDateFilter = {
        kind: urlKind || "month",
        month: urlMonth || undefined,
        from: urlFrom || undefined,
        to: urlTo || undefined,
      };
      saveStored(stored);
      return;
    }

    const stored = readStored();
    if (!stored) return;

    setKind(stored.kind || "month");
    if (stored.month) setMonth(stored.month);
    if (stored.from) setFrom(stored.from);
    if (stored.to) setTo(stored.to);

    const params = new URLSearchParams(searchParams.toString());
    params.set("kind", stored.kind || "month");
    if (stored.month) params.set("month", stored.month);
    else params.delete("month");
    if (stored.from) params.set("from", stored.from);
    else params.delete("from");
    if (stored.to) params.set("to", stored.to);
    else params.delete("to");

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }, [
    hydrated,
    urlKind,
    urlMonth,
    urlFrom,
    urlTo,
    pathname,
    router,
    searchParams,
  ]);

  function apply(next: StoredDateFilter) {
    saveStored(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("kind", next.kind);
    if (next.month) params.set("month", next.month);
    else params.delete("month");
    if (next.from) params.set("from", next.from);
    else params.delete("from");
    if (next.to) params.set("to", next.to);
    else params.delete("to");

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const preview = buildDateRange({ kind, month, from, to });

  return (
    <div className="card mb-6 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <CalendarRange className="h-4 w-4 text-[var(--brass)]" />
        <p className="text-sm font-semibold text-[var(--wood-900)]">
          {label || "Filtro de fecha"}
        </p>
        <span className="rounded-full bg-[#f3ebe3] px-2.5 py-0.5 text-xs text-[var(--wood-800)]">
          {preview.label}
        </span>
        {pending ? (
          <span className="text-xs text-[var(--muted)]">Actualizando…</span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["month", "Mes completo"],
            ["q1", "Días 1–15"],
            ["q2", "Días 16–fin"],
            ["last15", "Últimos 15 días"],
            ["custom", "Personalizado"],
            ["all", "Todo"],
          ] as [PeriodKind, string][]
        ).map(([k, text]) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              apply({
                kind: k,
                month: k === "last15" || k === "all" || k === "custom" ? undefined : month,
                from: k === "custom" ? from || undefined : undefined,
                to: k === "custom" ? to || undefined : undefined,
              });
            }}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              kind === k
                ? "bg-[#3d2a1f] text-[#faf6f1]"
                : "border border-[var(--border)] bg-white text-[var(--muted)] hover:border-[var(--wood-700)]"
            }`}
          >
            {text}
          </button>
        ))}
      </div>

      {(kind === "month" || kind === "q1" || kind === "q2") && (
        <div className="mt-3 max-w-xs">
          <label className="label">Mes</label>
          <select
            className="input"
            value={month}
            onChange={(e) => {
              const m = e.target.value;
              setMonth(m);
              apply({ kind, month: m });
            }}
          >
            {months.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {kind === "custom" && (
        <div className="mt-3 grid max-w-lg gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <div>
            <label className="label">Desde</label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Hasta</label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={!from || !to}
              onClick={() =>
                apply({ kind: "custom", from, to })
              }
            >
              Aplicar
            </button>
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-[var(--muted)]">
        El historial queda guardado en el sistema. Este filtro solo cambia lo
        que ves; tu selección también se guarda para la próxima visita.
      </p>
    </div>
  );
}

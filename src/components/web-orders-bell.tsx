"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, Globe, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { webOrderTypeLabel } from "@/lib/web-order-labels";

export type PendingWebOrderSummary = {
  id: string;
  number: string;
  customerName: string;
  total: number;
  type: string;
  serviceKind: string | null;
  status: string;
  createdAt: string | Date;
};

export function WebOrdersBell({
  orders,
  totalCount,
}: {
  orders: PendingWebOrderSummary[];
  totalCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = totalCount ?? orders.length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-white text-[var(--wood-900)] shadow-sm transition hover:border-[#b0894f] hover:bg-[#fbf7f2]"
        title="Notificaciones de pedidos web"
        aria-label="Notificaciones de pedidos web"
      >
        <Bell className="h-4 w-4" />
        {count > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b0894f] px-1 text-[10px] font-bold text-[#2c1d14] shadow-sm">
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[var(--border)] bg-white p-4 shadow-2xl z-50 animate-rise">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-[#b0894f]" />
              <span className="font-semibold text-sm text-[var(--wood-950)]">
                Pedidos Web Recientes
              </span>
            </div>
            {count > 0 ? (
              <span className="rounded-full bg-[#b0894f]/15 px-2 py-0.5 text-[0.68rem] font-bold text-[#8a652f]">
                {count} por atender
              </span>
            ) : null}
          </div>

          <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
            {orders.length === 0 ? (
              <div className="py-6 text-center text-xs text-[var(--muted)]">
                <CheckCircle2 className="mx-auto mb-1.5 h-6 w-6 text-emerald-600 opacity-60" />
                <p className="font-medium text-[var(--wood-900)]">¡Todo al día!</p>
                <p className="mt-0.5">No hay pedidos web pendientes de atención</p>
              </div>
            ) : (
              orders.map((o) => {
                const kind = webOrderTypeLabel(o);
                return (
                  <Link
                    key={o.id}
                    href={`/pedidos-web/${o.id}`}
                    onClick={() => setOpen(false)}
                    className="group block rounded-xl border border-[var(--border)] bg-[#fbf7f2]/50 p-3 text-xs transition hover:border-[#b0894f] hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[var(--wood-950)] group-hover:text-[#b0894f]">
                        {o.number}
                      </span>
                      <span className="rounded bg-white border border-[var(--border)] px-1.5 py-0.2 text-[0.65rem] text-[var(--muted)]">
                        {kind}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <p className="font-medium text-[var(--wood-900)] truncate">
                        {o.customerName}
                      </p>
                      <span className="font-bold text-[var(--wood-950)]">
                        {formatCurrency(o.total)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[0.68rem] text-[var(--muted)]">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 opacity-60" />
                        {formatDate(o.createdAt)}
                      </span>
                      <span className="text-[#b0894f] font-semibold group-hover:underline flex items-center gap-0.5">
                        Ver orden <ArrowUpRight className="h-2.5 w-2.5" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <div className="mt-3 border-t border-[var(--border)] pt-2.5 text-center">
            <Link
              href="/pedidos-web"
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-[#b0894f] hover:underline"
            >
              Ver bandeja completa de pedidos web →
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

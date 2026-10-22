"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileText, Users, Package, ShoppingCart, ArrowRight } from "lucide-react";
import Link from "next/link";

export function DashboardSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/buscar?q=${encodeURIComponent(q)}`);
  }

  const quickLinks = [
    { label: "Facturas", href: "/facturas", icon: FileText },
    { label: "Clientes", href: "/clientes", icon: Users },
    { label: "Inventario", href: "/inventario", icon: Package },
    { label: "Pedidos web", href: "/pedidos-web", icon: ShoppingCart },
  ];

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white p-4 sm:p-5 shadow-sm">
      <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#b0894f]"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Buscar por cliente, RNC, número de factura, SKU o pedido web…"
            className="h-12 w-full rounded-xl border border-slate-200 bg-[#fbf7f2]/50 pl-12 pr-10 text-sm text-[var(--wood-950)] placeholder:text-slate-400 outline-none transition focus:border-[#b0894f] focus:bg-white focus:ring-4 focus:ring-[#b0894f]/15"
            aria-label="Buscador del panel"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={!query.trim()}
          className="btn btn-primary h-12 px-5 text-sm font-semibold flex items-center gap-2 shrink-0 disabled:opacity-50"
        >
          <span>Buscar</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Enlaces de acceso rápido */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
        <span className="font-medium text-slate-500">Acceso rápido:</span>
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-slate-700 hover:border-[#b0894f] hover:text-[var(--wood-950)] transition"
          >
            <item.icon className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

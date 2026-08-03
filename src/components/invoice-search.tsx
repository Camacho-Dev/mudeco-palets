"use client";

import { FormEvent, useEffect, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { IconField } from "@/components/icon-field";

export function ListSearchBar({
  placeholder = "Buscar…",
  ariaLabel = "Buscar",
}: {
  placeholder?: string;
  ariaLabel?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const urlQ = searchParams.get("q") || "";
  const [q, setQ] = useState(urlQ);

  useEffect(() => {
    setQ(urlQ);
  }, [urlQ]);

  function apply(nextQ: string) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmed = nextQ.trim();
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    const s = params.toString();
    startTransition(() => {
      router.push(s ? `${pathname}?${s}` : pathname);
    });
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    apply(q);
  }

  function clear() {
    setQ("");
    apply("");
  }

  return (
    <form onSubmit={onSubmit} className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[240px] flex-1">
        <IconField
          icon={<Search strokeWidth={2.25} />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
        {q ? (
          <button
            type="button"
            onClick={clear}
            className="absolute top-1/2 right-2 z-10 -translate-y-1/2 rounded p-1 text-[var(--muted)] hover:bg-[#f3ebe3] hover:text-[var(--wood-900)]"
            aria-label="Limpiar búsqueda"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <button type="submit" className="btn btn-secondary" disabled={pending}>
        {pending ? "Buscando…" : "Buscar"}
      </button>
    </form>
  );
}

/** @deprecated use ListSearchBar */
export function InvoiceSearchBar() {
  return (
    <ListSearchBar
      placeholder="Buscar por número, NCF, cliente, RNC o notas…"
      ariaLabel="Buscar facturas"
    />
  );
}

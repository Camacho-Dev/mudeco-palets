"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Search } from "lucide-react";

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 z-10 h-4 w-4 -translate-y-1/2 text-[#b0894f]"
        strokeWidth={2.25}
        aria-hidden
      />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar…"
        className="h-9 w-full rounded-lg border border-white/15 bg-white/95 py-2 pr-3 pl-10 text-sm text-[#3d2a1f] placeholder:text-[#7a6a5c] outline-none focus:border-[#b0894f] focus:ring-2 focus:ring-[#b0894f]/25"
        aria-label="Búsqueda global"
      />
    </form>
  );
}

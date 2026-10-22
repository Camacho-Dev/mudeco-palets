"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function StoreHomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(
      trimmed
        ? `/catalogo?q=${encodeURIComponent(trimmed)}`
        : "/catalogo",
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full overflow-hidden border border-white/[0.1] bg-[#141414] transition focus-within:border-[#c9a15a]/55"
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar mesas, camas, reparaciones…"
        className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/35"
        aria-label="Buscar en la tienda"
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 bg-[#c9a15a] px-5 text-[0.7rem] font-semibold tracking-[0.12em] text-[#0a0a0a] uppercase transition duration-300 hover:bg-[#d4b06e]"
      >
        <Search className="h-4 w-4" strokeWidth={2} />
        <span className="hidden sm:inline">Buscar</span>
      </button>
    </form>
  );
}

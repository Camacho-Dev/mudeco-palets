"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="no-print fixed top-3 left-3 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-[#3d2a1f] text-white shadow md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open ? (
        <div className="no-print fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <div className="relative h-full w-[min(18rem,85vw)] overflow-y-auto bg-[#3d2a1f]">
            <button
              type="button"
              className="absolute top-3 right-3 rounded-md p-1 text-white/70"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
            >
              <X className="h-5 w-5" />
            </button>
            <div onClick={() => setOpen(false)}>{children}</div>
          </div>
        </div>
      ) : null}
    </>
  );
}

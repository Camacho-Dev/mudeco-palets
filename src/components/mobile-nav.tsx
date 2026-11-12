"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

export function MobileNav({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="no-print fixed top-2 left-3 z-40 flex h-9 w-9 items-center justify-center rounded-lg bg-[#0a0f1d] text-white shadow-sm transition-transform active:scale-95 md:hidden cursor-pointer"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open ? (
          <div className="no-print fixed inset-0 z-50 md:hidden">
            <motion.button
              type="button"
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs"
              aria-label="Cerrar"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.2 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Menú principal"
              className="relative h-full w-[min(18rem,85vw)] overflow-y-auto bg-[#0a0f1d] shadow-2xl"
              initial={reduce ? { opacity: 0 } : { x: "-100%" }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: "-100%" }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 380, damping: 38 }
              }
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest("a")) {
                  setOpen(false);
                }
              }}
            >
              <button
                type="button"
                className="absolute top-3 right-3 rounded-md p-1.5 text-white/70 hover:bg-white/10 hover:text-white cursor-pointer"
                onClick={() => setOpen(false)}
                aria-label="Cerrar menú"
              >
                <X className="h-5 w-5" />
              </button>
              <div>{children}</div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

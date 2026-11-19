"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";

const SEEN_PREFIX = "mudeco_welcome_seen:";
const RETURNING_SESSION_PREFIX = "mudeco_returning_greeted:";
const NEW_ACCOUNT_WINDOW_MS = 15 * 60 * 1000;
const RETURNING_TOAST_MS = 5500;
const EASE = [0.16, 1, 0.3, 1] as const;

type SessionUserWithMeta = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
};

/**
 * Bienvenida contextual para clientes en la tienda:
 * - Primera vez (registro o primer acceso Google): modal editorial Atelier Noir.
 * - Cliente recurrente: toast compacto en la esquina inferior izquierda.
 */
export function NewUserWelcome() {
  const { data: session, status } = useSession();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [returningOpen, setReturningOpen] = useState(false);

  const user = session?.user as SessionUserWithMeta | undefined;
  const email = user?.email?.trim().toLowerCase() || "";
  const displayName = user?.name?.trim() || "cliente";
  const firstName = displayName.split(/\s+/)[0] || "bienvenido";

  useEffect(() => {
    if (status !== "authenticated" || !email) return;
    if (user?.role && user.role !== "CLIENTE") return;

    let alreadySawWelcome = false;
    try {
      alreadySawWelcome = Boolean(localStorage.getItem(`${SEEN_PREFIX}${email}`));
    } catch {
      alreadySawWelcome = false;
    }

    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const fromSignupParam = params?.get("bienvenido") === "1";

    const createdAtMs = user?.createdAt ? Date.parse(user.createdAt) : NaN;
    const isFreshAccount =
      !Number.isNaN(createdAtMs) &&
      Date.now() - createdAtMs <= NEW_ACCOUNT_WINDOW_MS;

    if (!alreadySawWelcome && (fromSignupParam || isFreshAccount)) {
      const id = window.setTimeout(() => setOpen(true), 0);
      return () => window.clearTimeout(id);
    }

    let alreadyGreetedInSession = false;
    try {
      alreadyGreetedInSession = Boolean(
        sessionStorage.getItem(`${RETURNING_SESSION_PREFIX}${email}`),
      );
    } catch {
      alreadyGreetedInSession = false;
    }

    if (!alreadyGreetedInSession) {
      try {
        sessionStorage.setItem(`${RETURNING_SESSION_PREFIX}${email}`, "1");
      } catch {
        /* ignore */
      }
      const showTimer = window.setTimeout(() => setReturningOpen(true), 120);
      const hideTimer = window.setTimeout(
        () => setReturningOpen(false),
        120 + RETURNING_TOAST_MS,
      );
      return () => {
        window.clearTimeout(showTimer);
        window.clearTimeout(hideTimer);
      };
    }
  }, [status, email, user?.role, user?.createdAt]);

  function dismiss() {
    setOpen(false);
    if (email) {
      try {
        localStorage.setItem(`${SEEN_PREFIX}${email}`, "1");
        sessionStorage.setItem(`${RETURNING_SESSION_PREFIX}${email}`, "1");
      } catch {
        /* ignore */
      }
    }
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("bienvenido")) {
        url.searchParams.delete("bienvenido");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, email]);

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
            onClick={dismiss}
          >
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#c9a15a]/25 bg-[#120f0c]/95 px-7 pb-7 pt-9 sm:px-9 sm:pb-8 sm:pt-10 text-center text-white shadow-[0_28px_80px_rgba(0,0,0,0.65)]"
            >
              {/* Línea dorada sutil superior */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-[#c9a15a]/70 to-transparent"
              />

              <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar mensaje de bienvenida"
                className="absolute right-3.5 top-3.5 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#c9a15a]">
                Mudeco Palets · Tu cuenta está lista
              </p>

              <h2
                id="welcome-modal-title"
                className="font-display mt-3 text-3xl sm:text-4xl font-normal tracking-tight text-white text-balance"
              >
                Bienvenido, {firstName}
              </h2>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-white/70 text-pretty">
                Ya puedes explorar piezas listas para entrega, encargar diseños a tu
                medida y seguir tus pedidos y facturas desde tu cuenta.
              </p>

              <div className="mt-6 flex items-center justify-center gap-3 border-y border-white/[0.08] py-3 text-[11px] text-white/60">
                <span>Madera curada</span>
                <span aria-hidden className="text-[#c9a15a]">·</span>
                <span>A tu medida</span>
                <span aria-hidden className="text-[#c9a15a]">·</span>
                <span>Seguimiento en vivo</span>
              </div>

              <div className="mt-6 flex flex-col items-center gap-2.5">
                <Link
                  href="/catalogo"
                  onClick={dismiss}
                  className="store-cta inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full bg-[#c9a15a] px-6 py-3 text-sm font-semibold text-[#0f0d0a] transition hover:bg-[#d4b06e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <span>Explorar catálogo</span>
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>

                <button
                  type="button"
                  onClick={dismiss}
                  className="inline-flex min-h-[44px] items-center justify-center rounded-full px-5 py-2 text-xs font-medium text-white/65 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] cursor-pointer"
                >
                  Continuar en la portada
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saludo compacto abajo a la izquierda para usuarios recurrentes */}
      <AnimatePresence>
        {returningOpen && !open && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={reduce ? { opacity: 1 } : { opacity: 0, y: 14, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: reduce ? 0 : 0.24, ease: EASE }}
            className="fixed bottom-5 left-4 sm:left-6 z-[110] flex max-w-[calc(100vw-5.5rem)] sm:max-w-sm items-center gap-3 rounded-2xl border border-[#c9a15a]/30 bg-[#14100d]/95 pl-4 pr-2 py-2.5 text-white shadow-[0_14px_40px_rgba(0,0,0,0.45)] backdrop-blur-md"
          >
            <span
              aria-hidden
              className="h-2 w-2 shrink-0 rounded-full bg-[#c9a15a] shadow-[0_0_8px_rgba(201,161,90,0.8)]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-white">
                Bienvenido nuevamente,{" "}
                <span className="text-[#c9a15a]">{firstName}</span>
              </p>
              <p className="truncate text-[11px] text-white/65">
                Qué gusto verte por Mudeco Palets.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setReturningOpen(false)}
              aria-label="Cerrar saludo"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white/55 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

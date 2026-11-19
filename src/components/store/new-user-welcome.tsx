"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Compass, FileText, Sparkles, X } from "lucide-react";

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
 * - Primera vez (registro o primer acceso Google): modal editorial completo.
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

    // Usuario recurrente: saludar una vez por sesión de navegación
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
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
            onClick={dismiss}
          >
            <motion.div
              initial={reduce ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 8 }}
              transition={{ duration: reduce ? 0 : 0.28, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-[#c9a15a]/30 bg-[#14100d] p-7 sm:p-9 text-white shadow-[0_30px_90px_rgba(0,0,0,0.65)]"
            >
              {/* Halo dorado sutil superior */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-[#c9a15a]/15 blur-3xl"
              />

              <button
                type="button"
                onClick={dismiss}
                aria-label="Cerrar mensaje de bienvenida"
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full text-white/60 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c9a15a]">
                  <Sparkles className="h-3.5 w-3.5" aria-hidden />
                  <span>Tu cuenta ya está activa</span>
                </div>

                <div>
                  <h2
                    id="welcome-modal-title"
                    className="font-display text-3xl sm:text-4xl font-semibold tracking-tight text-white text-balance"
                  >
                    ¡Bienvenido a Mudeco Palets, {firstName}!
                  </h2>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/75 text-pretty">
                    Nos alegra tenerte en nuestro taller. Desde hoy puedes comprar piezas
                    listas para entrega, encargar muebles a tu medida y seguir cada
                    pedido en tiempo real.
                  </p>
                </div>

                <div className="grid gap-3 pt-1">
                  <div className="flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <Compass className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a15a]" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Catálogo artesanal y por encargo
                      </p>
                      <p className="mt-0.5 text-xs text-white/65">
                        Madera de pino curada, acabados finos y disponibilidad actualizada.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5">
                    <FileText className="mt-0.5 h-4 w-4 shrink-0 text-[#c9a15a]" aria-hidden />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        Pedidos, comprobantes y facturas PDF
                      </p>
                      <p className="mt-0.5 text-xs text-white/65">
                        Consulta tus compras y descarga tus documentos desde{" "}
                        <span className="text-white/90 font-medium">Mis pedidos</span>.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                  <Link
                    href="/catalogo"
                    onClick={dismiss}
                    className="store-cta inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-full bg-[#c9a15a] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#0f0d0a] transition hover:bg-[#d4b06e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span>Explorar catálogo</span>
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    onClick={dismiss}
                    className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-white/15 px-5 py-3 text-xs font-semibold text-white/85 transition hover:border-white/30 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c9a15a] cursor-pointer"
                  >
                    Continuar aquí
                  </button>
                </div>
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

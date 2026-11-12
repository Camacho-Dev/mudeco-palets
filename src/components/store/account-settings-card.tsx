"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Wallet,
  Mail,
  Phone,
  MapPin,
  Pencil,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { updateMyAccountAction } from "@/app/(store)/mis-pedidos/actions";

export function AccountSettingsCard({
  initialName,
  email,
  initialPhone = "",
  initialAddress = "",
  ordersCount = 0,
  totalPieces = 0,
  totalSpentFormatted = "RD$0.00",
}: {
  initialName: string;
  email: string;
  initialPhone?: string;
  initialAddress?: string;
  ordersCount?: number;
  totalPieces?: number;
  totalSpentFormatted?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const initials =
    initialName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("") || email.slice(0, 2).toUpperCase();

  return (
    <div
      id="perfil"
      className="group relative overflow-hidden rounded-[26px] border border-[#e5dacb]/80 bg-white shadow-[0_15px_35px_rgba(20,16,13,0.06)] transition-all duration-300 hover:shadow-[0_20px_45px_rgba(201,161,90,0.12)]"
    >
      {/* SECCIÓN SUPERIOR: ATELIER NOIR CON FICHA DE CLIENTE */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#181411] via-[#14100e] to-[#0f0d0b] px-6 pt-7 pb-6 text-white">
        {/* Glow dorado ambiental superior */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-44 w-44 rounded-full bg-[#d4af37]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-[#caa466]/10 blur-2xl" />

        <div className="relative flex items-center gap-4">
          {/* Avatar con anillo dorado luminoso */}
          <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-[#d4af37] bg-[#1a1512] font-display text-xl font-bold tracking-wider text-[#f5dfa8] shadow-[0_0_22px_rgba(212,175,55,0.45)] ring-4 ring-[#d4af37]/15">
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.22em] text-[#d4af37]">
              Ficha de Cliente
            </span>
            <h2 className="mt-0.5 truncate font-display text-xl font-bold tracking-tight text-white">
              {initialName}
            </h2>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-white/60">
              <Mail className="h-3 w-3 shrink-0 text-[#d4af37]/80" />
              <span className="truncate">{email}</span>
            </div>
          </div>
        </div>

        {/* CINTA DE RESUMEN EJECUTIVO: PEDIDOS | MUEBLES | INVERTIDO */}
        <div className="relative mt-6 grid grid-cols-3 divide-x divide-white/10 rounded-2xl border border-[#d4af37]/25 bg-black/40 py-3.5 backdrop-blur-md shadow-inner">
          <div className="flex flex-col items-center justify-center px-2 text-center">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              <ShoppingBag className="h-3 w-3 text-[#d4af37]" />
              <span>Pedidos</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-white">
              {ordersCount}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-2 text-center">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              <Star className="h-3 w-3 text-[#d4af37]" />
              <span>Muebles</span>
            </div>
            <p className="mt-1 font-mono text-base font-bold text-white">
              {totalPieces}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center px-2 text-center">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-white/50">
              <Wallet className="h-3 w-3 text-[#d4af37]" />
              <span>Invertido</span>
            </div>
            <p className="mt-1 truncate font-mono text-xs font-bold text-[#d4af37] sm:text-sm">
              {totalSpentFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: DATOS DE CONTACTO Y ACCIÓN EDITAR */}
      <div className="bg-[#fdfbf7] px-6 py-5">
        <div className="divide-y divide-[#eee5d8] text-xs">
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2 text-[#7d7165]">
              <Mail className="h-3.5 w-3.5 text-[#b0894f]" />
              <span className="font-medium">Correo</span>
            </span>
            <span className="truncate font-semibold text-[#1e1915]">
              {email}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 py-3">
            <span className="flex items-center gap-2 text-[#7d7165]">
              <Phone className="h-3.5 w-3.5 text-[#b0894f]" />
              <span className="font-medium">Teléfono</span>
            </span>
            <span
              className={`font-semibold ${
                initialPhone ? "text-[#1e1915]" : "text-[#9d9183]"
              }`}
            >
              {initialPhone || "No registrado"}
            </span>
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <span className="flex shrink-0 items-center gap-2 text-[#7d7165]">
              <MapPin className="h-3.5 w-3.5 text-[#b0894f]" />
              <span className="font-medium">Dirección</span>
            </span>
            <span
              className={`text-right font-semibold ${
                initialAddress ? "text-[#1e1915]" : "text-[#9d9183]"
              }`}
            >
              {initialAddress || "No registrada"}
            </span>
          </div>
        </div>

        {/* BOTÓN PÍLDORA CON BORDE DORADO */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="group/btn flex w-full items-center justify-center gap-2 rounded-full border border-[#caa466]/50 bg-white px-5 py-2.5 text-xs font-semibold text-[#2c2219] shadow-xs transition-all duration-200 hover:border-[#caa466] hover:bg-[#caa466]/10 hover:shadow-[0_4px_16px_rgba(201,161,90,0.2)] active:scale-[0.99] cursor-pointer"
          >
            {open ? (
              <>
                <X className="h-3.5 w-3.5 text-[#7d7165] transition-transform group-hover/btn:rotate-90" />
                <span>Cerrar edición</span>
              </>
            ) : (
              <>
                <Pencil className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Editar datos o contraseña</span>
                <span className="text-[#caa466] text-xs transition-transform group-hover/btn:translate-x-0.5">
                  &gt;
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* FORMULARIO DESPLEGABLE CON ANIMACIÓN FLUIDA */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-[#ede4d6] bg-[#f9f5ee]"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setFeedback(null);
                const fd = new FormData(e.currentTarget);
                const formEl = e.currentTarget;
                startTransition(async () => {
                  const res = await updateMyAccountAction(fd);
                  if (res.ok) {
                    setFeedback({
                      type: "ok",
                      text: res.message || "Datos actualizados exitosamente.",
                    });
                    const cur = formEl.elements.namedItem(
                      "currentPassword",
                    ) as HTMLInputElement | null;
                    const nw = formEl.elements.namedItem(
                      "newPassword",
                    ) as HTMLInputElement | null;
                    if (cur) cur.value = "";
                    if (nw) nw.value = "";
                    router.refresh();
                  } else {
                    setFeedback({
                      type: "err",
                      text: res.error || "No se pudo actualizar la cuenta.",
                    });
                  }
                });
              }}
              className="space-y-4 px-6 py-6"
            >
              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Nombre completo
                </label>
                <input
                  name="name"
                  defaultValue={initialName}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Tu nombre y apellido"
                  className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3.5 py-2.5 text-xs text-[#1f1915] shadow-inner transition focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Teléfono / WhatsApp
                </label>
                <input
                  name="phone"
                  defaultValue={initialPhone}
                  maxLength={40}
                  placeholder="Ej. 809-555-0123"
                  className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3.5 py-2.5 text-xs text-[#1f1915] shadow-inner transition focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Dirección de entrega habitual
                </label>
                <textarea
                  name="address"
                  rows={2}
                  defaultValue={initialAddress}
                  maxLength={200}
                  placeholder="Sector, calle, número, ciudad..."
                  className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3.5 py-2.5 text-xs text-[#1f1915] shadow-inner transition focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none resize-none"
                />
              </div>

              <div className="rounded-xl border border-[#e4d8c7] bg-white/70 p-3.5 space-y-3">
                <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#1f1915]">
                  <Lock className="h-3 w-3 text-[#b0894f]" />
                  <span>Cambiar contraseña (opcional)</span>
                </p>
                <input
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Contraseña actual"
                  className="w-full rounded-lg border border-[#d8ccbb] bg-white px-3 py-2 text-xs text-[#1f1915] focus:border-[#c9a15a] focus:outline-none"
                />
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={128}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  className="w-full rounded-lg border border-[#d8ccbb] bg-white px-3 py-2 text-xs text-[#1f1915] focus:border-[#c9a15a] focus:outline-none"
                />
              </div>

              {feedback && (
                <div
                  className={`flex items-center gap-2 rounded-xl border p-3 text-xs font-semibold ${
                    feedback.type === "ok"
                      ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                      : "border-rose-300 bg-rose-50 text-rose-800"
                  }`}
                >
                  {feedback.type === "ok" ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-full bg-gradient-to-r from-[#171310] via-[#251e18] to-[#171310] px-5 py-3 text-xs font-bold tracking-wider text-[#d4af37] uppercase shadow-lg transition-all hover:scale-[1.01] hover:shadow-[0_8px_20px_rgba(212,175,55,0.2)] disabled:opacity-50 cursor-pointer"
              >
                {pending ? "Guardando cambios..." : "Guardar cambios"}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

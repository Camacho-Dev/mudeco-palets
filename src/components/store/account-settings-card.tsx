"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Star,
  Wallet,
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
      className="relative overflow-hidden rounded-3xl border border-[#ece4d8] bg-white shadow-[0_1px_2px_rgba(27,21,17,0.04),0_16px_40px_-24px_rgba(27,21,17,0.25)]"
    >
      <div className="px-6 pt-6 pb-5">
        <div className="flex items-center gap-4">
          <div
            aria-hidden
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#16120e] font-display text-lg tracking-wide text-[#e9cf96]"
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-display text-xl text-[#16120e]">{initialName}</h2>
            <p className="truncate text-sm text-[#85776a]" title={email}>
              {email}
            </p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-2">
          {[
            { icon: ShoppingBag, label: "Pedidos", value: String(ordersCount) },
            { icon: Star, label: "Muebles", value: String(totalPieces) },
            { icon: Wallet, label: "Total comprado", value: totalSpentFormatted, wide: true },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl bg-[#f7f3ec] px-3.5 py-3 ${"wide" in stat && stat.wide ? "col-span-2" : ""}`}
            >
              <dt className="flex items-center gap-1 text-[11px] text-[#85776a]">
                <stat.icon className="h-3 w-3 text-[#b0894f]" aria-hidden />
                {stat.label}
              </dt>
              <dd
                className="mt-1 truncate text-[15px] font-semibold text-[#16120e] tabular-nums"
                title={stat.value}
              >
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="border-t border-[#f1ebe2] px-6 py-4">
        <dl className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <dt className="flex w-24 shrink-0 items-center gap-2 text-[#85776a]">
              <Phone className="h-3.5 w-3.5 text-[#b0894f]" aria-hidden />
              Teléfono
            </dt>
            <dd className={initialPhone ? "text-[#16120e]" : "text-[#a39483]"}>
              {initialPhone || "Sin registrar"}
            </dd>
          </div>
          <div className="flex items-start gap-3">
            <dt className="flex w-24 shrink-0 items-center gap-2 text-[#85776a]">
              <MapPin className="h-3.5 w-3.5 text-[#b0894f]" aria-hidden />
              Dirección
            </dt>
            <dd className={initialAddress ? "text-[#16120e]" : "text-[#a39483]"}>
              {initialAddress || "Sin registrar"}
            </dd>
          </div>
        </dl>

        {/* BOTÓN PÍLDORA CON BORDE DORADO */}
        <div className="pt-4">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="group/btn flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#e4ddd2] bg-white px-5 text-sm font-medium text-[#16120e] transition-colors duration-200 hover:border-[#c9a15a] hover:bg-[#fbf8f3] active:scale-[0.99] cursor-pointer"
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
                <label htmlFor="account-name" className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Nombre completo
                </label>
                <input
                  id="account-name"
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
                <label htmlFor="account-phone" className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Teléfono / WhatsApp
                </label>
                <input
                  id="account-phone"
                  name="phone"
                  defaultValue={initialPhone}
                  maxLength={40}
                  placeholder="Ej. 809-555-0123"
                  className="w-full rounded-xl border border-[#d8ccbb] bg-white px-3.5 py-2.5 text-xs text-[#1f1915] shadow-inner transition focus:border-[#c9a15a] focus:ring-2 focus:ring-[#c9a15a]/20 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="account-address" className="mb-1.5 block text-[11px] font-bold text-[#1f1915]">
                  Dirección de entrega habitual
                </label>
                <textarea
                  id="account-address"
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
                  aria-label="Contraseña actual"
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Contraseña actual"
                  className="w-full rounded-lg border border-[#d8ccbb] bg-white px-3 py-2 text-xs text-[#1f1915] focus:border-[#c9a15a] focus:outline-none"
                />
                <input
                  aria-label="Nueva contraseña"
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

"use client";

import { useState, useTransition } from "react";
import {
  UserCog,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
  MapPin,
  Mail,
  X,
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
      className="scroll-mt-28 overflow-hidden rounded-2xl border border-[#e5dacb] bg-white shadow-xs"
    >
      {/* Cabecera de la ficha del cliente */}
      <div className="border-b border-[#f0e8dc] bg-[#14100d] px-6 py-6 text-white">
        <div className="flex items-center gap-4">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/50 bg-[#c9a15a]/15 font-display text-base font-semibold text-[#c9a15a]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c9a15a]">
              Ficha de Cliente
            </p>
            <h2 className="mt-0.5 truncate font-display text-xl font-semibold text-white">
              {initialName}
            </h2>
            <p className="truncate text-xs text-white/60">{email}</p>
          </div>
        </div>

        {/* Resumen ejecutivo integrado */}
        <div className="mt-5 grid grid-cols-3 divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03] py-3 text-center">
          <div className="px-2">
            <p className="text-[10px] uppercase tracking-wider text-white/45">
              Pedidos
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-white">
              {ordersCount}
            </p>
          </div>
          <div className="px-2">
            <p className="text-[10px] uppercase tracking-wider text-white/45">
              Muebles
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-white">
              {totalPieces}
            </p>
          </div>
          <div className="px-2">
            <p className="text-[10px] uppercase tracking-wider text-white/45">
              Invertido
            </p>
            <p className="mt-0.5 truncate font-mono text-xs font-semibold text-[#c9a15a]">
              {totalSpentFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* Datos de contacto actuales */}
      <div className="divide-y divide-[#f2ece2] px-6 py-4 text-xs">
        <div className="flex items-center justify-between gap-3 py-2.5">
          <span className="flex items-center gap-2 text-[var(--muted)]">
            <Mail className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Correo</span>
          </span>
          <span className="truncate font-medium text-[var(--wood-950)]">
            {email}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-2.5">
          <span className="flex items-center gap-2 text-[var(--muted)]">
            <Phone className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Teléfono</span>
          </span>
          <span className="font-medium text-[var(--wood-950)]">
            {initialPhone || "No registrado"}
          </span>
        </div>

        <div className="flex items-start justify-between gap-4 py-2.5">
          <span className="flex shrink-0 items-center gap-2 text-[var(--muted)]">
            <MapPin className="h-3.5 w-3.5 text-[#b0894f]" />
            <span>Dirección</span>
          </span>
          <span className="text-right font-medium text-[var(--wood-950)]">
            {initialAddress || "No registrada"}
          </span>
        </div>
      </div>

      {/* Botón para abrir/cerrar edición */}
      <div className="border-t border-[#f0e8dc] bg-[#faf7f2] px-6 py-3.5">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#dfd2c0] bg-white px-4 py-2.5 text-xs font-semibold text-[var(--wood-900)] transition hover:border-[#b0894f] cursor-pointer"
        >
          {open ? (
            <>
              <X className="h-3.5 w-3.5 text-[var(--muted)]" />
              <span>Cerrar edición</span>
            </>
          ) : (
            <>
              <UserCog className="h-3.5 w-3.5 text-[#b0894f]" />
              <span>Editar datos o contraseña</span>
            </>
          )}
        </button>
      </div>

      {/* Formulario desplegable de edición */}
      {open && (
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
                  text: res.message || "Datos actualizados.",
                });
                const cur = formEl.elements.namedItem(
                  "currentPassword",
                ) as HTMLInputElement | null;
                const nw = formEl.elements.namedItem(
                  "newPassword",
                ) as HTMLInputElement | null;
                if (cur) cur.value = "";
                if (nw) nw.value = "";
              } else {
                setFeedback({
                  type: "err",
                  text: res.error || "No se pudo actualizar.",
                });
              }
            });
          }}
          className="border-t border-[#efe6d8] bg-[#faf7f2]/80 px-6 py-5 space-y-3.5"
        >
          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--wood-900)]">
              Nombre completo
            </label>
            <input
              name="name"
              defaultValue={initialName}
              required
              minLength={2}
              maxLength={100}
              placeholder="Tu nombre y apellido"
              className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2 text-xs text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--wood-900)]">
              Teléfono / WhatsApp
            </label>
            <input
              name="phone"
              defaultValue={initialPhone}
              maxLength={40}
              placeholder="Ej. 809-555-0000"
              className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2 text-xs text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-semibold text-[var(--wood-900)]">
              Dirección de entrega habitual
            </label>
            <input
              name="address"
              defaultValue={initialAddress}
              maxLength={200}
              placeholder="Sector, calle, número, ciudad..."
              className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2 text-xs text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
            />
          </div>

          <div className="border-t border-[#e8decb] pt-3 space-y-3">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--wood-900)]">
              <Lock className="h-3 w-3 text-[#b0894f]" />
              <span>Cambiar contraseña (opcional)</span>
            </p>
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              placeholder="Contraseña actual"
              className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2 text-xs text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
            />
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={6}
              maxLength={128}
              placeholder="Nueva contraseña (mín. 6 caracteres)"
              className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2 text-xs text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
            />
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium ${
                feedback.type === "ok"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              {feedback.type === "ok" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[#14100d] px-4 py-2.5 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:bg-[#241d17] disabled:opacity-50 cursor-pointer"
          >
            {pending ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      )}
    </div>
  );
}

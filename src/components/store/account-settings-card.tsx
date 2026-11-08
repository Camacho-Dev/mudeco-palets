"use client";

import { useState, useTransition } from "react";
import {
  UserCog,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Lock,
  Phone,
  MapPin,
  Mail,
} from "lucide-react";
import { updateMyAccountAction } from "@/app/(store)/mis-pedidos/actions";

export function AccountSettingsCard({
  initialName,
  email,
  initialPhone = "",
  initialAddress = "",
}: {
  initialName: string;
  email: string;
  initialPhone?: string;
  initialAddress?: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  return (
    <div
      id="perfil"
      className="mb-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[#e2d5c5] bg-white shadow-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#c9a15a]/40 bg-[#14100d] text-sm font-bold text-[#c9a15a]">
            {initialName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() || "")
              .join("") || "MP"}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-display text-lg font-bold text-[var(--wood-950)]">
                {initialName}
              </p>
              <span className="rounded-full border border-[#c9a15a]/35 bg-[#faf6f1] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#8f6a32]">
                Cliente Verificado
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-[#b0894f]" />
                {email}
              </span>
              {initialPhone ? (
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#b0894f]" />
                  {initialPhone}
                </span>
              ) : null}
              {initialAddress ? (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#b0894f]" />
                  {initialAddress}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl border border-[#dfd2c0] bg-[#faf6f1] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--wood-900)] transition hover:border-[#b0894f] hover:bg-white cursor-pointer"
        >
          <UserCog className="h-4 w-4 text-[#b0894f]" />
          <span>{open ? "Ocultar edición" : "Editar mi perfil y clave"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

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
          className="border-t border-[#efe6d8] bg-[#faf7f2]/70 px-6 py-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                Nombre completo
              </label>
              <input
                name="name"
                defaultValue={initialName}
                required
                minLength={2}
                maxLength={100}
                placeholder="Tu nombre y apellido"
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                <Phone className="h-3 w-3 text-[#b0894f]" />
                Teléfono / WhatsApp
              </label>
              <input
                name="phone"
                defaultValue={initialPhone}
                maxLength={40}
                placeholder="Ej. 809-555-0000"
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <label className="mb-1.5 flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                <MapPin className="h-3 w-3 text-[#b0894f]" />
                Dirección de entrega habitual
              </label>
              <input
                name="address"
                defaultValue={initialAddress}
                maxLength={200}
                placeholder="Sector, calle, número, ciudad..."
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 border-t border-[#efe6d8] pt-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                <Lock className="h-3 w-3 text-[#b0894f]" />
                Contraseña actual (opcional)
              </label>
              <input
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Solo si deseas cambiar tu clave"
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                Nueva contraseña (opcional)
              </label>
              <input
                name="newPassword"
                type="password"
                autoComplete="new-password"
                minLength={6}
                maxLength={128}
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>
          </div>

          {feedback && (
            <div
              className={`flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-medium ${
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-[#14100d] px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-[#c9a15a] uppercase transition hover:bg-[#241d17] disabled:opacity-50 cursor-pointer"
            >
              {pending ? "Guardando..." : "Guardar cambios de perfil"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

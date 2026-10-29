"use client";

import { useState, useTransition } from "react";
import { UserCog, ChevronDown, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { updateMyAccountAction } from "@/app/(store)/mis-pedidos/actions";

export function AccountSettingsCard({
  initialName,
  email,
}: {
  initialName: string;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-[#e2d5c5] bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition hover:bg-[#faf6f1]/70 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#c9a15a]/35 bg-[#faf6f1] text-[#b0894f]">
            <UserCog className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-[var(--wood-950)] uppercase">
              Mi Cuenta y Seguridad
            </p>
            <p className="text-xs text-[var(--muted)]">
              {initialName} · {email}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8f6a32]">
          <span>{open ? "Ocultar" : "Editar perfil / clave"}</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

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
          className="border-t border-[#efe6d8] bg-[#faf7f2]/60 px-6 py-5 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
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
                className="w-full rounded-xl border border-[#dfd2c0] bg-white px-3.5 py-2.5 text-sm text-[var(--wood-950)] focus:border-[#c9a15a] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 flex items-center gap-1 text-[0.68rem] font-bold tracking-[0.14em] text-[var(--wood-900)] uppercase">
                <Lock className="h-3 w-3 text-[#b0894f]" />
                Contraseña actual (opcional)
              </label>
              <input
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                placeholder="Solo si cambiarás tu clave"
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
              {pending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


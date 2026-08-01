"use client";

import { useState, useTransition } from "react";
import { Lock, Shield } from "lucide-react";
import { unlockSensitiveArea } from "./actions";
import { LogoMark } from "@/components/logo";
import { IconField } from "@/components/icon-field";

export function UnlockForm({ nextPath }: { nextPath: string }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      action={(fd) => {
        setError("");
        startTransition(async () => {
          const result = await unlockSensitiveArea(fd);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <input type="hidden" name="next" value={nextPath} />

      <div className="flex flex-col items-center text-center">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3ebe3] text-[#3d2a1f]">
          <Shield className="h-6 w-6" />
        </div>
        <LogoMark className="mb-3 h-10 w-10" color="#3d2a1f" />
        <h1 className="font-display text-2xl text-[#3d2a1f]">Área privada</h1>
        <p className="mt-2 max-w-sm text-sm text-[#7a6a5c]">
          Finanzas, inventario, cobros, panel y configuración requieren la
          contraseña de administrador.
        </p>
      </div>

      <div>
        <label className="label" htmlFor="password">
          Contraseña de administrador
        </label>
        <IconField
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<Lock strokeWidth={2.25} />}
        />
      </div>

      {error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-primary w-full py-3 disabled:opacity-60"
      >
        {pending ? "Verificando…" : "Desbloquear grupo privado"}
      </button>
    </form>
  );
}

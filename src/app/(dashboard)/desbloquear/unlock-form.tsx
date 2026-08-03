"use client";

import { useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { unlockSensitiveArea } from "./actions";
import { BrandLogo } from "@/components/logo";
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
        <BrandLogo width={180} height={225} className="mb-4" tone="onLight" />
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

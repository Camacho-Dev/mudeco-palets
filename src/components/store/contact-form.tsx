"use client";

import { useState, useTransition } from "react";
import { submitContactRequest } from "@/app/(store)/contacto/actions";

export function ContactForm() {
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", "contact");
    fd.set("piece", "Consulta web");
    start(async () => {
      try {
        await submitContactRequest(fd);
      } catch (err) {
        const dig =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest?: string }).digest)
            : "";
        if (dig.startsWith("NEXT_REDIRECT")) return;
        setError(err instanceof Error ? err.message : "No se pudo enviar");
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-6 sm:p-8"
    >
      <div>
        <h2 className="font-display text-2xl text-[var(--wood-950)]">
          Escríbenos
        </h2>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Te respondemos desde el taller. También puedes usar WhatsApp.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="c-name">
              Nombre
            </label>
            <input id="c-name" name="name" required className="input" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-email">
                Email
              </label>
              <input
                id="c-email"
                name="email"
                type="email"
                required
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="c-phone">
                Teléfono *
              </label>
              <input id="c-phone" name="phone" required className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="c-description">
              Mensaje
            </label>
            <textarea
              id="c-description"
              name="description"
              required
              rows={5}
              className="input"
              placeholder="¿En qué te ayudamos?"
            />
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="store-cta store-cta-primary mt-6 w-full disabled:opacity-60"
        style={{ color: "#3d2a1f" }}
      >
        {pending ? "Enviando…" : "Enviar mensaje"}
      </button>
    </form>
  );
}

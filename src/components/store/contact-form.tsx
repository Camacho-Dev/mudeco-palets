"use client";

import { useEffect, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { submitContactRequest } from "@/app/(store)/contacto/actions";
import { MessageSquare, Ruler, Send } from "lucide-react";

export function ContactForm() {
  const { data: session } = useSession();
  const [kind, setKind] = useState<"contact" | "quote">("contact");
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
    if (session?.user?.email && !email) setEmail(session.user.email);
  }, [session?.user?.name, session?.user?.email, name, email]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", kind);
    if (kind === "contact" && !fd.get("piece")) {
      fd.set("piece", "Consulta web");
    }
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
      className="flex w-full flex-col justify-between rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-xs sm:p-8"
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.2em] text-[#b0894f] uppercase">
              Atención Personalizada
            </p>
            <h2 className="font-display mt-1 text-2xl sm:text-3xl text-[var(--wood-950)]">
              Escríbenos al Taller
            </h2>
          </div>
        </div>

        {/* Selector de tipo de solicitud */}
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-xl border border-[#e5d8c8] bg-[#faf7f2] p-1.5">
          <button
            type="button"
            onClick={() => setKind("contact")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              kind === "contact"
                ? "bg-[#14100d] text-[#c9a15a] shadow-xs"
                : "text-[var(--wood-900)] hover:bg-white/70"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Consulta General</span>
          </button>
          <button
            type="button"
            onClick={() => setKind("quote")}
            className={`flex items-center justify-center gap-2 rounded-lg py-2.5 px-3 text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
              kind === "quote"
                ? "bg-[#14100d] text-[#c9a15a] shadow-xs"
                : "text-[var(--wood-900)] hover:bg-white/70"
            }`}
          >
            <Ruler className="h-3.5 w-3.5" />
            <span>Cotizar a Medida</span>
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="label" htmlFor="c-name">
              Nombre completo *
            </label>
            <input
              id="c-name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre y apellido"
              className="input"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="c-email">
                Correo electrónico *
              </label>
              <input
                id="c-email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
                className="input"
              />
            </div>
            <div>
              <label className="label" htmlFor="c-phone">
                Teléfono / WhatsApp *
              </label>
              <input
                id="c-phone"
                name="phone"
                required
                placeholder="809-000-0000"
                className="input"
              />
            </div>
          </div>

          {kind === "quote" && (
            <div>
              <label className="label" htmlFor="c-piece">
                Pieza y medidas aproximadas *
              </label>
              <input
                id="c-piece"
                name="piece"
                required
                placeholder="Ej. Mesa de comedor 180 × 90 cm para 6 personas"
                className="input"
              />
            </div>
          )}

          <div>
            <label className="label" htmlFor="c-description">
              {kind === "quote"
                ? "Detalles del proyecto (tono de madera, espacio, entrega) *"
                : "Mensaje *"}
            </label>
            <textarea
              id="c-description"
              name="description"
              required
              rows={kind === "quote" ? 4 : 5}
              className="input"
              placeholder={
                kind === "quote"
                  ? "Cuéntanos qué diseño tienes en mente, medidas o sector de entrega…"
                  : "¿En qué podemos ayudarte?"
              }
            />
          </div>
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
            {error}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="store-cta store-cta-primary mt-6 w-full rounded-xl disabled:opacity-60 cursor-pointer"
      >
        <Send className="h-3.5 w-3.5" />
        <span>
          {pending
            ? "Enviando al taller…"
            : kind === "quote"
              ? "Solicitar cotización a medida"
              : "Enviar mensaje"}
        </span>
      </button>
    </form>
  );
}

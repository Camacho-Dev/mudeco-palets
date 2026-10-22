"use client";

import { useState, useTransition } from "react";
import { ChevronRight } from "lucide-react";
import { submitServiceRequest } from "@/app/(store)/reparaciones/actions";

export function ServiceRequestForm({
  defaultKind = "repair",
  phone,
}: {
  defaultKind?: "repair" | "quote";
  phone?: string;
}) {
  const [kind, setKind] = useState<"repair" | "quote">(defaultKind);
  const [error, setError] = useState("");
  const [photoNames, setPhotoNames] = useState<string[]>([]);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("kind", kind);
    if (photoNames.length) {
      fd.set(
        "photoNote",
        `Fotos seleccionadas (${photoNames.length}): ${photoNames.join(", ")}. El cliente enviará las imágenes por WhatsApp.`,
      );
    }
    start(async () => {
      try {
        await submitServiceRequest(fd);
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
    <form id="solicitar" onSubmit={onSubmit} className="store-service-form">
      <div className="store-kind-tabs">
        <button
          type="button"
          onClick={() => setKind("repair")}
          className={`store-kind-tab ${
            kind === "repair" ? "store-kind-tab-active" : "store-kind-tab-idle"
          }`}
        >
          Reparación
        </button>
        <button
          type="button"
          onClick={() => setKind("quote")}
          className={`store-kind-tab ${
            kind === "quote" ? "store-kind-tab-active" : "store-kind-tab-idle"
          }`}
        >
          Cotización
        </button>
      </div>

      <p className="mt-5 text-sm leading-relaxed text-[#3b2a22]/65">
        {kind === "repair"
          ? "Cuéntanos qué mueble hay que reparar y en qué estado está."
          : "Describe el mueble o proyecto a medida que quieres cotizar."}
      </p>

      <div className="mt-7 space-y-5">
        <div>
          <label className="label" htmlFor="name">
            Nombre completo
          </label>
          <input id="name" name="name" required className="input" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">
              Teléfono *
            </label>
            <input
              id="phone"
              name="phone"
              required
              className="input"
              defaultValue=""
              placeholder={phone || ""}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">
            Dirección / zona
          </label>
          <input id="address" name="address" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="piece">
            {kind === "repair"
              ? "Mueble a reparar"
              : "Tipo de mueble / proyecto"}
          </label>
          <input
            id="piece"
            name="piece"
            className="input"
            placeholder={
              kind === "repair"
                ? "Ej. mesa de comedor, silla, estantería…"
                : "Ej. banco a medida, cabecera, escritorio…"
            }
          />
        </div>
        <div>
          <label className="label" htmlFor="description">
            Descripción del trabajo
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            className="input"
            placeholder={
              kind === "repair"
                ? "Daño, medidas aproximadas, material, urgencia…"
                : "Medidas, estilo, acabado, cantidad, uso…"
            }
          />
        </div>
        <div>
          <label className="label" htmlFor="photos">
            Fotos (opcional)
          </label>
          <input
            id="photos"
            name="photos"
            type="file"
            accept="image/*"
            multiple
            className="input !h-auto py-3"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              setPhotoNames(files.map((f) => f.name));
            }}
          />
          <p className="mt-2 text-xs leading-relaxed text-[#3b2a22]/50">
            Selecciona fotos del daño o del espacio. Tras enviar, te pediremos
            reenviarlas por WhatsApp para cotizar con precisión.
          </p>
          {photoNames.length ? (
            <p className="mt-1.5 text-xs font-medium text-[#3b2a22]">
              {photoNames.length} archivo(s) listo(s) para referenciar.
            </p>
          ) : null}
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notas adicionales
          </label>
          <textarea id="notes" name="notes" rows={2} className="input" />
        </div>
      </div>

      {error ? (
        <p className="mt-5 rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={pending} className="store-submit group">
        <span className="inline-flex items-center justify-center gap-2">
          {pending
            ? "Enviando…"
            : kind === "repair"
              ? "Solicitar reparación"
              : "Pedir cotización"}
          {!pending ? (
            <ChevronRight
              className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5"
              strokeWidth={1.75}
            />
          ) : null}
        </span>
      </button>
    </form>
  );
}

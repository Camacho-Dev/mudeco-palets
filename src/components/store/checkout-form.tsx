"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/store/cart-context";
import { formatCurrency } from "@/lib/format";
import { submitWebCheckout } from "@/app/(store)/checkout/actions";
import { STORE_LOGISTICS } from "@/lib/store-info";
import Link from "next/link";

const MODE_COPY = {
  transfer: {
    title: "Transferencia bancaria",
    submit: "Confirmar pedido por transferencia",
    hint: "Te mostramos las cuentas del Popular, Banreservas y BHD para transferir y enviar el comprobante.",
  },
  online: {
    title: "Pagar en línea",
    submit: "Ir a pagar",
    hint: "Te redirigimos a Stripe. Al completar, recibirás la factura por correo.",
  },
  local: {
    title: "Pagar en el local",
    submit: "Confirmar pedido",
    hint: "Registramos tu factura pendiente. Pagas al retirar o al recibir la entrega.",
  },
  quote: {
    title: "Pedir cotización",
    submit: "Enviar cotización",
    hint: "Sin compromiso. El equipo te contacta con la propuesta.",
  },
} as const;

const DRAFT_KEY = "mudeco_checkout_draft_v1";

export function CheckoutForm({
  mode,
  stripeReady = true,
}: {
  mode: "online" | "local" | "quote" | "transfer";
  stripeReady?: boolean;
}) {
  const { data: session } = useSession();
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [name, setName] = useState(session?.user?.name ?? "");
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [pending, start] = useTransition();
  const copy = MODE_COPY[mode];

  // Auto-fill name/email when session loads asynchronously
  useEffect(() => {
    if (session?.user?.name && !name) setName(session.user.name);
    if (session?.user?.email && !email) setEmail(session.user.email);
  }, [session?.user?.name, session?.user?.email, name, email]);

  // Restaurar borrador de campos en sessionStorage para no perder datos al cambiar de modalidad
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.taxId) setTaxId(parsed.taxId);
        if (parsed.address) setAddress(parsed.address);
        if (parsed.notes) setNotes(parsed.notes);
        if (parsed.fulfillment === "delivery" || parsed.fulfillment === "pickup") {
          setFulfillment(parsed.fulfillment);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({ phone, taxId, address, notes, fulfillment }),
      );
    } catch {
      /* ignore */
    }
  }, [phone, taxId, address, notes, fulfillment]);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = items.reduce(
      (s, i) => s + i.price * i.quantity * i.taxRate,
      0,
    );
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  const cartJson = JSON.stringify(
    items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (mode === "online" && !stripeReady) {
      setError("El pago online aún no está configurado.");
      return;
    }
    const fd = new FormData(e.currentTarget);
    fd.set("mode", mode);
    fd.set("cartJson", cartJson);
    fd.set("fulfillment", fulfillment);
    fd.set("origin", window.location.origin);
    start(async () => {
      try {
        await submitWebCheckout(fd);
        try {
          sessionStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        clear();
      } catch (err) {
        const dig =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest?: string }).digest)
            : "";
        if (dig.startsWith("NEXT_REDIRECT")) {
          try {
            sessionStorage.removeItem(DRAFT_KEY);
          } catch {
            /* ignore */
          }
          return;
        }
        setError(err instanceof Error ? err.message : "No se pudo completar");
      }
    });
  }

  if (!items.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-[var(--muted)]">No hay productos en el carrito.</p>
        <Link href="/catalogo" className="mt-4 inline-block underline">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <form className="grid gap-8 lg:grid-cols-12" onSubmit={onSubmit}>
      <div className="space-y-5 rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-sm sm:p-8 lg:col-span-7">
        <div>
          <span className="text-[0.68rem] font-bold tracking-[0.2em] text-[#b0894f] uppercase">
            Datos del pedido
          </span>
          <h2 className="font-display mt-1 text-2xl sm:text-3xl text-[var(--wood-950)]">
            {copy.title}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{copy.hint}</p>
        </div>

        <div>
          <p className="label">Modalidad de entrega</p>
          <div className="mt-1.5 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                fulfillment === "pickup"
                  ? "border-[var(--wood-900)] bg-[var(--wood-900)] text-white shadow-xs"
                  : "border-[var(--border)] bg-[#faf7f2] text-[var(--wood-900)] hover:border-[#b0894f]"
              }`}
            >
              Retiro en taller
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition cursor-pointer ${
                fulfillment === "delivery"
                  ? "border-[var(--wood-900)] bg-[var(--wood-900)] text-white shadow-xs"
                  : "border-[var(--border)] bg-[#faf7f2] text-[var(--wood-900)] hover:border-[#b0894f]"
              }`}
            >
              Entrega a domicilio
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            {fulfillment === "pickup"
              ? STORE_LOGISTICS.pickup
              : STORE_LOGISTICS.delivery}
          </p>
        </div>

        <div>
          <label className="label" htmlFor="name">
            Nombre completo *
          </label>
          <input
            id="name"
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre y apellido"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">
            Correo electrónico *
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
            className="input"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">
              Teléfono / WhatsApp *
            </label>
            <input
              id="phone"
              name="phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809-000-0000"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="taxId">
              RNC / Cédula (opcional)
            </label>
            <input
              id="taxId"
              name="taxId"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="Para comprobante fiscal"
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">
            {fulfillment === "delivery"
              ? "Dirección de entrega *"
              : "Dirección (opcional)"}
          </label>
          <input
            id="address"
            name="address"
            required={fulfillment === "delivery"}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="input"
            placeholder={
              fulfillment === "delivery"
                ? "Sector, calle, número, referencia…"
                : "Opcional para retiro en taller"
            }
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notas o especificaciones de medidas
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tono de madera preferido, horario de recepción o detalles adicionales…"
            className="input"
          />
        </div>

        <p className="rounded-xl border border-[#e5d8c8] bg-[#faf6f1] px-4 py-3 text-xs leading-relaxed text-[var(--wood-800)]">
          {STORE_LOGISTICS.payments} {STORE_LOGISTICS.leadTime}
        </p>
      </div>

      <div className="lg:col-span-5">
        <div className="sticky top-28 rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-sm sm:p-7">
          <h2 className="font-display text-2xl text-[var(--wood-950)]">
            Resumen de tu compra
          </h2>
          <ul className="mt-4 divide-y divide-[#efe6d8] text-sm">
            {items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-3 py-2.5">
                <span className="text-[var(--wood-900)]">
                  {i.name} <strong className="text-xs text-[var(--muted)]">× {i.quantity}</strong>
                </span>
                <span className="font-medium text-[var(--wood-950)]">
                  {formatCurrency(i.price * i.quantity)}
                </span>
              </li>
            ))}
            <li className="flex justify-between pt-3 text-[var(--muted)]">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </li>
            <li className="flex justify-between py-1.5 text-[var(--muted)]">
              <span>ITBIS (18%)</span>
              <span>{formatCurrency(totals.tax)}</span>
            </li>
            <li className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--wood-950)]">
              <span>Total a pagar</span>
              <span className="text-lg text-[#8a6a3a]">{formatCurrency(totals.total)}</span>
            </li>
          </ul>

          {error ? (
            <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending || (mode === "online" && !stripeReady)}
            className="store-cta store-cta-primary mt-6 w-full rounded-xl disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Procesando pedido…" : copy.submit}
          </button>
          <Link
            href="/checkout"
            className="mt-4 block text-center text-xs font-medium text-[var(--muted)] underline-offset-2 hover:text-[var(--wood-950)] hover:underline"
          >
            ← Elegir otro método de pago
          </Link>
        </div>
      </div>
    </form>
  );
}

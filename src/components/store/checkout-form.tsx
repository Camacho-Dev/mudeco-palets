"use client";

import { useMemo, useState, useTransition } from "react";
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

export function CheckoutForm({
  mode,
  stripeReady = true,
}: {
  mode: "online" | "local" | "quote" | "transfer";
  stripeReady?: boolean;
}) {
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">(
    "pickup",
  );
  const [pending, start] = useTransition();
  const copy = MODE_COPY[mode];

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
        clear();
      } catch (err) {
        const dig =
          err && typeof err === "object" && "digest" in err
            ? String((err as { digest?: string }).digest)
            : "";
        if (dig.startsWith("NEXT_REDIRECT")) return;
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
    <form className="grid gap-10 lg:grid-cols-2" onSubmit={onSubmit}>
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--wood-950)]">
          {copy.title}
        </h2>
        <p className="text-sm text-[var(--muted)]">{copy.hint}</p>

        <div>
          <p className="label">Entrega</p>
          <div className="mt-1 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setFulfillment("pickup")}
              className={`rounded-sm border px-3 py-2.5 text-left text-sm transition ${
                fulfillment === "pickup"
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                  : "border-[var(--border)] bg-white"
              }`}
            >
              Retiro en taller
            </button>
            <button
              type="button"
              onClick={() => setFulfillment("delivery")}
              className={`rounded-sm border px-3 py-2.5 text-left text-sm transition ${
                fulfillment === "delivery"
                  ? "border-[var(--wood-800)] bg-[var(--wood-800)] text-white"
                  : "border-[var(--border)] bg-white"
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
            Nombre completo
          </label>
          <input id="name" name="name" required className="input" />
        </div>
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
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="phone">
              Teléfono *
            </label>
            <input id="phone" name="phone" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="taxId">
              RNC / Cédula
            </label>
            <input id="taxId" name="taxId" className="input" />
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
            className="input"
            placeholder={
              fulfillment === "delivery"
                ? "Sector, calle, referencia…"
                : "Opcional"
            }
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notas
          </label>
          <textarea id="notes" name="notes" rows={3} className="input" />
        </div>

        <p className="rounded-sm bg-[#f4ebe3] px-3 py-2 text-xs leading-relaxed text-[var(--wood-800)]">
          {STORE_LOGISTICS.payments} {STORE_LOGISTICS.leadTime}
        </p>
      </div>

      <div>
        <h2 className="font-display text-2xl text-[var(--wood-950)]">
          Resumen
        </h2>
        <ul className="mt-4 space-y-2 border border-[var(--border)] bg-white p-4 text-sm">
          {items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-3">
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>{formatCurrency(i.price * i.quantity)}</span>
            </li>
          ))}
          <li className="flex justify-between border-t border-[var(--border)] pt-2 text-[var(--muted)]">
            <span>ITBIS</span>
            <span>{formatCurrency(totals.tax)}</span>
          </li>
          <li className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatCurrency(totals.total)}</span>
          </li>
        </ul>

        {error ? (
          <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending || (mode === "online" && !stripeReady)}
          className="store-cta store-cta-primary mt-6 w-full disabled:opacity-60"
        >
          {pending ? "Procesando…" : copy.submit}
        </button>
        <Link
          href="/checkout"
          className="mt-4 block text-center text-sm text-[var(--muted)] underline-offset-2 hover:underline"
        >
          ← Elegir otra opción
        </Link>
      </div>
    </form>
  );
}

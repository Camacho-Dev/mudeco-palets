"use client";

import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/store/cart-context";
import { formatCurrency } from "@/lib/format";
import { submitWebCheckout } from "@/app/(store)/checkout/actions";
import Link from "next/link";

export function CheckoutForm({ stripeReady }: { stripeReady: boolean }) {
  const { items, clear } = useCart();
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

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

  function run(mode: "quote" | "local" | "online", fd: FormData) {
    setError("");
    fd.set("mode", mode);
    fd.set("cartJson", cartJson);
    fd.set("origin", window.location.origin);
    start(async () => {
      try {
        await submitWebCheckout(fd);
        clear();
      } catch (e) {
        const dig =
          e && typeof e === "object" && "digest" in e
            ? String((e as { digest?: string }).digest)
            : "";
        if (dig.startsWith("NEXT_REDIRECT")) return;
        setError(e instanceof Error ? e.message : "No se pudo completar");
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
    <form
      className="grid gap-10 lg:grid-cols-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="space-y-4">
        <h2 className="font-display text-2xl text-[var(--wood-950)]">
          Tus datos
        </h2>
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
              Teléfono
            </label>
            <input id="phone" name="phone" className="input" />
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
            Dirección
          </label>
          <input id="address" name="address" className="input" />
        </div>
        <div>
          <label className="label" htmlFor="notes">
            Notas
          </label>
          <textarea id="notes" name="notes" rows={3} className="input" />
        </div>
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

        <div className="mt-6 space-y-3">
          <button
            type="button"
            disabled={pending || !stripeReady}
            className="store-cta store-cta-primary w-full disabled:opacity-60"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form) run("online", new FormData(form));
            }}
          >
            {stripeReady
              ? pending
                ? "Procesando…"
                : "Pagar ahora en línea"
              : "Pago en línea (falta configurar Stripe)"}
          </button>
          <button
            type="button"
            disabled={pending}
            className="w-full border border-[var(--wood-800)] px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] text-[var(--wood-950)] uppercase transition hover:bg-[var(--wood-950)] hover:text-white disabled:opacity-60"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form) run("local", new FormData(form));
            }}
          >
            Pagar en el local
          </button>
          <button
            type="button"
            disabled={pending}
            className="w-full text-sm text-[var(--muted)] underline-offset-2 hover:underline disabled:opacity-60"
            onClick={(e) => {
              const form = e.currentTarget.form;
              if (form) run("quote", new FormData(form));
            }}
          >
            Solo pedir cotización
          </button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
          Si pagas en línea, te enviaremos la factura por correo. Si eliges
          pagar en el local, el pedido queda registrado para el equipo de
          ventas.
        </p>
      </div>
    </form>
  );
}

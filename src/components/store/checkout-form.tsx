"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/store/cart-context";
import { useStoreConfig } from "@/components/store/store-config";
import { formatCurrency, roundMoney } from "@/lib/format";
import {
  estimatedReadyDate,
  needsFabrication,
  splitPayment,
} from "@/lib/made-to-order";
import { submitWebCheckout } from "@/app/(store)/checkout/actions";
import { STORE_LOGISTICS } from "@/lib/store-info";
import { Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

const MODE_COPY = {
  transfer: {
    title: "Transferencia bancaria",
    submit: "Confirmar y enviar comprobante",
    hint: "Transfiere a cualquiera de nuestras cuentas oficiales y adjunta aquí tu comprobante para procesar tu orden.",
  },
  online: {
    title: "Pagar en línea",
    submit: "Ir a pagar",
    hint: "Te redirigimos a Stripe. Al completar, recibirás la factura por correo.",
  },
  local: {
    title: "Retiro en taller / Pago local",
    submit: "Confirmar pedido",
    hint: "Para retiros en taller o pago local puedes adjuntar tu comprobante de depósito ahora (opcional) o pagar al retirar.",
  },
  quote: {
    title: "Pedir cotización",
    submit: "Enviar cotización",
    hint: "Sin compromiso. El equipo te contacta con la propuesta formal.",
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
  const mtoConfig = useStoreConfig();
  const [error, setError] = useState("");
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const cleanSessionName =
    session?.user?.name &&
    session.user.name.trim().toLowerCase() !== "administrador"
      ? session.user.name
      : "";
  const [name, setName] = useState(cleanSessionName);
  const [email, setEmail] = useState(session?.user?.email ?? "");
  const [phone, setPhone] = useState("");
  const [taxId, setTaxId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const copy = MODE_COPY[mode];

  const isReceiptMandatory = mode === "transfer";

  // Auto-fill name/email when session loads asynchronously
  useEffect(() => {
    if (
      session?.user?.name &&
      session.user.name.trim().toLowerCase() !== "administrador" &&
      !name
    ) {
      setName(session.user.name);
    }
    if (session?.user?.email && !email) setEmail(session.user.email);
  }, [session?.user?.name, session?.user?.email, name, email]);

  // Restaurar borrador de campos en sessionStorage para no perder datos al cambiar de modalidad
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name) setName((prev) => prev || parsed.name);
        if (parsed.email) setEmail((prev) => prev || parsed.email);
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
        JSON.stringify({ name, email, phone, taxId, address, notes, fulfillment }),
      );
    } catch {
      /* ignore */
    }
  }, [name, email, phone, taxId, address, notes, fulfillment]);

  const totals = useMemo(() => {
    const subtotal = roundMoney(
      items.reduce((s, i) => s + roundMoney(i.price * i.quantity), 0),
    );
    const tax = roundMoney(
      items.reduce(
        (s, i) => s + roundMoney(roundMoney(i.price * i.quantity) * i.taxRate),
        0,
      ),
    );
    return { subtotal, tax, total: roundMoney(subtotal + tax) };
  }, [items]);

  const split = useMemo(
    () =>
      splitPayment(
        items.map((i) => ({
          quantity: i.quantity,
          unitPrice: i.price,
          taxRate: i.taxRate,
          madeToOrder: needsFabrication(
            { stock: i.stock ?? 0, madeToOrderOnly: i.madeToOrderOnly },
            i.quantity,
          ),
        })),
        totals.total,
        mtoConfig.depositPercent,
      ),
    [items, totals.total, mtoConfig.depositPercent],
  );

  const readyDateLabel = useMemo(() => {
    if (!split.hasMadeToOrder) return null;
    return estimatedReadyDate(mtoConfig).toLocaleDateString("es-DO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [split.hasMadeToOrder, mtoConfig]);

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

    // Validación estricta y obligatoria de número de WhatsApp / Teléfono
    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone.trim() || phoneDigits.length < 10) {
      setError(
        "El número de WhatsApp es obligatorio y debe tener al menos 10 dígitos (ej: 809-555-0123).",
      );
      const phoneInput = document.getElementById("phone");
      phoneInput?.focus();
      return;
    }

    // Validación obligatoria de comprobante para transferencia o retiro en taller
    if (isReceiptMandatory && !receiptFile) {
      setError(
        mode === "transfer"
          ? "Es obligatorio adjuntar el comprobante de transferencia para completar tu pedido."
          : "Es obligatorio adjuntar el comprobante de pago o depósito para confirmar tu orden de retiro en taller.",
      );
      return;
    }

    const fd = new FormData(e.currentTarget);
    fd.set("mode", mode);
    fd.set("cartJson", cartJson);
    fd.set("fulfillment", fulfillment);
    fd.set("origin", window.location.origin);
    if (receiptFile) {
      fd.set("receipt", receiptFile);
    }

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
            <label className="label flex items-center justify-between" htmlFor="phone">
              <span>WhatsApp / Teléfono *</span>
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Obligatorio
              </span>
            </label>
            <input
              id="phone"
              name="phone"
              required
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="809-555-0123"
              className="input font-medium"
            />
            <p className="mt-1 text-[11px] text-[var(--muted)]">
              Mínimo 10 dígitos para coordinar tu entrega o retiro.
            </p>
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

        {/* =========================================================================
            ZONA DE COMPROBANTE OBLIGATORIO PARA TRANSFERENCIA O RETIRO EN TALLER
           ========================================================================= */}
        {isReceiptMandatory && (
          <div className="rounded-2xl border-2 border-dashed border-[#c9a15a] bg-[#faf6f1] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#c9a15a] text-xs font-bold text-[#0a0a0a]">
                    *
                  </span>
                  <label className="text-sm font-bold text-[var(--wood-950)]">
                    Comprobante de Pago / Depósito (Obligatorio)
                  </label>
                </div>
                <p className="mt-1 text-xs text-[var(--wood-800)] leading-relaxed">
                  {mode === "transfer"
                    ? "Es obligatorio adjuntar la foto, captura o PDF del comprobante de transferencia bancaria (Banreservas, Popular, BHD, etc.)."
                    : "Para órdenes de retiro en taller, es obligatorio adjuntar el comprobante o foto de tu anticipo o depósito para reservar tus piezas."}
                </p>
              </div>
              <span className="rounded-md bg-[#c9a15a]/20 border border-[#c9a15a]/40 px-2 py-0.5 text-[0.62rem] font-bold text-[#8a6524] uppercase tracking-wider shrink-0">
                Requerido
              </span>
            </div>

            <div className="mt-4">
              {!receiptFile ? (
                <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#c9a15a]/50 bg-white p-6 text-center transition hover:border-[#c9a15a] hover:bg-[#fffdfa]">
                  <Upload className="h-8 w-8 text-[#b0894f] transition group-hover:scale-110" />
                  <p className="mt-2 text-xs font-semibold text-[var(--wood-950)]">
                    Haz clic aquí para seleccionar tu comprobante
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--muted)]">
                    Formatos permitidos: JPG, PNG, WebP o PDF (máx. 5 MB)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="sr-only"
                    required
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) {
                        setError("El archivo seleccionado excede el límite de 5 MB.");
                        return;
                      }
                      setError("");
                      setReceiptFile(file);
                      if (file.type.startsWith("image/")) {
                        const url = URL.createObjectURL(file);
                        setReceiptPreview(url);
                      } else {
                        setReceiptPreview(null);
                      }
                    }}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50/70 p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {receiptPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={receiptPreview}
                        alt="Comprobante"
                        className="h-12 w-12 rounded-lg object-cover border border-emerald-300 shrink-0"
                      />
                    ) : (
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-emerald-800 font-bold text-xs">
                        PDF
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-bold text-emerald-900">
                        {receiptFile.name}
                      </p>
                      <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>
                          {(receiptFile.size / 1024).toFixed(1)} KB · Comprobante cargado correctamente
                        </span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setReceiptFile(null);
                      setReceiptPreview(null);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-300 text-emerald-800 transition hover:bg-emerald-100 cursor-pointer"
                    title="Cambiar archivo"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

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
              <span>ITBIS</span>
              <span>{formatCurrency(totals.tax)}</span>
            </li>
            <li className="flex justify-between border-t border-[var(--border)] pt-3 text-base font-bold text-[var(--wood-950)]">
              <span>{split.hasMadeToOrder && mode !== "quote" ? "Total del pedido" : "Total a pagar"}</span>
              <span className="text-lg text-[#8a6a3a]">{formatCurrency(totals.total)}</span>
            </li>
          </ul>

          {split.hasMadeToOrder && (
            <div className="mt-3 rounded-xl border border-[#c9a15a]/45 bg-[#faf6f1] p-3.5 text-xs space-y-1.5">
              {mode !== "quote" && (
                <>
                  <div className="flex justify-between font-bold text-[var(--wood-950)]">
                    <span>Abono a pagar hoy ({mtoConfig.depositPercent}%)</span>
                    <span className="text-[#8a6a3a] text-sm">{formatCurrency(split.dueNow)}</span>
                  </div>
                  <div className="flex justify-between text-[var(--muted)]">
                    <span>Saldo contra entrega</span>
                    <span>{formatCurrency(split.balance)}</span>
                  </div>
                </>
              )}
              <p className="text-[11px] text-[#8a6a3a] font-medium pt-0.5">
                Fabricación por encargo: {mtoConfig.leadTimeText}
                {readyDateLabel ? ` (estimado ${readyDateLabel})` : ""}
              </p>
            </div>
          )}

          {error ? (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
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

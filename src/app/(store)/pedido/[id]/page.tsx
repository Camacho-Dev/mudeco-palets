import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizeOnlinePaidOrder } from "@/lib/web-checkout";
import { sendInvoiceEmail } from "@/lib/mail";
import { ClearCartOnSuccess } from "@/components/store/clear-cart";
import { getStoreCompany } from "@/lib/store";
import { DOMINICAN_BANKS, storeWhatsApp } from "@/lib/store-info";
import { Building2, MessageCircle } from "lucide-react";

export const metadata = { title: "Pedido" };

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;

  let order = await prisma.webOrder.findUnique({
    where: { id },
    include: {
      items: true,
      invoice: true,
      quote: true,
    },
  });
  if (!order) notFound();

  const company = await getStoreCompany();
  const waPhotos = storeWhatsApp(
    company.phone,
    `Hola, adjunto fotos de mi solicitud ${order.number}.`,
  );
  const waTransfer = storeWhatsApp(
    company.phone,
    `Hola ${company.name}, adjunto el comprobante de pago de mi pedido ${order.number} por ${formatCurrency(order.total)}.`,
  );

  // Si vuelve de Stripe y el webhook aún no corrió, cerramos el pago aquí
  if (
    ok === "online" &&
    order.status === "AWAITING_PAYMENT" &&
    order.stripeSessionId &&
    isStripeConfigured()
  ) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );
      if (session.payment_status === "paid") {
        order = (await finalizeOnlinePaidOrder(order.id)) as typeof order;
        if (order.invoiceId) {
          try {
            await sendInvoiceEmail(order.invoiceId);
          } catch {
            /* SMTP opcional en dev */
          }
        }
        order = await prisma.webOrder.findUniqueOrThrow({
          where: { id },
          include: { items: true, invoice: true, quote: true },
        });
      }
    } catch {
      /* ignore */
    }
  }

  const isTransfer =
    ok === "transferencia" || order.notes?.includes("Transferencia bancaria");
  const isRepair = order.notes?.includes("[REPARACIÓN]");
  const isContact = order.notes?.includes("[CONSULTA]");
  const title =
    isTransfer
      ? "Pedido registrado por transferencia"
      : order.type === "QUOTE"
        ? isRepair
          ? "Solicitud de reparación recibida"
          : isContact
            ? "Mensaje recibido"
            : "Cotización recibida"
        : order.paymentMode === "LOCAL"
          ? "Pedido para pagar en el local"
          : order.status === "PAID"
            ? "Pago confirmado"
            : "Pedido registrado";

  const detail =
    isTransfer
      ? "Realiza la transferencia a una de nuestras cuentas bancarias a continuación y envíanos el comprobante por WhatsApp para procesar tu entrega."
      : order.type === "QUOTE"
        ? isRepair
          ? "Revisaremos tu mueble y te contactaremos. Si tienes fotos, envíalas por WhatsApp."
          : isContact
            ? "Te responderemos pronto a tu correo o teléfono."
            : "Nuestro equipo revisará tu cotización y te contactará pronto."
        : order.paymentMode === "LOCAL"
          ? "Tu factura quedó pendiente. Paga en el local mencionando el número de pedido."
          : order.status === "PAID"
            ? "Gracias. Te enviamos la factura a tu correo (si el SMTP está configurado)."
            : "Estamos confirmando tu pago en línea…";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      {ok ? <ClearCartOnSuccess /> : null}
      <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
        {order.number}
      </p>
      <h1 className="font-display mt-3 text-4xl text-[var(--wood-950)]">
        {title}
      </h1>
      <p className="mt-3 text-[var(--muted)]">{detail}</p>

      <div className="mt-8 border border-[var(--border)] bg-white p-5 text-sm">
        <p>
          <span className="text-[var(--muted)]">Cliente:</span>{" "}
          {order.customerName}
        </p>
        <p className="mt-1">
          <span className="text-[var(--muted)]">Email:</span>{" "}
          {order.customerEmail}
        </p>
        {order.invoice ? (
          <p className="mt-1">
            <span className="text-[var(--muted)]">Factura:</span>{" "}
            {order.invoice.number} · {order.invoice.status}
          </p>
        ) : null}
        {order.quote ? (
          <p className="mt-1">
            <span className="text-[var(--muted)]">Cotización:</span>{" "}
            {order.quote.number}
          </p>
        ) : null}
        <p className="mt-3 text-base font-semibold">
          Total {formatCurrency(order.total)}
        </p>
      </div>

      {isTransfer ? (
        <div className="mt-6 space-y-3 rounded-lg border border-[#b0894f]/40 bg-[#fbf7f2] p-5">
          <p className="text-xs font-semibold tracking-wider text-[#b0894f] uppercase">
            Cuentas para transferir
          </p>
          <div className="grid gap-3 sm:grid-cols-3 pt-1">
            {DOMINICAN_BANKS.map((b) => (
              <div
                key={b.bank}
                className="rounded border border-[var(--border)] bg-white p-3 text-xs"
              >
                <p className="font-bold text-[var(--wood-950)]">{b.bank}</p>
                <p className="mt-1 font-mono font-semibold text-sm text-[var(--wood-950)]">
                  {b.accountNumber}
                </p>
                <p className="text-[11px] text-[var(--muted)]">{b.type}</p>
                <p className="text-[11px] text-[var(--muted)]">RNC: {b.rnc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--muted)] pt-1">
            Una vez hecha la transferencia, pulsa el botón verde para enviarnos el comprobante directamente a nuestro WhatsApp:
          </p>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        {isTransfer ? (
          <a
            href={waTransfer}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-emerald-800"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Enviar comprobante por WhatsApp</span>
          </a>
        ) : null}
        {isRepair || order.notes?.includes("Fotos seleccionadas") ? (
          <a
            href={waPhotos}
            target="_blank"
            rel="noreferrer"
            className="store-cta store-cta-primary"
          >
            Enviar fotos por WhatsApp
          </a>
        ) : null}
        <Link
          href="/catalogo"
          className={
            isRepair || order.notes?.includes("Fotos seleccionadas")
              ? "inline-flex items-center border border-[var(--border)] px-5 py-3 text-sm"
              : "store-cta store-cta-primary"
          }
        >
          Seguir explorando
        </Link>
        <Link
          href="/"
          className="inline-flex items-center border border-[var(--border)] px-5 py-3 text-sm"
        >
          Inicio
        </Link>
      </div>
    </div>
  );
}

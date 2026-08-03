import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizeOnlinePaidOrder } from "@/lib/web-checkout";
import { sendInvoiceEmail } from "@/lib/mail";
import { ClearCartOnSuccess } from "@/components/store/clear-cart";

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

  const title =
    order.type === "QUOTE"
      ? "Cotización recibida"
      : order.paymentMode === "LOCAL"
        ? "Pedido para pagar en el local"
        : order.status === "PAID"
          ? "Pago confirmado"
          : "Pedido registrado";

  const detail =
    order.type === "QUOTE"
      ? "Nuestro equipo revisará tu cotización y te contactará pronto."
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

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/catalogo" className="store-cta store-cta-primary">
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

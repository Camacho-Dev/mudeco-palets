import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isStaff } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { finalizeOnlinePaidOrder } from "@/lib/web-checkout";
import { sendInvoiceEmail } from "@/lib/mail";
import { ClearCartOnSuccess } from "@/components/store/clear-cart";
import { getStoreCompany } from "@/lib/store";
import { getDominicanBanks, storeWhatsApp } from "@/lib/store-info";
import { productImage } from "@/lib/product-image";
import { extractReceiptFromNotes } from "@/lib/order-receipt";
import { ReceiptUploader, BankAccountCard } from "@/components/store/receipt-uploader";
import { AnimatedSuccessCheck } from "@/components/store/animated-success-check";
import { OrderReviewPrompt } from "@/components/store/order-review-prompt";
import { OrderTimelineTracker } from "@/components/store/order-timeline-tracker";
import {
  Building2,
  MapPin,
  User,
  FileDown,
  MessageCircle,
  ShoppingBag,
  Package,
  Sparkles,
  Phone,
  MessageSquare,
  Clock,
} from "lucide-react";

export const metadata = { title: "Confirmación de Pedido · Mudeco Palets" };

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

function maskPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 4) return "***";
  return `***-***-${digits.slice(-4)}`;
}

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string }>;
}) {
  const { id } = await params;
  const { ok } = await searchParams;
  const session = await auth();

  let order = await prisma.webOrder.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      invoice: true,
      quote: true,
    },
  });
  if (!order) notFound();

  const isViewerStaff = Boolean(session?.user?.id && isStaff(session.user.role));
  const isViewerOwner = Boolean(
    session?.user?.email &&
      order.customerEmail &&
      session.user.email.toLowerCase() === order.customerEmail.toLowerCase(),
  );
  const isAuthorizedViewer = isViewerStaff || isViewerOwner;

  // Para órdenes de compra (que requieren cuenta al hacer checkout), exigir sesión del titular o staff
  if (order.type === "SALE" && !isAuthorizedViewer) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/pedido/${id}`)}`);
  }

  const company = await getStoreCompany();
  const banks = getDominicanBanks(company);

  // Si vuelve de Stripe y el webhook aún no corrió, cerramos el pago aquí
  if (
    ok === "online" &&
    order.status === "AWAITING_PAYMENT" &&
    order.stripeSessionId &&
    isStripeConfigured()
  ) {
    try {
      const stripe = getStripe();
      const stripeSession = await stripe.checkout.sessions.retrieve(
        order.stripeSessionId,
      );
      if (stripeSession.payment_status === "paid") {
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
          include: {
            items: { include: { product: true } },
            invoice: true,
            quote: true,
          },
        });
      }
    } catch {
      /* ignore */
    }
  }

  const isTransfer = Boolean(
    ok === "transferencia" ||
      order.notes?.includes("Transferencia bancaria") ||
      order.notes?.includes("[Pago: Transferencia bancaria]"),
  );
  const isContact =
    order.serviceKind === "CONTACT" || Boolean(order.notes?.includes("[CONSULTA]"));
  const isPaid =
    order.status === "PAID" ||
    order.status === "DONE" ||
    order.invoice?.status === "PAID";
  const receipt = extractReceiptFromNotes(order.notes);
  const cleanNotes = (order.notes || "")
    .replace(/\[COMPROBANTE_PAGO:\s*\{[\s\S]*?\}\]/g, "")
    .replace(/\[COMPROBANTE:[^\]]+\]/g, "")
    .replace(/\[CONSULTA\]/g, "")
    .replace(/\[COTIZACIÓN A MEDIDA\]/g, "")
    .trim();

  const waTransfer = storeWhatsApp(
    company.phone,
    `Hola ${company.name}, adjunto el comprobante de pago de mi pedido ${order.number} por ${formatCurrency(order.total)}.`,
  );
  const waPhotos = storeWhatsApp(
    company.phone,
    `Hola, adjunto fotos de mi solicitud ${order.number}.`,
  );

  // Título y encabezado principal según validación real del pago
  const mainTitle = isPaid
    ? "¡Pago confirmado con éxito!"
    : isTransfer
      ? receipt
        ? "Pedido en proceso de verificación"
        : "¡Pedido registrado · En proceso!"
      : order.type === "QUOTE"
        ? isContact
          ? "¡Mensaje recibido · En proceso!"
          : "¡Cotización en proceso!"
        : "¡Pedido registrado · En proceso!";

  const mainSubtitle = isPaid
    ? "Tu pago ha sido validado y acreditado en cuenta. Hemos confirmado tu orden de fabricación y habilitado tu factura oficial."
    : isTransfer
      ? receipt
        ? "Hemos recibido tu comprobante bancario. Nuestro equipo está validando que el dinero haya ingresado a la cuenta correspondiente para confirmar tu pedido y habilitar tu factura."
        : "Tu pedido ha sido registrado en nuestro taller. Realiza tu transferencia y sube el comprobante a continuación; una vez validemos que el dinero ingresó a la cuenta correspondiente, confirmaremos tu pedido y habilitaremos tu factura."
      : order.type === "QUOTE"
        ? isContact
          ? "Gracias por comunicarte con nosotros. Nuestro equipo artesanal revisará tu mensaje y te contactará a la brevedad."
          : "Hemos recibido tu solicitud de cotización personalizada. Te responderemos pronto con la propuesta formal."
        : "Tu pedido está en proceso con pago pendiente de validación en el local o contra entrega.";

  const fulfillmentType = order.notes?.includes("[Entrega a domicilio]")
    ? "Entrega a domicilio"
    : "Retiro en taller";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf6f0] via-[#f7f1e7] to-[#eee4d4] py-10 px-4 sm:px-6 lg:px-8">
      {ok ? <ClearCartOnSuccess /> : null}

      <div className="mx-auto max-w-3xl space-y-6">
        {/* ENCABEZADO DE ESTADO DEL PEDIDO */}
        <div className="rounded-2xl border border-[#e5d9c7] bg-white p-8 sm:p-10 text-center shadow-sm">
          <AnimatedSuccessCheck
            title={mainTitle}
            subtitle={mainSubtitle}
            orderNumber={order.number}
            tone={isPaid ? "success" : "processing"}
            statusLabel={
              isPaid
                ? "Pago confirmado"
                : isTransfer
                  ? receipt
                    ? "En proceso · Verificando transferencia"
                    : "En proceso · Pendiente de transferencia"
                  : isContact
                    ? "Consulta en proceso"
                    : order.type === "QUOTE"
                      ? "Cotización en proceso"
                      : "En proceso · Pendiente de pago"
            }
            createdAt={order.createdAt}
          />
        </div>

        {/* RASTREADOR DE ETAPAS DEL PEDIDO */}
        {order.type === "SALE" && (
          <OrderTimelineTracker
            orderNumber={order.number}
            isPaid={isPaid}
            isTransfer={isTransfer}
            isDone={order.status === "DONE"}
            hasReceipt={Boolean(receipt)}
            fulfillmentType={fulfillmentType}
          />
        )}

        {/* ZONA DE CARGA DEL COMPROBANTE ADJUNTO (CLIENTE AUTENTICADO) */}
        {isTransfer && isAuthorizedViewer && (
          <ReceiptUploader
            orderId={order.id}
            orderNumber={order.number}
            totalFormatted={formatCurrency(order.total)}
            initialReceipt={receipt}
            whatsAppUrl={waTransfer}
          />
        )}

        {/* CUENTAS BANCARIAS OFICIALES DOMINICANAS */}
        {isTransfer && (
          <div className="rounded-2xl border border-[#e5d9c7] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b0894f]/15 text-[#8b6534]">
                  <Building2 className="h-4.5 w-4.5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-[var(--wood-950)]">
                    Cuentas Bancarias Oficiales
                  </h3>
                  <p className="text-xs text-[var(--muted)]">
                    Transfiere el monto exacto de{" "}
                    <span className="font-bold text-[var(--wood-950)]">
                      {formatCurrency(order.total)}
                    </span>{" "}
                    a cualquiera de nuestras cuentas
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-900 border border-amber-200">
                <Sparkles className="h-3 w-3 text-amber-600" />
                Transferencia o Depósito
              </span>
            </div>

            <div className="mt-5 grid gap-3.5 sm:grid-cols-3">
              {banks.map((b) => (
                <BankAccountCard
                  key={b.bank}
                  bank={b.bank}
                  accountNumber={b.accountNumber}
                  type={b.type}
                  holder={b.holder}
                  rnc={b.rnc}
                />
              ))}
            </div>
          </div>
        )}

        {/* RESUMEN DEL PEDIDO O CONSULTA */}
        <div className="rounded-2xl border border-[#e5d9c7] bg-white p-6 shadow-sm sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#b0894f]/15 text-[#8b6534]">
                {isContact ? (
                  <MessageSquare className="h-4.5 w-4.5" />
                ) : (
                  <Package className="h-4.5 w-4.5" />
                )}
              </span>
              <div>
                <h3 className="text-base font-bold text-[var(--wood-950)]">
                  {isContact ? "Resumen de tu Consulta" : "Resumen de la Orden"}
                </h3>
                <p className="text-xs text-[var(--muted)]">
                  {isContact
                    ? "Datos de contacto y mensaje enviado al taller"
                    : "Detalles de cliente, destino y piezas en carpintería"}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-[var(--wood-900)] bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200">
              {order.number}
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-2 rounded-xl bg-gradient-to-br from-stone-50/90 to-stone-50/40 p-4 border border-stone-200/80">
              <p className="font-bold text-[var(--wood-900)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-[#b0894f]" />
                Datos del Cliente
              </p>
              <p className="font-bold text-sm text-[var(--wood-950)]">{order.customerName}</p>
              <p className="text-stone-600 font-medium">
                {isAuthorizedViewer ? order.customerEmail : maskEmail(order.customerEmail)}
              </p>
              {order.customerPhone ? (
                <p className="text-stone-600 flex items-center gap-1">
                  <Phone className="h-3 w-3 text-stone-400" />
                  <span>
                    {isAuthorizedViewer ? order.customerPhone : maskPhone(order.customerPhone)}
                  </span>
                </p>
              ) : null}
              {order.customerTaxId && isAuthorizedViewer ? (
                <p className="text-stone-500 text-[11px]">RNC/Cédula: {order.customerTaxId}</p>
              ) : null}
            </div>

            {isContact ? (
              <div className="space-y-2 rounded-xl bg-gradient-to-br from-stone-50/90 to-stone-50/40 p-4 border border-stone-200/80">
                <p className="font-bold text-[var(--wood-900)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-[#b0894f]" />
                  Mensaje Enviado
                </p>
                <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                  {isAuthorizedViewer
                    ? cleanNotes || "Consulta general recibida por el taller."
                    : "Hemos registrado tu consulta. Te responderemos a la brevedad por WhatsApp o correo."}
                </p>
              </div>
            ) : (
              <div className="space-y-2 rounded-xl bg-gradient-to-br from-stone-50/90 to-stone-50/40 p-4 border border-stone-200/80">
                <p className="font-bold text-[var(--wood-900)] uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-[#b0894f]" />
                  Modalidad de Entrega
                </p>
                <p className="font-bold text-sm text-[var(--wood-950)]">{fulfillmentType}</p>
                {order.customerAddress ? (
                  <p className="text-stone-600 leading-relaxed">
                    {isAuthorizedViewer ? order.customerAddress : "Dirección registrada en tu orden"}
                  </p>
                ) : (
                  <p className="text-stone-500 leading-relaxed">
                    Retiro directo en nuestro taller artesanal: {company.address}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* LÍNEAS DE PRODUCTOS */}
          {order.items.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-[var(--wood-900)] uppercase tracking-wider mb-3">
                Piezas artesanales ({order.items.length})
              </p>
              <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
                {order.items.map((it) => {
                  const img = it.product ? productImage(it.product) : null;
                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3.5 p-3.5 text-xs bg-white hover:bg-[#fffdfa] transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {img ? (
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-stone-50 shadow-2xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={it.description}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-[var(--wood-950)] truncate">
                            {it.description}
                          </p>
                          <p className="text-[var(--muted)] mt-0.5">
                            Cant: <span className="font-semibold text-stone-800">{it.quantity}</span> × {formatCurrency(it.unitPrice)}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-[var(--wood-950)] shrink-0 font-mono">
                        {formatCurrency(it.lineTotal)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TOTALES (solo cuando hay monto mayor a 0) */}
          {order.total > 0 && (
            <div className="mt-5 border-t border-stone-200 pt-4 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal neto</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>ITBIS (18%)</span>
                <span className="font-mono">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[var(--wood-950)] border-t border-stone-200 pt-2.5">
                <span>Total general</span>
                <span className="font-mono text-lg text-emerald-800">{formatCurrency(order.total)}</span>
              </div>
            </div>
          )}
        </div>

        {/* CALIFICACIÓN Y TESTIMONIO EN TIEMPO REAL (solo cuando el pago ya fue confirmado) */}
        {order.type === "SALE" && isAuthorizedViewer && isPaid && (
          <OrderReviewPrompt
            orderId={order.id}
            orderNumber={order.number}
            customerName={order.customerName}
            customerEmail={order.customerEmail}
            productName={order.items[0]?.description}
            city="Santo Domingo"
          />
        )}

        {/* ACCIONES Y BOTONES FINALES */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
          {order.invoice && isAuthorizedViewer ? (
            isPaid ? (
              <a
                href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--wood-950)] shadow-xs transition hover:bg-[#fbf7f2] hover:border-[#b0894f]"
              >
                <FileDown className="h-4 w-4 text-[#b0894f]" />
                <span>Descargar Factura PDF ({order.invoice.number})</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-xs font-semibold text-amber-900">
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  Factura disponible cuando se valide el pago en cuenta
                </span>
              </div>
            )
          ) : null}

          {order.quote && isAuthorizedViewer && !isContact ? (
            <a
              href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--wood-950)] shadow-xs transition hover:bg-[#fbf7f2] hover:border-[#b0894f]"
            >
              <FileDown className="h-4 w-4 text-[#b0894f]" />
              <span>Descargar Cotización PDF ({order.quote.number})</span>
            </a>
          ) : null}

          {isTransfer && (
            <a
              href={waTransfer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-95"
            >
              <MessageCircle className="h-4.5 w-4.5" />
              <span>Reenviar a WhatsApp</span>
            </a>
          )}

          {order.notes?.includes("Fotos seleccionadas") ? (
            <a
              href={waPhotos}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#b0894f] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#97733e] transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar fotos por WhatsApp</span>
            </a>
          ) : null}

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--wood-900)] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--wood-800)] active:scale-95"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            <span>Seguir explorando catálogo</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-[var(--border)] bg-white px-5 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

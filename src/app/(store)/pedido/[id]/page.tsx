import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getVerifiedApiSession } from "@/lib/session";
import { hasRecentOrderAccessCookie } from "@/lib/order-access-cookie";
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
  const session = await getVerifiedApiSession();

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

  const isViewerOwner = Boolean(
    session?.user?.email &&
      order.customerEmail &&
      session.user.email.toLowerCase() === order.customerEmail.toLowerCase(),
  );

  // Si hay una sesión iniciada pero el pedido pertenece a OTRA cuenta de correo,
  // bloquear inmediatamente y redirigir a /mis-pedidos de la cuenta actual (aislamiento total entre cuentas)
  if (session?.user?.email && !isViewerOwner) {
    redirect("/mis-pedidos");
  }

  // Si no hay sesión iniciada, solo permitir ver consultas/cotizaciones recién creadas en este navegador;
  // cualquier orden de compra (SALE) exige iniciar sesión con la cuenta titular del pedido
  const hasRecentGuestCookie =
    !session?.user?.email &&
    order.type !== "SALE" &&
    (await hasRecentOrderAccessCookie(id));

  const isAuthorizedViewer = isViewerOwner || hasRecentGuestCookie;

  if (!isAuthorizedViewer) {
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
      order.paymentMode === "TRANSFER" ||
      order.notes?.includes("Transferencia bancaria") ||
      order.notes?.includes("[Pago: Transferencia bancaria]"),
  );
  const isLocal = Boolean(
    ok === "local" ||
      order.paymentMode === "LOCAL" ||
      order.notes?.includes("Retiro en taller") ||
      order.notes?.includes("[Pago: Retiro en taller]"),
  );
  const requiresReceipt = isTransfer || isLocal;
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
    : requiresReceipt
      ? receipt
        ? "Pedido en proceso de verificación"
        : "¡Pedido registrado · Comprobante requerido!"
      : order.type === "QUOTE"
        ? isContact
          ? "¡Mensaje recibido · En proceso!"
          : "¡Cotización en proceso!"
        : "¡Pedido registrado · En proceso!";

  const mainSubtitle = isPaid
    ? "Tu pago ha sido validado y acreditado en cuenta. Hemos confirmado tu orden de fabricación y habilitado tu factura oficial."
    : requiresReceipt
      ? receipt
        ? "Hemos recibido tu comprobante bancario. Nuestro equipo está validando que el dinero haya ingresado a la cuenta correspondiente para confirmar tu pedido y habilitar tu factura."
        : "Tu pedido ha sido registrado. Para procesar tu orden y preparar tus piezas para entrega o retiro en taller, es obligatorio adjuntar el comprobante de pago o transferencia."
      : order.type === "QUOTE"
        ? isContact
          ? "Gracias por comunicarte con nosotros. Nuestro equipo artesanal revisará tu mensaje y te contactará a la brevedad."
          : "Hemos recibido tu solicitud de cotización personalizada. Te responderemos pronto con la propuesta formal."
        : "Tu pedido está en proceso con pago pendiente de validación.";

  const fulfillmentType = order.notes?.includes("[Entrega a domicilio]")
    ? "Entrega a domicilio"
    : "Retiro en taller";

  return (
    <div className="min-h-screen bg-slate-50/90 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Resplandor superior suave */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-96 w-[700px] rounded-full bg-amber-400/10 blur-3xl" />

      {ok ? <ClearCartOnSuccess /> : null}

      <div className="relative mx-auto max-w-3xl space-y-6">
        {/* ENCABEZADO DE ESTADO DEL PEDIDO */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-xl backdrop-blur-sm">
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

        {/* ALERTA DE COMPROBANTE OBLIGATORIO PENDIENTE */}
        {requiresReceipt && !receipt && (
          <div className="rounded-3xl border-2 border-amber-400 bg-amber-50 p-6 sm:p-8 shadow-md">
            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white font-bold text-lg shadow-sm">
                !
              </span>
              <div>
                <h3 className="text-base font-bold text-amber-950">
                  Comprobante de pago obligatorio pendiente
                </h3>
                <p className="mt-1 text-xs text-amber-900 leading-relaxed">
                  Para las órdenes con pago por transferencia o retiro en taller, es indispensable adjuntar el comprobante o foto de tu transacción. Sube tu comprobante a continuación para que el taller valide el ingreso y habilite tu factura.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ZONA DE CARGA DEL COMPROBANTE ADJUNTO (SOLO TITULAR DE LA CUENTA DEL PEDIDO) */}
        {requiresReceipt && isViewerOwner && (
          <ReceiptUploader
            orderId={order.id}
            orderNumber={order.number}
            totalFormatted={formatCurrency(order.total)}
            initialReceipt={receipt}
            whatsAppUrl={waTransfer}
          />
        )}

        {/* CUENTAS BANCARIAS OFICIALES DOMINICANAS */}
        {requiresReceipt && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 ring-2 ring-amber-400/20">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Cuentas Bancarias Oficiales
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Transfiere el monto exacto de{" "}
                    <span className="font-bold text-slate-900 font-mono">
                      {formatCurrency(order.total)}
                    </span>{" "}
                    a cualquiera de nuestras cuentas
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Transferencia o Depósito
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-700 ring-2 ring-amber-400/20">
                {isContact ? (
                  <MessageSquare className="h-5 w-5" />
                ) : (
                  <Package className="h-5 w-5" />
                )}
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {isContact ? "Resumen de tu Consulta" : "Resumen de la Orden"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isContact
                    ? "Datos de contacto y mensaje enviado al taller"
                    : "Detalles de cliente, destino y piezas en carpintería"}
                </p>
              </div>
            </div>

            <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
              {order.number}
            </span>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 text-xs">
            <div className="space-y-2.5 rounded-2xl bg-slate-50/80 p-4.5 border border-slate-200/90 shadow-2xs">
              <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-amber-600" />
                Datos del Cliente
              </p>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 font-medium">
                {isAuthorizedViewer ? order.customerEmail : maskEmail(order.customerEmail)}
              </p>
              {order.customerPhone ? (
                <p className="text-slate-600 flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
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
              <div className="space-y-2.5 rounded-2xl bg-slate-50/80 p-4.5 border border-slate-200/90 shadow-2xs">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5 text-amber-600" />
                  Mensaje Enviado
                </p>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {isAuthorizedViewer
                    ? cleanNotes || "Consulta general recibida por el taller."
                    : "Hemos registrado tu consulta. Te responderemos a la brevedad por WhatsApp o correo."}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 rounded-2xl bg-slate-50/80 p-4.5 border border-slate-200/90 shadow-2xs">
                <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-amber-600" />
                  Modalidad de Entrega
                </p>
                <p className="font-bold text-sm text-slate-900">{fulfillmentType}</p>
                {order.customerAddress ? (
                  <p className="text-slate-600 leading-relaxed">
                    {isAuthorizedViewer ? order.customerAddress : "Dirección registrada en tu orden"}
                  </p>
                ) : (
                  <p className="text-slate-500 leading-relaxed">
                    Retiro directo en nuestro taller artesanal: {company.address}.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* LÍNEAS DE PRODUCTOS */}
          {order.items.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Piezas artesanales ({order.items.length})
              </p>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                {order.items.map((it) => {
                  const img = it.product ? productImage(it.product) : null;
                  return (
                    <div
                      key={it.id}
                      className="flex items-center justify-between gap-3.5 p-4 text-xs bg-white hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        {img ? (
                          <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-2xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={it.description}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : null}
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 truncate">
                            {it.description}
                          </p>
                          <p className="text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                            <span>
                              Cant: <span className="font-semibold text-slate-800">{it.quantity}</span> × {formatCurrency(it.unitPrice)}
                            </span>
                            {it.madeToOrder && (
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                Por encargo
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <p className="font-bold text-sm text-slate-900 shrink-0 font-mono">
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
            <div className="mt-6 border-t border-slate-100 pt-5 space-y-2 text-xs text-right">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal neto</span>
                <span className="font-mono">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>ITBIS (18%)</span>
                <span className="font-mono">{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-slate-900 border-t border-slate-200 pt-3">
                <span>Total general</span>
                <span className="font-mono text-xl font-extrabold text-emerald-700">{formatCurrency(order.total)}</span>
              </div>
              {order.madeToOrder && order.amountDueNow != null && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-left space-y-1.5">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Abono inicial requerido</span>
                    <span className="font-mono text-amber-800">{formatCurrency(order.amountDueNow)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Saldo contra entrega</span>
                    <span className="font-mono">{formatCurrency(Math.max(0, order.total - order.amountDueNow))}</span>
                  </div>
                  {order.estimatedReadyAt && (
                    <p className="text-[11px] font-medium text-amber-800 pt-1">
                      Entrega estimada:{" "}
                      {new Date(order.estimatedReadyAt).toLocaleDateString("es-DO", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  )}
                </div>
              )}
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
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          {order.invoice && isAuthorizedViewer ? (
            isPaid ? (
              <a
                href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:border-amber-400 active:scale-95"
              >
                <FileDown className="h-4 w-4 text-amber-600" />
                <span>Descargar Factura PDF ({order.invoice.number})</span>
              </a>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900">
                <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                <span>Factura oficial disponible cuando se valide el pago en cuenta</span>
              </div>
            )
          ) : null}

          {order.quote && isAuthorizedViewer && !isContact ? (
            <a
              href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-900 shadow-sm transition hover:bg-slate-50 hover:border-sky-400 active:scale-95"
            >
              <FileDown className="h-4 w-4 text-sky-600" />
              <span>Descargar Cotización PDF ({order.quote.number})</span>
            </a>
          ) : null}

          {isTransfer && (
            <a
              href={waTransfer}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-800 shadow-2xs transition hover:bg-emerald-100 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Reenviar a WhatsApp</span>
            </a>
          )}

          {order.notes?.includes("Fotos seleccionadas") ? (
            <a
              href={waPhotos}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-amber-700 transition active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Enviar fotos por WhatsApp</span>
            </a>
          ) : null}

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:bg-slate-800 active:scale-95"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Seguir explorando el catálogo</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-95"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

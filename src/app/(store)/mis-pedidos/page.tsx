import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { WEB_STATUS_LABEL, webOrderTypeLabel } from "@/lib/web-order-labels";
import { extractReceiptFromNotes } from "@/lib/order-receipt";
import { AccountSettingsCard } from "@/components/store/account-settings-card";
import {
  Package,
  FileDown,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  Upload,
  Receipt,
  MapPin,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "Mi Perfil e Historial de Compras · Mudeco Palets",
  description:
    "Consulta la información de tu perfil, tu historial completo de compras, cotizaciones y facturas en Mudeco Palets.",
};

export default async function MisPedidosPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/mis-pedidos");
  }

  const email = session.user.email.toLowerCase().trim();
  const [dbUser, orders] = await Promise.all([
    prisma.user
      .findUnique({
        where: { email },
        select: { name: true, phone: true, address: true },
      })
      .catch(() => null),
    prisma.webOrder.findMany({
      where: {
        customerEmail: { equals: email, mode: "insensitive" },
      },
      include: {
        items: true,
        invoice: true,
        quote: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const rawName = dbUser?.name || session.user.name || "";
  const latestOrderWithName = orders.find(
    (o) =>
      o.customerName &&
      o.customerName.trim().toLowerCase() !== "administrador" &&
      o.customerName.trim().length > 1,
  );
  const displayName =
    rawName.trim().toLowerCase() === "administrador"
      ? latestOrderWithName?.customerName ||
        email.split("@")[0].charAt(0).toUpperCase() +
          email.split("@")[0].slice(1)
      : rawName || "Cliente";

  const phone =
    dbUser?.phone ||
    orders.find((o) => o.customerPhone && o.customerPhone.trim().length > 0)
      ?.customerPhone ||
    "";
  const address =
    dbUser?.address ||
    orders.find((o) => o.customerAddress && o.customerAddress.trim().length > 0)
      ?.customerAddress ||
    "";

  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSpent = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalPieces = validOrders.reduce(
    (acc, o) =>
      acc + o.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      {/* Banner superior consistente con Catálogo y Contacto */}
      <div className="relative overflow-hidden border-b border-[#c9a15a]/25 bg-[#14100d] text-[#faf6f1]">
        <div className="relative mx-auto max-w-[1760px] px-4 py-12 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-[#c9a15a]/10 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                <Sparkles className="h-3 w-3" />
                Mi Perfil de Cliente
              </div>
              <h1 className="font-display mt-3 text-3xl sm:text-4xl md:text-5xl text-white">
                Mi Perfil e Historial de Compras
              </h1>
              <p className="mt-1.5 text-sm text-white/70">
                Información personal, muebles adquiridos y facturas asociadas a{" "}
                <span className="font-semibold text-[#c9a15a]">
                  {session.user.email}
                </span>
              </p>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl border border-[#c9a15a] bg-[#c9a15a] px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition hover:bg-[#d4b06e]"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Ir al Catálogo</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-8">
        {/* Tarjeta de Perfil y Edición de Datos */}
        <AccountSettingsCard
          initialName={displayName}
          email={session.user.email}
          initialPhone={phone}
          initialAddress={address}
        />

        {/* KPIs de Resumen de Compras del Cliente */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#e2d5c5] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Compras Realizadas
              </span>
              <Package className="h-4 w-4 text-[#b0894f]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[var(--wood-950)]">
              {orders.length}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">
                {orders.length === 1 ? "orden registrada" : "órdenes registradas"}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2d5c5] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Muebles Adquiridos
              </span>
              <Layers className="h-4 w-4 text-[#b0894f]" />
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-[var(--wood-950)]">
              {totalPieces}{" "}
              <span className="text-sm font-normal text-[var(--muted)]">
                {totalPieces === 1 ? "pieza artesanal" : "piezas artesanales"}
              </span>
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2d5c5] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                Total Comprado
              </span>
              <Receipt className="h-4 w-4 text-[#b0894f]" />
            </div>
            <p className="mt-2 font-mono text-2xl font-bold text-[#8a6a3a]">
              {formatCurrency(totalSpent)}
            </p>
          </div>
        </div>

        {/* Sección de Historial de lo que ha comprado */}
        <div id="historial" className="mb-4 flex items-center justify-between scroll-mt-28">
          <div>
            <h2 className="font-display text-2xl font-bold text-[var(--wood-950)]">
              Historial de lo que has comprado
            </h2>
            <p className="text-xs text-[var(--muted)]">
              Detalle de cada pedido, artículos comprados, estado de entrega y comprobantes.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-[#e2d5c5] bg-white p-12 text-center shadow-xs space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#e5d8c8] bg-[#faf6f1] text-[#b0894f]">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl text-[var(--wood-950)]">
              Aún no tienes compras registradas
            </h2>
            <p className="mx-auto max-w-md text-sm text-[var(--muted)]">
              Explora nuestro catálogo de muebles de madera recuperada o
              solicita una cotización a medida para tu hogar o negocio.
            </p>
            <div className="pt-2">
              <Link
                href="/catalogo"
                className="store-cta store-cta-primary rounded-xl"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const statusLabel =
                WEB_STATUS_LABEL[order.status] || order.status;
              const isPaid =
                order.status === "PAID" ||
                order.status === "DONE" ||
                order.invoice?.status === "PAID";
              const isCancelled = order.status === "CANCELLED";
              const isTransfer = Boolean(
                order.notes?.includes("Transferencia bancaria") ||
                  order.notes?.includes("[Pago: Transferencia bancaria]"),
              );
              const receipt = extractReceiptFromNotes(order.notes);
              const kindLabel = webOrderTypeLabel(order);

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-[#e2d5c5] bg-white p-6 shadow-xs transition hover:border-[#b0894f]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#efe6d8] pb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[var(--wood-950)]">
                          {order.number}
                        </span>
                        <span className="rounded-md bg-[#faf6f1] border border-[#e5d8c8] px-2 py-0.5 text-[11px] font-medium text-[var(--wood-800)]">
                          {kindLabel}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isPaid
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : isCancelled
                                ? "bg-rose-50 text-rose-800 border border-rose-200"
                                : "bg-amber-50 text-amber-900 border border-amber-200"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        {isTransfer && !isCancelled ? (
                          receipt ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Comprobante subido
                            </span>
                          ) : !isPaid ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                              Pendiente de comprobante
                            </span>
                          ) : null
                        ) : null}
                        <span className="text-xs text-[var(--muted)]">
                          · {formatDate(order.createdAt)}
                        </span>
                      </div>

                      {order.customerAddress ? (
                        <p className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <MapPin className="h-3.5 w-3.5 text-[#b0894f]" />
                          <span>Entrega: {order.customerAddress}</span>
                        </p>
                      ) : null}
                    </div>

                    {order.total > 0 ? (
                      <div className="text-right">
                        <p className="text-[11px] uppercase tracking-wider text-[var(--muted)]">
                          Total de la compra
                        </p>
                        <p className="font-mono text-lg font-bold text-[#8a6a3a]">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  {/* Tabla de artículos comprados en este pedido */}
                  {order.items.length > 0 ? (
                    <div className="mt-4 overflow-hidden rounded-xl border border-[#efe6d8] bg-[#faf7f2]/60">
                      <div className="grid grid-cols-12 border-b border-[#efe6d8] bg-[#f4ede2]/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--wood-800)]">
                        <div className="col-span-7 sm:col-span-6">
                          Mueble / Producto comprado
                        </div>
                        <div className="col-span-2 text-center">Cant.</div>
                        <div className="hidden sm:col-span-2 sm:block text-right">
                          Precio Unit.
                        </div>
                        <div className="col-span-3 sm:col-span-2 text-right">
                          Subtotal
                        </div>
                      </div>
                      <div className="divide-y divide-[#efe6d8]">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="grid grid-cols-12 items-center px-4 py-2.5 text-xs"
                          >
                            <div className="col-span-7 sm:col-span-6 font-medium text-[var(--wood-950)] pr-2">
                              {item.description}
                            </div>
                            <div className="col-span-2 text-center font-mono text-[var(--wood-800)]">
                              {item.quantity}
                            </div>
                            <div className="hidden sm:col-span-2 sm:block text-right font-mono text-[var(--muted)]">
                              {formatCurrency(item.unitPrice)}
                            </div>
                            <div className="col-span-3 sm:col-span-2 text-right font-mono font-semibold text-[var(--wood-950)]">
                              {formatCurrency(item.lineTotal)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {order.invoice ? (
                        isPaid ? (
                          <a
                            href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#faf7f2] px-3.5 py-2 text-xs font-semibold text-[var(--wood-900)] transition hover:border-[#b0894f] hover:bg-white"
                          >
                            <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                            <span>Factura PDF ({order.invoice.number})</span>
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-1.5 text-[11px] font-medium text-amber-900">
                            <span>Factura disponible al confirmar pago</span>
                          </span>
                        )
                      ) : null}

                      {order.quote ? (
                        <a
                          href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[#faf7f2] px-3.5 py-2 text-xs font-semibold text-[var(--wood-900)] transition hover:border-[#b0894f] hover:bg-white"
                        >
                          <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                          <span>Cotización PDF ({order.quote.number})</span>
                        </a>
                      ) : null}

                      {isTransfer && !receipt && !isPaid && !isCancelled ? (
                        <Link
                          href={`/pedido/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-amber-700"
                        >
                          <Upload className="h-3.5 w-3.5" />
                          <span>Subir comprobante bancario</span>
                        </Link>
                      ) : null}
                    </div>

                    <Link
                      href={`/pedido/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--wood-900)] bg-[var(--wood-900)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--wood-800)]"
                    >
                      <span>Ver detalles del pedido</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

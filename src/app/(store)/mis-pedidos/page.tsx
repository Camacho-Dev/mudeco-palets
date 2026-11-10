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
  CheckCircle2,
  Upload,
  MapPin,
  Clock,
} from "lucide-react";

export const metadata = {
  title: "Mi Cuenta · Mudeco Palets",
  description:
    "Consulta la información de tu perfil, tu historial de compras y tus facturas en Mudeco Palets.",
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

  const rawName = (dbUser?.name || session.user.name || "").trim();
  const displayName =
    rawName && rawName.toLowerCase() !== "administrador"
      ? rawName
      : email.split("@")[0].toLowerCase() === "admin"
        ? "Titular de Cuenta"
        : email.split("@")[0].charAt(0).toUpperCase() +
          email.split("@")[0].slice(1);

  const phone = dbUser?.phone || "";
  const address = dbUser?.address || "";

  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSpent = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalPieces = validOrders.reduce(
    (acc, o) =>
      acc + o.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    0,
  );

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      {/* Cabecera ejecutiva compacta */}
      <div className="border-b border-[#c9a15a]/20 bg-[#14100d] text-[#faf6f1]">
        <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#c9a15a]">
                Espacio de Cliente
              </p>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl text-white">
                Mi Perfil e Historial de Compras
              </h1>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-2 rounded-xl border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-4 py-2 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:bg-[#c9a15a] hover:text-[#0f0f0f]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>Explorar Catálogo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Layout profesional de 2 columnas */}
      <div className="mx-auto max-w-[1360px] px-4 py-8 sm:px-8 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Columna izquierda: Ficha del Perfil (Sticky) */}
          <div className="lg:col-span-4 lg:sticky lg:top-28">
            <AccountSettingsCard
              initialName={displayName}
              email={session.user.email}
              initialPhone={phone}
              initialAddress={address}
              ordersCount={orders.length}
              totalPieces={totalPieces}
              totalSpentFormatted={formatCurrency(totalSpent)}
            />
          </div>

          {/* Columna derecha: Historial de Compras */}
          <div id="historial" className="lg:col-span-8 scroll-mt-28">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-semibold text-[var(--wood-950)]">
                  Historial de Compras
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {orders.length === 0
                    ? "Tus compras y cotizaciones aparecerán aquí"
                    : `${orders.length} ${
                        orders.length === 1
                          ? "orden registrada en tu cuenta"
                          : "órdenes registradas en tu cuenta"
                      }`}
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="rounded-2xl border border-[#e5dacb] bg-white p-12 text-center shadow-xs space-y-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-[#e5d8c8] bg-[#faf6f1] text-[#b0894f]">
                  <Package className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-display text-xl text-[var(--wood-950)]">
                    Aún no registras compras
                  </h3>
                  <p className="mx-auto max-w-md text-xs text-[var(--muted)]">
                    Cuando adquieras un mueble del catálogo o solicites una
                    cotización a medida, podrás consultar su estado y descargar
                    tu factura desde aquí.
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#14100d] px-5 py-2.5 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:bg-[#241d17]"
                  >
                    <span>Ver Catálogo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
                    <article
                      key={order.id}
                      className="overflow-hidden rounded-2xl border border-[#e5dacb] bg-white shadow-xs transition hover:border-[#cdb89c]"
                    >
                      {/* Cabecera sobria de la orden */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f0e8dc] bg-[#faf7f2] px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[var(--wood-950)]">
                            {order.number}
                          </span>
                          <span className="text-xs text-[#cbbba4]">·</span>
                          <span className="text-xs text-[var(--muted)]">
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="text-xs text-[#cbbba4]">·</span>
                          <span className="text-xs font-medium text-[var(--wood-800)]">
                            {kindLabel}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                              isPaid
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                                : isCancelled
                                  ? "bg-rose-50 text-rose-800 border border-rose-200/80"
                                  : "bg-[#f5ebd9] text-[#7a5824] border border-[#e3cfa8]"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                isPaid
                                  ? "bg-emerald-600"
                                  : isCancelled
                                    ? "bg-rose-600"
                                    : "bg-[#b0894f]"
                              }`}
                            />
                            {statusLabel}
                          </span>

                          {order.total > 0 && (
                            <span className="font-mono text-sm font-bold text-[var(--wood-950)]">
                              {formatCurrency(order.total)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Cuerpo: Artículos comprados */}
                      <div className="px-5 py-4">
                        {order.items.length > 0 ? (
                          <div className="divide-y divide-[#f3ede3]">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#e8decb] bg-[#faf7f2] font-mono text-xs font-semibold text-[var(--wood-800)]">
                                    {item.quantity}x
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate text-xs sm:text-sm font-medium text-[var(--wood-950)]">
                                      {item.description}
                                    </p>
                                    {item.quantity > 1 && (
                                      <p className="font-mono text-[11px] text-[var(--muted)]">
                                        {formatCurrency(item.unitPrice)} c/u
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <span className="shrink-0 font-mono text-xs sm:text-sm font-semibold text-[var(--wood-900)]">
                                  {formatCurrency(item.lineTotal)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[var(--muted)]">
                            Solicitud de cotización personalizada
                          </p>
                        )}

                        {order.customerAddress && (
                          <div className="mt-3 flex items-center gap-1.5 border-t border-[#f3ede3] pt-2.5 text-xs text-[var(--muted)]">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#b0894f]" />
                            <span>Dirección de entrega: {order.customerAddress}</span>
                          </div>
                        )}
                      </div>

                      {/* Pie de acciones de la orden */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e8dc] bg-[#fcfaf7] px-5 py-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {isTransfer && !isCancelled ? (
                            receipt ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Comprobante bancario adjuntado</span>
                              </span>
                            ) : !isPaid ? (
                              <Link
                                href={`/pedido/${order.id}`}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6b782] bg-[#faf2e3] px-3 py-1.5 text-xs font-semibold text-[#7a561e] transition hover:bg-[#f3e5ca]"
                              >
                                <Upload className="h-3.5 w-3.5" />
                                <span>Adjuntar comprobante</span>
                              </Link>
                            ) : null
                          ) : null}

                          {order.invoice ? (
                            isPaid ? (
                              <a
                                href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfd2c0] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--wood-900)] transition hover:border-[#b0894f]"
                              >
                                <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                                <span>Factura PDF ({order.invoice.number})</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                                <Clock className="h-3.5 w-3.5 text-[#b0894f]" />
                                <span>Factura disponible al validar pago</span>
                              </span>
                            )
                          ) : null}

                          {order.quote && (
                            <a
                              href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[#dfd2c0] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--wood-900)] transition hover:border-[#b0894f]"
                            >
                              <FileDown className="h-3.5 w-3.5 text-[#b0894f]" />
                              <span>Cotización PDF ({order.quote.number})</span>
                            </a>
                          )}
                        </div>

                        <Link
                          href={`/pedido/${order.id}`}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-lg bg-[#14100d] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2a211b]"
                        >
                          <span>Ver pedido</span>
                          <ArrowRight className="h-3.5 w-3.5 text-[#c9a15a]" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

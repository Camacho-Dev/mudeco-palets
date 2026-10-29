import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/format";
import { WEB_STATUS_LABEL } from "@/lib/web-order-labels";
import {
  Package,
  FileDown,
  ArrowRight,
  ShoppingBag,
  Sparkles,
} from "lucide-react";

export const metadata = {
  title: "Mis Pedidos · Mudeco Palets",
  description: "Consulta el estado de tus pedidos, cotizaciones y facturas en Mudeco Palets.",
};

export default async function MisPedidosPage() {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/mis-pedidos");
  }

  const email = session.user.email.toLowerCase().trim();
  const orders = await prisma.webOrder.findMany({
    where: {
      customerEmail: { equals: email, mode: "insensitive" },
    },
    include: {
      items: true,
      invoice: true,
      quote: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#0c0c0c] text-white py-12 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
              <Sparkles className="h-3 w-3" />
              Cuenta de Cliente
            </div>
            <h1 className="font-display mt-3 text-3xl sm:text-4xl text-white">
              Mis Pedidos y Cotizaciones
            </h1>
            <p className="mt-1 text-sm text-white/60">
              Historial de órdenes asociadas a{" "}
              <span className="font-semibold text-[#c9a15a]">{session.user.email}</span>
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 border border-[#c9a15a] bg-[#c9a15a] px-5 py-2.5 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition hover:bg-[#d4b06e]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Ir al Catálogo</span>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-12 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 text-[#c9a15a]">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="font-display text-2xl text-white">
              Aún no tienes pedidos registrados
            </h2>
            <p className="mx-auto max-w-md text-sm text-white/60">
              Explora nuestro catálogo de muebles de madera recuperada o solicita una cotización a medida para tu hogar o negocio.
            </p>
            <div className="pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2 border border-[#c9a15a] bg-[#c9a15a] px-6 py-3 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition hover:bg-[#d4b06e]"
              >
                <span>Ver Catálogo</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusLabel = WEB_STATUS_LABEL[order.status] || order.status;
              const isPaid = order.status === "PAID" || order.status === "DONE";
              const isCancelled = order.status === "CANCELLED";

              return (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-[#141414] p-6 transition hover:border-[#c9a15a]/40"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#c9a15a]">
                          {order.number}
                        </span>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            isPaid
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : isCancelled
                                ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                          }`}
                        >
                          {statusLabel}
                        </span>
                        <span className="text-xs text-white/45">
                          · {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-white/60">
                        {order.items.length}{" "}
                        {order.items.length === 1 ? "pieza" : "piezas"} ·{" "}
                        {order.items.map((i) => i.description).join(", ")}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-[11px] uppercase tracking-wider text-white/50">
                        Total
                      </p>
                      <p className="font-mono text-lg font-bold text-white">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {order.invoice ? (
                        <a
                          href={`/api/facturas/${order.invoice.id}/pdf?orderId=${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition hover:border-[#c9a15a]/50 hover:text-[#c9a15a]"
                        >
                          <FileDown className="h-3.5 w-3.5 text-[#c9a15a]" />
                          <span>Factura PDF ({order.invoice.number})</span>
                        </a>
                      ) : null}

                      {order.quote ? (
                        <a
                          href={`/api/cotizaciones/${order.quote.id}/pdf?orderId=${order.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3.5 py-2 text-xs font-medium text-white transition hover:border-[#c9a15a]/50 hover:text-[#c9a15a]"
                        >
                          <FileDown className="h-3.5 w-3.5 text-[#c9a15a]" />
                          <span>Cotización PDF ({order.quote.number})</span>
                        </a>
                      ) : null}
                    </div>

                    <Link
                      href={`/pedido/${order.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#c9a15a]/50 bg-[#c9a15a]/10 px-4 py-2 text-xs font-semibold text-[#c9a15a] transition hover:bg-[#c9a15a] hover:text-[#0a0a0a]"
                    >
                      <span>Ver seguimiento y detalles</span>
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

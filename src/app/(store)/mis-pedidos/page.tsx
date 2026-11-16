import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { AccountSettingsCard } from "@/components/store/account-settings-card";
import {
  OrdersHistoryCard,
  SerializedWebOrder,
} from "@/components/store/orders-history-card";
import { ArrowRight } from "lucide-react";

export const metadata = {
  title: "Mi Perfil e Historial de Compras",
  description:
    "Espacio exclusivo de cliente para consultar compras, pedidos en taller, datos personales y comprobantes en Mudeco Palets.",
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

  const firstName = displayName.split(/\s+/)[0] || displayName;
  const phone = dbUser?.phone || "";
  const address = dbUser?.address || "";

  const validOrders = orders.filter((o) => o.status !== "CANCELLED");
  const totalSpent = validOrders.reduce((acc, o) => acc + (o.total || 0), 0);
  const totalPieces = validOrders.reduce(
    (acc, o) =>
      acc + o.items.reduce((sum, item) => sum + (item.quantity || 0), 0),
    0,
  );

  const serializedOrders: SerializedWebOrder[] = orders.map((o) => ({
    id: o.id,
    number: o.number,
    type: o.type,
    paymentMode: o.paymentMode,
    serviceKind: o.serviceKind,
    status: o.status,
    total: o.total,
    createdAt: o.createdAt.toISOString(),
    notes: o.notes,
    customerAddress: o.customerAddress,
    items: o.items.map((i) => ({
      id: i.id,
      description: i.description,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      lineTotal: i.lineTotal,
    })),
    invoice: o.invoice
      ? {
          id: o.invoice.id,
          number: o.invoice.number,
          status: o.invoice.status,
        }
      : null,
    quote: o.quote
      ? {
          id: o.quote.id,
          number: o.quote.number,
          status: o.quote.status,
        }
      : null,
  }));

  return (
    <div className="min-h-screen bg-brand-cream text-brand-brown-dark">
      {/* Encabezado */}
      <section className="border-b border-white/[0.06] bg-[#100d0b] text-brand-cream-warm">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-5 px-4 pt-10 pb-24 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pt-12 lg:px-10">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.24em] text-brand-gold uppercase">
              Mi cuenta
            </p>
            <h1 className="mt-2 font-display text-3xl text-white sm:text-4xl">
              Hola, {firstName}
            </h1>
            <p className="mt-1.5 text-sm text-white/60">
              Sigue tus pedidos, descarga tus facturas y mantén tus datos al día.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="group inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:border-brand-gold hover:bg-white/[0.04] sm:self-auto"
          >
            Seguir comprando
            <ArrowRight className="h-4 w-4 text-brand-gold transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* CUERPO PRINCIPAL: LAYOUT DE 2 COLUMNAS (FICHA DE CLIENTE + HISTORIAL) */}
      <main className="relative -mt-16 mx-auto max-w-[1240px] px-4 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Columna Izquierda: Ficha de Cliente (Sticky) */}
          <div className="min-w-0 lg:col-span-4 lg:sticky lg:top-28">
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

          {/* Columna Derecha: Historial de Compras con Filtro y Estado Vacío */}
          <div className="min-w-0 lg:col-span-8">
            <OrdersHistoryCard orders={serializedOrders} />
          </div>
        </div>
      </main>
    </div>
  );
}

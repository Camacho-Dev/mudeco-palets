import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { AccountSettingsCard } from "@/components/store/account-settings-card";
import {
  OrdersHistoryCard,
  SerializedWebOrder,
} from "@/components/store/orders-history-card";
import { WelcomeToast } from "@/components/store/welcome-toast";
import { ArrowRight, LayoutGrid } from "lucide-react";

export const metadata = {
  title: "Mi Perfil e Historial de Compras · Mudeco Palets",
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
    <div className="min-h-screen bg-[#fbf8f3] text-[#2c2219]">
      {/* CABECERA HERO: TALLER DE PALETS CON CINTAS DE ORO ONDULADAS */}
      <section className="relative overflow-hidden bg-[#100d0b] text-[#faf6f1]">
        {/* Imagen de fondo del taller de palets */}
        <div className="absolute inset-0">
          <Image
            src="/brand/store-workshop.jpg"
            alt="Taller de palets Mudeco"
            fill
            priority
            className="object-cover object-center opacity-40 brightness-75"
          />
          {/* Capas de gradientes para atmósfera de atelier de lujo */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a08]/95 via-[#14100e]/80 to-[#100d0b]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#100d0b] via-transparent to-black/60" />
          {/* Glow dorado ambiental */}
          <div className="pointer-events-none absolute -top-24 right-1/4 h-80 w-80 rounded-full bg-[#d4af37]/15 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1360px] px-4 pt-10 pb-20 sm:px-8 sm:pt-14 sm:pb-28 lg:px-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {/* Etiqueta con barra vertical ámbar */}
              <div className="flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-[#e5a93c]" />
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f5dfa8]">
                  Espacio de Cliente
                </p>
              </div>

              {/* Título de la página */}
              <h1 className="mt-2 font-display text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-tight text-white drop-shadow-sm">
                Mi Perfil e Historial de Compras
              </h1>
            </div>

            {/* Botón Píldora: Explorar Catálogo con borde dorado */}
            <div className="shrink-0">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2.5 rounded-full border border-[#d4af37]/70 bg-[#16120e]/80 px-6 py-3 text-xs font-bold tracking-wider text-[#f5dfa8] uppercase shadow-[0_8px_24px_rgba(0,0,0,0.4)] backdrop-blur-md transition-all duration-300 hover:border-[#fbe3a8] hover:bg-[#d4af37] hover:text-[#0f0d0a] hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer"
              >
                <LayoutGrid className="h-3.5 w-3.5 text-[#d4af37] transition-transform group-hover:rotate-45 group-hover:text-[#0f0d0a]" />
                <span>Explorar Catálogo</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#d4af37] transition-transform group-hover:translate-x-1 group-hover:text-[#0f0d0a]" />
              </Link>
            </div>
          </div>
        </div>

        {/* CINTAS ONDULADAS DORADAS Y CURVA DE TRANSICIÓN AL FONDO CREMA */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none overflow-hidden leading-none">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-16 sm:h-24 lg:h-28 object-cover"
            preserveAspectRatio="none"
          >
            <defs>
              {/* Gradiente dorado de la cinta de lujo */}
              <linearGradient
                id="heroGoldRibbon"
                x1="0%"
                y1="50%"
                x2="100%"
                y2="50%"
              >
                <stop offset="0%" stopColor="#fbe3a8" />
                <stop offset="35%" stopColor="#d4af37" />
                <stop offset="70%" stopColor="#caa466" />
                <stop offset="100%" stopColor="#8c6b24" />
              </linearGradient>

              {/* Sombra dorada suave */}
              <filter
                id="ribbonGlow"
                x="-10%"
                y="-20%"
                width="120%"
                height="140%"
              >
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="6"
                  floodColor="#d4af37"
                  floodOpacity="0.4"
                />
              </filter>
            </defs>

            {/* Cinta superior dorada fluida */}
            <path
              d="M 0 95 C 320 125, 480 35, 860 65 C 1120 85, 1320 20, 1440 35"
              stroke="url(#heroGoldRibbon)"
              strokeWidth="4"
              fill="none"
              filter="url(#ribbonGlow)"
            />

            {/* Cinta secundaria dorada suave */}
            <path
              d="M 0 102 C 340 130, 520 45, 900 75 C 1160 95, 1340 30, 1440 45"
              stroke="rgba(245, 223, 168, 0.45)"
              strokeWidth="1.5"
              fill="none"
            />

            {/* Ola inferior que transiciona limpiamente al fondo #fbf8f3 */}
            <path
              d="M 0 100 C 380 135, 720 55, 1080 80 C 1260 92, 1380 50, 1440 60 L 1440 120 L 0 120 Z"
              fill="#fbf8f3"
            />
          </svg>
        </div>
      </section>

      {/* CUERPO PRINCIPAL: LAYOUT DE 2 COLUMNAS (FICHA DE CLIENTE + HISTORIAL) */}
      <main className="relative -mt-4 sm:-mt-6 mx-auto max-w-[1360px] px-4 pb-20 sm:px-8 sm:pb-28 lg:px-10">
        <div className="grid items-start gap-8 lg:grid-cols-12">
          {/* Columna Izquierda: Ficha de Cliente (Sticky) */}
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

          {/* Columna Derecha: Historial de Compras con Filtro y Estado Vacío */}
          <div className="lg:col-span-8">
            <OrdersHistoryCard orders={serializedOrders} />
          </div>
        </div>
      </main>

      {/* TOAST DE BIENVENIDA FLOTANTE EN ESQUINA INFERIOR IZQUIERDA */}
      <WelcomeToast userName={displayName} />
    </div>
  );
}

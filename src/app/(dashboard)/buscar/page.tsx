import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";
import { DashboardSearch } from "@/components/dashboard-search";

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;
  const query = (q || "").trim();

  if (!query) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Búsqueda global"
          description="Encuentra clientes, productos, facturas, cotizaciones y pedidos web"
        />
        <DashboardSearch />
        <p className="text-sm text-[var(--muted)]">
          Ingresa un término arriba para buscar en todos los registros.
        </p>
      </div>
    );
  }

  const [customers, products, invoices, quotes, webOrders] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { taxId: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { ncf: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { customer: true },
      take: 20,
    }),
    prisma.quote.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { notes: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { customer: true },
      take: 20,
    }),
    prisma.webOrder.findMany({
      where: {
        OR: [
          { number: { contains: query, mode: "insensitive" } },
          { customerName: { contains: query, mode: "insensitive" } },
          { customerEmail: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-6">
      <DashboardSearch />
      <PageHeader title={`Resultados de búsqueda: “${query}”`} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Clientes */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-base text-[var(--wood-950)] border-b pb-2">
            Clientes ({customers.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {customers.length === 0 ? (
              <li className="text-[var(--muted)] text-xs">Sin coincidencias</li>
            ) : null}
            {customers.map((c) => (
              <li key={c.id} className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0">
                <Link href={`/clientes/${c.id}`} className="font-medium hover:underline text-[var(--wood-800)]">
                  {c.name}
                </Link>
                {c.taxId ? <span className="text-xs text-slate-500">RNC: {c.taxId}</span> : null}
              </li>
            ))}
          </ul>
        </div>

        {/* Productos / Muebles */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-base text-[var(--wood-950)] border-b pb-2">
            Muebles y catálogo ({products.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {products.length === 0 ? (
              <li className="text-[var(--muted)] text-xs">Sin coincidencias</li>
            ) : null}
            {products.map((p) => (
              <li key={p.id} className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0">
                <div>
                  <Link href={`/productos/${p.id}`} className="font-medium hover:underline text-[var(--wood-800)]">
                    {p.name}
                  </Link>
                  {p.sku ? <span className="ml-2 text-xs text-slate-400">SKU: {p.sku}</span> : null}
                </div>
                <span className="font-semibold text-xs text-slate-700">{formatCurrency(p.price)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Facturas */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-base text-[var(--wood-950)] border-b pb-2">
            Facturas ({invoices.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {invoices.length === 0 ? (
              <li className="text-[var(--muted)] text-xs">Sin coincidencias</li>
            ) : null}
            {invoices.map((inv) => (
              <li key={inv.id} className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0">
                <div>
                  <Link href={`/facturas/${inv.id}`} className="font-medium hover:underline text-[var(--wood-800)]">
                    {inv.number}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">· {inv.customer.name}</span>
                </div>
                <span className="font-semibold text-xs text-slate-700">{formatCurrency(inv.total)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cotizaciones y Pedidos Web */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-base text-[var(--wood-950)] border-b pb-2">
            Cotizaciones y Pedidos Web ({quotes.length + webOrders.length})
          </h2>
          <ul className="space-y-2 text-sm">
            {quotes.length === 0 && webOrders.length === 0 ? (
              <li className="text-[var(--muted)] text-xs">Sin coincidencias</li>
            ) : null}
            {quotes.map((q) => (
              <li key={q.id} className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0">
                <div>
                  <Link href={`/cotizaciones/${q.id}`} className="font-medium hover:underline text-[var(--wood-800)]">
                    {q.number}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">· {q.customer.name}</span>
                </div>
                <span className="text-xs text-slate-500">{formatCurrency(q.total)}</span>
              </li>
            ))}
            {webOrders.map((w) => (
              <li key={w.id} className="flex justify-between items-center border-b border-slate-100 pb-1.5 last:border-0">
                <div>
                  <Link href={`/pedidos-web/${w.id}`} className="font-medium hover:underline text-[#b0894f]">
                    {w.number}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">· {w.customerName}</span>
                </div>
                <span className="text-xs font-semibold text-emerald-800">{formatCurrency(w.total)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

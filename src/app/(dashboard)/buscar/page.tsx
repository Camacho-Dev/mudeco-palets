import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

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
      <div>
        <PageHeader title="Buscar" description="Clientes, productos y facturas" />
        <p className="text-sm text-[var(--muted)]">Escribe en el buscador del encabezado.</p>
      </div>
    );
  }

  const [customers, products, invoices] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { taxId: { contains: query } },
          { phone: { contains: query } },
        ],
      },
      take: 20,
    }),
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { sku: { contains: query } },
        ],
      },
      take: 20,
    }),
    prisma.invoice.findMany({
      where: {
        OR: [
          { number: { contains: query } },
          { ncf: { contains: query } },
        ],
      },
      include: { customer: true },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title={`Resultados: “${query}”`} />

      <section>
        <h2 className="mb-2 font-semibold">Clientes</h2>
        <ul className="space-y-1 text-sm">
          {customers.length === 0 ? <li className="text-[var(--muted)]">Sin resultados</li> : null}
          {customers.map((c) => (
            <li key={c.id}>
              <Link href={`/clientes/${c.id}`} className="underline">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Productos</h2>
        <ul className="space-y-1 text-sm">
          {products.length === 0 ? <li className="text-[var(--muted)]">Sin resultados</li> : null}
          {products.map((p) => (
            <li key={p.id}>
              <Link href={`/productos/${p.id}`} className="underline">
                {p.name}
              </Link>{" "}
              <span className="text-[var(--muted)]">{formatCurrency(p.price)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Facturas</h2>
        <ul className="space-y-1 text-sm">
          {invoices.length === 0 ? <li className="text-[var(--muted)]">Sin resultados</li> : null}
          {invoices.map((inv) => (
            <li key={inv.id}>
              <Link href={`/facturas/${inv.id}`} className="underline">
                {inv.number}
              </Link>{" "}
              · {inv.customer.name} · {formatCurrency(inv.total)}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

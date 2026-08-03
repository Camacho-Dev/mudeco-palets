import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { taxId: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { invoices: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Clientes"
        description={
          query
            ? `Resultados para “${query}”`
            : "RNC/cédula, contacto y dirección"
        }
        action={{ href: "/clientes/nuevo", label: "Nuevo cliente" }}
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por nombre, RNC, email, teléfono…"
          ariaLabel="Buscar clientes"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RNC / Cédula</th>
              <th>Contacto</th>
              <th>Facturas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron clientes para “${query}”`
                    : "No hay clientes"}
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.taxId || "—"}</td>
                  <td>
                    <div className="text-[var(--muted)]">
                      {c.email || "—"}
                      {c.phone ? (
                        <div className="text-xs">{c.phone}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>{c._count.invoices}</td>
                  <td className="text-right">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

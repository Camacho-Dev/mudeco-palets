import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession();
  const { q } = await searchParams;

  const customers = await prisma.customer.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { taxId: { contains: q } },
            { email: { contains: q } },
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
        description="RNC/cédula, contacto y dirección"
        action={{ href: "/clientes/nuevo", label: "Nuevo cliente" }}
      />

      <form className="mb-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, RNC o email…"
          className="input max-w-md"
        />
      </form>

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
                <td colSpan={5} className="text-center text-slate-500">
                  No hay clientes
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td className="font-medium">{c.name}</td>
                  <td>{c.taxId || "—"}</td>
                  <td>
                    <div className="text-slate-600">
                      {c.email || "—"}
                      {c.phone ? (
                        <div className="text-xs text-slate-400">{c.phone}</div>
                      ) : null}
                    </div>
                  </td>
                  <td>{c._count.invoices}</td>
                  <td className="text-right">
                    <Link
                      href={`/clientes/${c.id}`}
                      className="text-sm font-medium text-[#1a4d40] hover:underline"
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

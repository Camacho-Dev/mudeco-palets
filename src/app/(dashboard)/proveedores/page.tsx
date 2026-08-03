import { Suspense } from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ListSearchBar } from "@/components/invoice-search";

export default async function ProveedoresPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = (q || "").trim();

  const rows = await prisma.supplier.findMany({
    where: query
      ? {
          OR: [
            { id: { contains: query, mode: "insensitive" } },
            { name: { contains: query, mode: "insensitive" } },
            { taxId: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
            { address: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Proveedores"
        description={
          query
            ? `Resultados para “${query}”`
            : "Fuentes de compra e inventario"
        }
        action={
          <Link href="/proveedores/nuevo" className="btn btn-primary">
            Nuevo
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="mb-4 h-11 animate-pulse rounded-lg bg-white/60" />
        }
      >
        <ListSearchBar
          placeholder="Buscar por nombre, RNC, teléfono o email…"
          ariaLabel="Buscar proveedores"
        />
      </Suspense>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>RNC</th>
              <th>Teléfono</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-[var(--muted)]">
                  {query
                    ? `No se encontraron proveedores para “${query}”`
                    : "No hay proveedores"}
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link href={`/proveedores/${s.id}`} className="underline">
                      {s.name}
                    </Link>
                  </td>
                  <td>{s.taxId || "—"}</td>
                  <td>{s.phone || "—"}</td>
                  <td>{s.email || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

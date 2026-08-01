import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";

export default async function ProveedoresPage() {
  await requireAdmin();
  const rows = await prisma.supplier.findMany({ orderBy: { name: "asc" } });
  return (
    <div>
      <PageHeader
        title="Proveedores"
        description="Fuentes de compra e inventario"
        action={
          <Link href="/proveedores/nuevo" className="btn btn-primary">
            Nuevo
          </Link>
        }
      />
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
            {rows.map((s) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

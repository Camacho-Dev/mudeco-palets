import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency } from "@/lib/format";

export default async function ProductosPage() {
  await requireSession();
  const products = await prisma.product.findMany({
    where: { kind: "FINISHED" },
    orderBy: [{ active: "desc" }, { category: "asc" }, { name: "asc" }],
  });

  return (
    <div>
      <PageHeader
        title="Catálogo"
        description="Muebles de venta y fabricación propia"
        action={{ href: "/productos/nuevo", label: "Nuevo mueble" }}
      />

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>ITBIS</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={!p.active ? "opacity-50" : undefined}>
                <td>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-[var(--muted)]">
                    {p.sku || "Sin SKU"}
                    {p.description ? ` · ${p.description}` : ""}
                  </div>
                </td>
                <td>{p.category}</td>
                <td>{formatCurrency(p.price)}</td>
                <td>{p.stock}</td>
                <td>{(p.taxRate * 100).toFixed(0)}%</td>
                <td>{p.active ? "Activo" : "Inactivo"}</td>
                <td className="text-right">
                  <Link
                    href={`/productos/${p.id}`}
                    className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

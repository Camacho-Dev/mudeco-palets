import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InventarioPage() {
  await requireSession();
  const products = await prisma.product.findMany({
    where: { active: true, kind: "FINISHED" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  const moves = await prisma.stockMovement.findMany({
    where: { product: { kind: "FINISHED" } },
    orderBy: { createdAt: "desc" },
    take: 30,
    include: { product: true },
  });

  const low = products.filter((p) => p.stock <= p.minStock && p.sku !== "CUS-001");
  const inventoryValue = products.reduce((s, p) => s + p.stock * p.cost, 0);

  return (
    <div>
      <PageHeader
        title="Inventario"
        description="Stock de muebles terminados listos para venta"
        action={
          <div className="flex flex-wrap gap-2">
            <Link href="/materiales" className="btn btn-secondary">
              Ver materiales
            </Link>
            <Link href="/productos/nuevo" className="btn btn-primary">
              Nuevo mueble
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Ítems activos
          </p>
          <p className="font-display mt-1 text-3xl">{products.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Bajo mínimo
          </p>
          <p className="font-display mt-1 text-3xl text-amber-800">{low.length}</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-semibold tracking-wide text-[var(--muted)] uppercase">
            Valor al costo
          </p>
          <p className="font-display mt-1 text-2xl">
            {formatCurrency(inventoryValue)}
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Mueble</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Costo</th>
              <th>Precio</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const alert = p.stock <= p.minStock && p.sku !== "CUS-001";
              return (
                <tr key={p.id}>
                  <td className="font-mono text-xs">{p.sku || "—"}</td>
                  <td className="font-medium">{p.name}</td>
                  <td>{p.category}</td>
                  <td className={alert ? "font-semibold text-amber-800" : ""}>
                    {p.stock}
                  </td>
                  <td>{p.minStock}</td>
                  <td>{formatCurrency(p.cost)}</td>
                  <td>{formatCurrency(p.price)}</td>
                  <td className="text-right">
                    <Link
                      href={`/productos/${p.id}`}
                      className="text-sm font-medium text-[var(--wood-800)] hover:underline"
                    >
                      Ajustar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 mb-3 font-display text-xl">Kardex reciente</h2>
      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Motivo</th>
              <th>Cant</th>
              <th>Saldo</th>
            </tr>
          </thead>
          <tbody>
            {moves.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-[var(--muted)]">
                  Sin movimientos aún
                </td>
              </tr>
            ) : (
              moves.map((m) => (
                <tr key={m.id}>
                  <td className="text-xs">{formatDate(m.createdAt)}</td>
                  <td>{m.product.name}</td>
                  <td>{m.reason}</td>
                  <td className={m.qty < 0 ? "text-rose-700" : "text-emerald-700"}>
                    {m.qty > 0 ? `+${m.qty}` : m.qty}
                  </td>
                  <td>{m.balance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

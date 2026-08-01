import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createPurchase } from "../actions";

export default async function NuevaCompraPage() {
  await requireAdmin();
  const [suppliers, products] = await Promise.all([
    prisma.supplier.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { active: true, NOT: { sku: "CUS-001" } },
      orderBy: [{ kind: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div>
      <PageHeader title="Nueva compra" />
      <form action={createPurchase} className="card space-y-4 p-6">
        <div>
          <label className="label">Proveedor</label>
          <select name="supplierId" className="input" required>
            <option value="">Seleccionar…</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea name="notes" className="input" rows={2} />
        </div>
        <div className="space-y-2">
          <p className="label">Ítems</p>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-2 md:grid-cols-3">
              <select name="productId" className="input" defaultValue="">
                <option value="">Producto / material…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.kind === "MATERIAL" ? "[Mat] " : "[Mueble] "}
                    {p.name}
                  </option>
                ))}
              </select>
              <input name="quantity" type="number" step="0.01" placeholder="Cant" className="input" />
              <input name="unitCost" type="number" step="0.01" placeholder="Costo unit." className="input" />
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary">
          Crear orden
        </button>
      </form>
    </div>
  );
}

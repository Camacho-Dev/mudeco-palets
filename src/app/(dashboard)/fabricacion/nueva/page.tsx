import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { createWorkOrder } from "../actions";

export default async function NuevaFabricacionPage() {
  await requireAdmin();
  const [finished, materials] = await Promise.all([
    prisma.product.findMany({
      where: { active: true, kind: "FINISHED", NOT: { sku: "CUS-001" } },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { active: true, kind: "MATERIAL" },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Nueva orden de fabricación"
        description="Consume materiales del almacén y suma muebles terminados"
      />
      <form action={createWorkOrder} className="card space-y-4 p-6">
        <div>
          <label className="label">Mueble terminado</label>
          <select name="productId" className="input" required>
            <option value="">Seleccionar…</option>
            {finished.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stock {p.stock})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Cantidad a fabricar</label>
          <input
            name="quantity"
            type="number"
            step="0.01"
            defaultValue={1}
            className="input"
            required
          />
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea name="notes" className="input" rows={2} />
        </div>
        <div className="space-y-2">
          <p className="label">Materiales del almacén (por cada unidad)</p>
          {materials.length === 0 ? (
            <p className="text-sm text-amber-800">
              No hay materiales. Créalos en Almacén de materiales primero.
            </p>
          ) : null}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="grid gap-2 md:grid-cols-2">
              <select name="materialId" className="input" defaultValue="">
                <option value="">Material…</option>
                {materials.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.category}] {p.name} — {p.stock} {p.unit}
                  </option>
                ))}
              </select>
              <input
                name="materialQty"
                type="number"
                step="0.01"
                placeholder="Cant por und"
                className="input"
              />
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

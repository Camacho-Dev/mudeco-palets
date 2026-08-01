import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { updateMaterial, deactivateMaterial } from "../actions";
import { ConfirmForm } from "@/components/confirm-form";

const CATEGORIES = [
  "Madera",
  "Herrajes",
  "Pintura / barniz",
  "Espuma / tela",
  "Tornillería",
  "Pegamento",
  "Otros",
];

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const m = await prisma.product.findUnique({ where: { id } });
  if (!m || m.kind !== "MATERIAL") notFound();

  return (
    <div>
      <PageHeader title={m.name} description="Editar material del almacén" />
      <form action={updateMaterial.bind(null, id)} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label">Nombre</label>
          <input name="name" className="input" required defaultValue={m.name} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">SKU</label>
            <input name="sku" className="input" defaultValue={m.sku || ""} />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select name="category" className="input" defaultValue={m.category}>
              {[m.category, ...CATEGORIES.filter((c) => c !== m.category)].map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea
            name="description"
            className="input"
            rows={2}
            defaultValue={m.description || ""}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Unidad</label>
            <input name="unit" className="input" defaultValue={m.unit} />
          </div>
          <div>
            <label className="label">Costo unitario</label>
            <input
              name="cost"
              type="number"
              step="0.01"
              defaultValue={m.cost}
              className="input"
            />
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              name="stock"
              type="number"
              step="0.01"
              defaultValue={m.stock}
              className="input"
            />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input
              name="minStock"
              type="number"
              step="0.01"
              defaultValue={m.minStock}
              className="input"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
        </div>
      </form>
      <div className="mt-4">
        <ConfirmForm
          action={deactivateMaterial.bind(null, id)}
          message="¿Desactivar este material del almacén?"
        >
          <button type="submit" className="btn btn-danger">
            Desactivar
          </button>
        </ConfirmForm>
      </div>
    </div>
  );
}

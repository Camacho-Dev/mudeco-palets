import { PageHeader } from "@/components/page-header";
import { requireAdmin } from "@/lib/session";
import { createMaterial } from "../actions";

const CATEGORIES = [
  "Madera",
  "Herrajes",
  "Pintura / barniz",
  "Espuma / tela",
  "Tornillería",
  "Pegamento",
  "Otros",
];

export default async function NuevoMaterialPage() {
  await requireAdmin();
  return (
    <div>
      <PageHeader
        title="Nuevo material"
        description="Insumo del almacén para fabricación"
      />
      <form action={createMaterial} className="card max-w-xl space-y-4 p-6">
        <div>
          <label className="label">Nombre</label>
          <input name="name" className="input" required placeholder="Ej. Tabla pino 1x6" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">SKU</label>
            <input name="sku" className="input" placeholder="MAD-001" />
          </div>
          <div>
            <label className="label">Categoría</label>
            <select name="category" className="input" defaultValue="Madera">
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea name="description" className="input" rows={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Unidad</label>
            <select name="unit" className="input" defaultValue="UND">
              <option value="UND">Unidad</option>
              <option value="PIE">Pie</option>
              <option value="MT">Metro</option>
              <option value="M2">m²</option>
              <option value="KG">Kg</option>
              <option value="LT">Litro</option>
              <option value="CAJA">Caja</option>
            </select>
          </div>
          <div>
            <label className="label">Costo unitario</label>
            <input name="cost" type="number" step="0.01" defaultValue={0} className="input" />
          </div>
          <div>
            <label className="label">Stock inicial</label>
            <input name="stock" type="number" step="0.01" defaultValue={0} className="input" />
          </div>
          <div>
            <label className="label">Stock mínimo</label>
            <input name="minStock" type="number" step="0.01" defaultValue={5} className="input" />
          </div>
        </div>
        <button type="submit" className="btn btn-primary">
          Guardar en almacén
        </button>
      </form>
    </div>
  );
}

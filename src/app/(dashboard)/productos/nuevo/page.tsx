import Link from "next/link";
import { createProduct } from "../actions";
import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/session";

export default async function NuevoProductoPage() {
  await requireSession();

  return (
    <div>
      <PageHeader title="Nuevo mueble" description="Producto de catálogo o a medida" />
      <form action={createProduct} className="card max-w-2xl space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input id="name" name="name" required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="sku">
              SKU
            </label>
            <input id="sku" name="sku" className="input" placeholder="SOF-001" />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Categoría
            </label>
            <input
              id="category"
              name="category"
              defaultValue="Sala"
              className="input"
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={2}
            className="input"
            placeholder="Fabricación propia…"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="price">
              Precio venta
            </label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              required
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="cost">
              Costo
            </label>
            <input
              id="cost"
              name="cost"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="taxRate">
              ITBIS
            </label>
            <input
              id="taxRate"
              name="taxRate"
              type="number"
              step="0.01"
              min="0"
              max="1"
              defaultValue="0.18"
              required
              className="input"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="stock">
              Stock inicial
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              defaultValue="0"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="minStock">
              Stock mínimo
            </label>
            <input
              id="minStock"
              name="minStock"
              type="number"
              step="1"
              defaultValue="2"
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="unit">
              Unidad
            </label>
            <input id="unit" name="unit" defaultValue="UND" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="imageUrl">
            URL de imagen (foto real del mueble)
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            className="input"
            placeholder="https://…"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">
            Pega el link de una foto real. Sin ella se usa imagen de categoría.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="widthCm">
              Ancho cm
            </label>
            <input id="widthCm" name="widthCm" type="number" step="0.1" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="heightCm">
              Alto cm
            </label>
            <input id="heightCm" name="heightCm" type="number" step="0.1" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="depthCm">
              Fondo cm
            </label>
            <input id="depthCm" name="depthCm" type="number" step="0.1" className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input type="checkbox" name="active" defaultChecked />
          Activo en catálogo
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
          <Link href="/productos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

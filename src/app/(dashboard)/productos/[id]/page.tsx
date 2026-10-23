import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { PageHeader } from "@/components/page-header";
import { ProductImageInput } from "@/components/product-image-input";
import { ExternalLink } from "lucide-react";
import { deleteProduct, updateProduct } from "../actions";

export default async function EditarProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireSession();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const update = updateProduct.bind(null, id);
  const remove = deleteProduct.bind(null, id);

  return (
    <div>
      <PageHeader
        title="Editar mueble"
        description={product.name}
        action={
          <div className="flex items-center gap-2">
            {product.active ? (
              <a
                href={`/producto/${product.id}`}
                target="_blank"
                rel="noreferrer"
                className="btn btn-secondary inline-flex items-center gap-1.5 text-xs text-[var(--wood-800)] hover:border-[#b0894f]"
                title="Ver producto en la tienda online"
              >
                <span>Ver en la tienda web</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60" />
              </a>
            ) : null}
            <Link href="/productos" className="btn btn-ghost text-xs">
              ← Catálogo
            </Link>
          </div>
        }
      />
      <form action={update} className="card max-w-2xl space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label" htmlFor="name">
              Nombre
            </label>
            <input
              id="name"
              name="name"
              required
              defaultValue={product.name}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="sku">
              SKU
            </label>
            <input
              id="sku"
              name="sku"
              defaultValue={product.sku || ""}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="category">
              Categoría
            </label>
            <input
              id="category"
              name="category"
              defaultValue={product.category}
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
            defaultValue={product.description || ""}
            className="input"
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
              defaultValue={product.price}
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
              defaultValue={product.cost}
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
              required
              defaultValue={product.taxRate}
              className="input"
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="stock">
              Stock
            </label>
            <input
              id="stock"
              name="stock"
              type="number"
              step="1"
              defaultValue={product.stock}
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
              defaultValue={product.minStock}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="unit">
              Unidad
            </label>
            <input
              id="unit"
              name="unit"
              defaultValue={product.unit}
              className="input"
            />
          </div>
        </div>
        <ProductImageInput
          defaultValue={product.imageUrl}
          category={product.category}
        />
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="label" htmlFor="widthCm">
              Ancho cm
            </label>
            <input
              id="widthCm"
              name="widthCm"
              type="number"
              step="0.1"
              defaultValue={product.widthCm ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="heightCm">
              Alto cm
            </label>
            <input
              id="heightCm"
              name="heightCm"
              type="number"
              step="0.1"
              defaultValue={product.heightCm ?? ""}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="depthCm">
              Fondo cm
            </label>
            <input
              id="depthCm"
              name="depthCm"
              type="number"
              step="0.1"
              defaultValue={product.depthCm ?? ""}
              className="input"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product.active}
          />
          Activo en catálogo
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn btn-primary">
            Guardar cambios
          </button>
          <Link href="/productos" className="btn btn-secondary">
            Cancelar
          </Link>
        </div>
      </form>
      {product.active ? (
        <form action={remove} className="mt-6 max-w-2xl">
          <button type="submit" className="btn btn-danger">
            Desactivar
          </button>
        </form>
      ) : null}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany, productImage, whatsappLink } from "@/lib/store";
import { AddToCartButton } from "@/components/store/add-to-cart-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, active: true, kind: "FINISHED" },
    select: { name: true, description: true },
  });
  return {
    title: product?.name || "Producto",
    description: product?.description || undefined,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, company] = await Promise.all([
    prisma.product.findFirst({
      where: { id, active: true, kind: "FINISHED" },
    }),
    getStoreCompany(),
  ]);

  if (!product) notFound();

  const src = productImage(product);
  const dims = [product.widthCm, product.heightCm, product.depthCm]
    .filter((n) => n != null && n > 0)
    .join(" × ");

  const wa = whatsappLink(
    company.phone,
    `Hola, me interesa el mueble "${product.name}" (${formatCurrency(product.price)}). ¿Está disponible?`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/catalogo"
        className="text-[0.75rem] tracking-[0.12em] text-[var(--muted)] uppercase transition hover:text-[var(--wood-950)]"
      >
        ← Catálogo
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="aspect-[4/5] overflow-hidden bg-[#ebe2d6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={product.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>
        </Reveal>

        <Reveal delay={0.12} className="flex flex-col justify-center">
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
            {product.category}
          </p>
          <h1 className="font-display mt-3 text-4xl leading-tight text-[var(--wood-950)] md:text-5xl">
            {product.name}
          </h1>
          {product.sku ? (
            <p className="mt-2 text-sm text-[var(--muted)]">SKU {product.sku}</p>
          ) : null}
          <p className="mt-6 text-2xl font-semibold tracking-wide text-[var(--wood-800)]">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {product.stock > 0
              ? `Disponible · ${product.stock} en taller`
              : "Disponible bajo pedido"}
          </p>

          {product.description ? (
            <p className="mt-8 max-w-md leading-relaxed text-[var(--wood-800)]">
              {product.description}
            </p>
          ) : (
            <p className="mt-8 max-w-md leading-relaxed text-[var(--muted)]">
              Pieza elaborada con madera recuperada. Acabado artesanal y
              carácter único en cada detalle.
            </p>
          )}

          {dims ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Medidas: {dims} cm
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center border border-[var(--border)] bg-white px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] text-[var(--wood-950)] uppercase transition hover:border-[var(--wood-700)]">
              WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center border border-[var(--border)] bg-white px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] text-[var(--wood-950)] uppercase transition hover:border-[var(--wood-700)]"
            >
              Contacto
            </Link>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

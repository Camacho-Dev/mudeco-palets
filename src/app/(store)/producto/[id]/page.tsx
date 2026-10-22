import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany, productImage } from "@/lib/store";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";
import { STORE_LOGISTICS, siteUrl, storeWhatsApp } from "@/lib/store-info";
import { getRelatedRecommendations } from "@/lib/recommendations";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id, active: true, kind: "FINISHED" },
    select: { name: true, description: true, imageUrl: true, category: true },
  });
  if (!product) return { title: "Producto" };
  const img = productImage(product);
  const url = `${siteUrl()}/producto/${id}`;
  return {
    title: product.name,
    description:
      product.description ||
      `${product.name} · madera recuperada · Mudeco Palets`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      url,
      images: [{ url: img, alt: product.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      images: [img],
    },
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
  const realPhoto = Boolean(product.imageUrl);
  const dims = [product.widthCm, product.heightCm, product.depthCm]
    .filter((n) => n != null && n > 0)
    .join(" × ");

  const related = await getRelatedRecommendations(product.id, 4);

  const wa = storeWhatsApp(
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
          <div className="relative aspect-[4/5] overflow-hidden bg-[#ebe2d6]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={product.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            {!realPhoto ? (
              <p className="absolute bottom-3 left-3 rounded-sm bg-[#2f2018]/75 px-2.5 py-1 text-[0.65rem] tracking-wide text-white/85 uppercase">
                Imagen de referencia
              </p>
            ) : null}
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
              : "Disponible bajo pedido · te confirmamos plazo"}
          </p>

          {product.description ? (
            <p className="mt-8 max-w-md leading-relaxed text-[var(--wood-800)]">
              {product.description}
            </p>
          ) : (
            <p className="mt-8 max-w-md leading-relaxed text-[var(--muted)]">
              Pieza elaborada con madera recuperada. Acabado artesanal y carácter
              único en cada detalle.
            </p>
          )}

          {dims ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Medidas: {dims} cm
            </p>
          ) : null}

          <div className="mt-10 flex flex-wrap gap-3">
            <AddToCartButton product={product} />
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center border border-[var(--border)] bg-white px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] text-[var(--wood-950)] uppercase transition hover:border-[var(--wood-700)]"
            >
              WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center border border-[var(--border)] bg-white px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] text-[var(--wood-950)] uppercase transition hover:border-[var(--wood-700)]"
            >
              Contacto
            </Link>
          </div>

          <dl className="mt-10 space-y-4 border-t border-[var(--border)] pt-8 text-sm">
            <div>
              <dt className="font-semibold tracking-wide text-[var(--wood-950)] uppercase text-[0.7rem]">
                Materiales
              </dt>
              <dd className="mt-1 text-[var(--muted)]">
                {STORE_LOGISTICS.materials}
              </dd>
            </div>
            <div>
              <dt className="font-semibold tracking-wide text-[var(--wood-950)] uppercase text-[0.7rem]">
                Entrega y retiro
              </dt>
              <dd className="mt-1 text-[var(--muted)]">
                {STORE_LOGISTICS.pickup} {STORE_LOGISTICS.delivery}
              </dd>
            </div>
            <div>
              <dt className="font-semibold tracking-wide text-[var(--wood-950)] uppercase text-[0.7rem]">
                Plazos
              </dt>
              <dd className="mt-1 text-[var(--muted)]">
                {STORE_LOGISTICS.leadTime}
              </dd>
            </div>
            <div>
              <dt className="font-semibold tracking-wide text-[var(--wood-950)] uppercase text-[0.7rem]">
                Cuidado
              </dt>
              <dd className="mt-1 text-[var(--muted)]">{STORE_LOGISTICS.care}</dd>
            </div>
          </dl>
        </Reveal>
      </div>

      {related.length > 0 ? (
        <section className="mt-20 border-t border-[var(--border)] pt-14">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
              También te puede gustar
            </p>
            <h2 className="font-display mt-2 text-3xl text-[var(--wood-950)]">
              Piezas relacionadas
            </h2>
          </Reveal>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p, i) => (
              <Reveal key={p.id} delay={Math.min(i * 0.05, 0.2)}>
                <ProductCard product={p} badge={p.badge} />
              </Reveal>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

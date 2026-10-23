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
  const [product, company, related] = await Promise.all([
    prisma.product.findFirst({
      where: { id, active: true, kind: "FINISHED" },
    }),
    getStoreCompany(),
    getRelatedRecommendations(id, 4),
  ]);

  if (!product) notFound();

  const src = productImage(product);
  const realPhoto = Boolean(product.imageUrl);
  const dims = [product.widthCm, product.heightCm, product.depthCm]
    .filter((n) => n != null && n > 0)
    .join(" × ");

  const wa = storeWhatsApp(
    company.phone,
    `Hola, me interesa el mueble "${product.name}" (${formatCurrency(product.price)}). ¿Está disponible?`,
  );

  return (
    <div className="mx-auto max-w-[1560px] px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
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
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-bold tracking-[0.2em] text-[#b0894f] uppercase">
              {product.category}
            </span>
            {product.sku ? (
              <span className="text-[0.65rem] text-[var(--muted)]">· SKU {product.sku}</span>
            ) : null}
          </div>

          <h1 className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl leading-tight text-[var(--wood-950)]">
            {product.name}
          </h1>

          <div className="mt-4 flex items-baseline gap-4">
            <span className="text-3xl font-bold tracking-tight text-[#8a6a3a]">
              {formatCurrency(product.price)}
            </span>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="relative flex h-2 w-2">
                <span
                  className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                    product.stock > 0 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span
                  className={`relative inline-flex h-2 w-2 rounded-full ${
                    product.stock > 0 ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span className="font-medium text-[var(--muted)]">
                {product.stock > 0
                  ? `Disponible · ${product.stock} en taller`
                  : "Fabricación a medida bajo pedido"}
              </span>
            </div>
          </div>

          {product.description ? (
            <p className="mt-6 text-sm leading-relaxed text-[var(--wood-800)]">
              {product.description}
            </p>
          ) : (
            <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
              Pieza elaborada artesanalmente con listones de madera de pino recuperada. Acabado cepillado fino y carácter único en cada veta.
            </p>
          )}

          {dims ? (
            <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[#faf6f1] px-3.5 py-2 text-xs font-medium text-[var(--wood-900)]">
              <span className="text-[#8a6a3a] font-bold">Dimensiones:</span>
              <span>{dims} cm</span>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} />
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-[4px] border border-emerald-600/40 bg-emerald-50/60 px-5 py-3 text-[0.72rem] font-bold tracking-[0.12em] text-emerald-800 uppercase transition hover:bg-emerald-100 hover:border-emerald-600"
            >
              WhatsApp
            </a>
            <Link
              href="/contacto"
              className="inline-flex items-center rounded-[4px] border border-[var(--border)] bg-white px-5 py-3 text-[0.72rem] font-semibold tracking-[0.12em] text-[var(--wood-950)] uppercase transition hover:bg-[#faf6f1] hover:border-[var(--wood-700)]"
            >
              Contacto
            </Link>
          </div>

          {/* Micro trust strip */}
          <div className="mt-8 grid grid-cols-2 gap-2 border-y border-[var(--border)] py-4">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
              <span>Madera 100% curada y tratada</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
              <span>Ensamble reforzado de por vida</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
              <span>Acabado antimanchas satinado</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#b0894f]" />
              <span>Envíos a todo el país</span>
            </div>
          </div>

          <dl className="mt-6 space-y-3.5 text-sm">
            <div>
              <dt className="font-bold tracking-wider text-[var(--wood-950)] uppercase text-[0.68rem]">
                Materiales
              </dt>
              <dd className="mt-1 text-xs text-[var(--muted)]">
                {STORE_LOGISTICS.materials}
              </dd>
            </div>
            <div>
              <dt className="font-bold tracking-wider text-[var(--wood-950)] uppercase text-[0.68rem]">
                Entrega y retiro
              </dt>
              <dd className="mt-1 text-xs text-[var(--muted)]">
                {STORE_LOGISTICS.pickup} {STORE_LOGISTICS.delivery}
              </dd>
            </div>
            <div>
              <dt className="font-bold tracking-wider text-[var(--wood-950)] uppercase text-[0.68rem]">
                Plazos de taller
              </dt>
              <dd className="mt-1 text-xs text-[var(--muted)]">
                {STORE_LOGISTICS.leadTime}
              </dd>
            </div>
            <div>
              <dt className="font-bold tracking-wider text-[var(--wood-950)] uppercase text-[0.68rem]">
                Cuidado de la madera
              </dt>
              <dd className="mt-1 text-xs text-[var(--muted)]">{STORE_LOGISTICS.care}</dd>
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

import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany, productImage } from "@/lib/store";
import { formatStoreCategory } from "@/lib/store-brand";
import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { ProductCard } from "@/components/store/product-card";
import { STORE_LOGISTICS, siteUrl, storeWhatsApp } from "@/lib/store-info";
import { getRelatedRecommendations, getScoredProducts } from "@/lib/recommendations";
import { MessageCircle, Hammer, Truck, Clock, Sparkles, Ruler } from "lucide-react";

export const revalidate = 30;

const getProduct = cache(async (id: string) => {
  const cachedList = await getScoredProducts().catch(() => []);
  const fromCache = cachedList.find((p) => p.id === id);
  if (fromCache) return fromCache;

  return prisma.product.findFirst({
    where: { id, active: true, kind: "FINISHED" },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
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
    getProduct(id),
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `${product.name} fabricado artesanalmente en madera recuperada por ${company.name}.`,
    sku: product.sku,
    category: formatStoreCategory(product.category),
    image: src.startsWith("http") ? src : `${siteUrl()}${src}`,
    brand: {
      "@type": "Brand",
      name: company.name,
    },
    offers: {
      "@type": "Offer",
      url: `${siteUrl()}/producto/${product.id}`,
      priceCurrency: "DOP",
      price: product.price.toFixed(2),
      availability:
        product.stock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/PreOrder",
      seller: {
        "@type": "Organization",
        name: company.name,
      },
    },
  };

  return (
    <div className="bg-[#faf7f2]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Franja superior editorial con migas de pan */}
      <div className="border-b border-[#c9a15a]/25 bg-[#14100d] text-white">
        <div className="mx-auto flex max-w-[1560px] flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center gap-2 text-[0.72rem] font-medium tracking-[0.14em] text-white/65 uppercase">
            <Link href="/catalogo" className="transition hover:text-white">
              ← Catálogo
            </Link>
            <span className="text-white/30">/</span>
            <Link
              href={`/catalogo?cat=${encodeURIComponent(product.category)}`}
              className="text-[#c9a15a] transition hover:underline"
            >
              {formatStoreCategory(product.category)}
            </Link>
            <span className="hidden text-white/30 sm:inline">/</span>
            <span className="hidden truncate max-w-[260px] text-white/85 sm:inline">
              {product.name}
            </span>
          </div>
          {product.sku ? (
            <span className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-white/70">
              SKU · {product.sku}
            </span>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1560px] px-4 py-10 sm:px-8 lg:px-12 xl:px-16">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal>
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-[#e2d5c5] bg-[#ebe2d6] shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={product.name}
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
            {!realPhoto ? (
              <p className="absolute bottom-3 left-3 rounded-lg bg-[#2f2018]/80 px-3 py-1 text-[0.65rem] font-medium tracking-wide text-white/90 uppercase backdrop-blur-xs">
                Imagen de referencia
              </p>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.12} className="flex flex-col justify-center">
          <div className="flex items-center gap-2">
            <Link
              href={`/catalogo?cat=${encodeURIComponent(product.category)}`}
              className="text-[0.68rem] font-bold tracking-[0.2em] text-[#b0894f] uppercase hover:underline"
            >
              {formatStoreCategory(product.category)}
            </Link>
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
              <span
                className={`inline-flex h-2 w-2 rounded-full ${
                  product.stock > 0 ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
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
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#e2d5c5] bg-white px-3.5 py-2 text-xs font-medium text-[var(--wood-900)] shadow-2xs">
              <Ruler className="h-3.5 w-3.5 text-[#b0894f]" />
              <span className="text-[#8a6a3a] font-bold">Dimensiones:</span>
              <span>{dims} cm</span>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <AddToCartButton product={product} showQuantity={true} />
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-600/40 bg-emerald-50/80 px-5 py-3.5 text-[0.72rem] font-bold tracking-[0.12em] text-emerald-800 uppercase transition hover:bg-emerald-100 hover:border-emerald-600 shadow-xs active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Consultar por WhatsApp</span>
            </a>
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

          {/* Especificaciones en cuadrícula 2x2 */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e5d8c8] bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[0.68rem] font-bold tracking-wider text-[var(--wood-950)] uppercase">
                <Hammer className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Materiales</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {STORE_LOGISTICS.materials}
              </p>
            </div>

            <div className="rounded-xl border border-[#e5d8c8] bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[0.68rem] font-bold tracking-wider text-[var(--wood-950)] uppercase">
                <Truck className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Entrega y retiro</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {STORE_LOGISTICS.pickup} {STORE_LOGISTICS.delivery}
              </p>
            </div>

            <div className="rounded-xl border border-[#e5d8c8] bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[0.68rem] font-bold tracking-wider text-[var(--wood-950)] uppercase">
                <Clock className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Plazos de taller</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {STORE_LOGISTICS.leadTime}
              </p>
            </div>

            <div className="rounded-xl border border-[#e5d8c8] bg-white p-4 shadow-2xs">
              <div className="flex items-center gap-2 text-[0.68rem] font-bold tracking-wider text-[var(--wood-950)] uppercase">
                <Sparkles className="h-3.5 w-3.5 text-[#b0894f]" />
                <span>Cuidado de la madera</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
                {STORE_LOGISTICS.care}
              </p>
            </div>
          </div>
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
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { FadeIn } from "@/components/motion";
import { getStoreCompany, whatsappLink } from "@/lib/store";

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

  const dims = [product.widthCm, product.heightCm, product.depthCm]
    .filter((n) => n != null && n > 0)
    .join(" × ");

  const wa = whatsappLink(
    company.phone,
    `Hola, me interesa el mueble "${product.name}" (${formatCurrency(product.price)}). ¿Está disponible?`,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <Link
        href="/catalogo"
        className="text-sm text-[var(--muted)] underline-offset-2 hover:underline"
      >
        ← Volver al catálogo
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <FadeIn>
          <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--border)] bg-[#efe6dc]">
            {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className="flex h-full w-full items-end p-8"
                style={{
                  background:
                    "linear-gradient(145deg, #5c4334 0%, #3d2a1f 45%, #b0894f 140%)",
                }}
              >
                <p className="font-display text-3xl text-white/90">
                  {product.name}
                </p>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
            {product.category}
          </p>
          <h1 className="font-display mt-2 text-4xl text-[var(--wood-950)]">
            {product.name}
          </h1>
          {product.sku ? (
            <p className="mt-1 text-sm text-[var(--muted)]">SKU {product.sku}</p>
          ) : null}
          <p className="font-display mt-6 text-3xl text-[var(--wood-950)]">
            {formatCurrency(product.price)}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {product.stock > 0
              ? `Disponible · stock ${product.stock}`
              : "Disponible bajo pedido"}
          </p>

          {product.description ? (
            <p className="mt-6 leading-relaxed text-[var(--wood-800)]">
              {product.description}
            </p>
          ) : null}

          {dims ? (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Medidas: {dims} cm
            </p>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-[#b0894f] px-6 py-3 text-sm font-semibold text-[#3d2a1f] transition hover:bg-[#c49a5c]"
            >
              Consultar por WhatsApp
            </a>
            <Link
              href="/contacto"
              className="rounded-lg border border-[var(--border)] bg-white px-6 py-3 text-sm font-medium transition hover:border-[var(--wood-700)]"
            >
              Contacto
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

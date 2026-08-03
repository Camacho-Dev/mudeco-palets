import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { ProductCard } from "@/components/store/product-card";
import { BrandLogo } from "@/components/logo";
import { getStoreCompany, whatsappLink } from "@/lib/store";

export default async function StoreHomePage() {
  const company = await getStoreCompany();
  const featured = await prisma.product.findMany({
    where: { active: true, kind: "FINISHED" },
    orderBy: [{ category: "asc" }, { name: "asc" }],
    take: 6,
  });

  return (
    <div>
      <section className="relative min-h-[88vh] overflow-hidden bg-[#3d2a1f] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(176,137,79,0.35), transparent 55%), linear-gradient(120deg, #2a1c14 0%, #3d2a1f 40%, #5c4334 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 md:justify-center md:pb-24">
          <FadeIn>
            <BrandLogo
              width={220}
              height={275}
              className="mb-8 h-28 w-auto md:h-36"
              priority
            />
          </FadeIn>
          <FadeIn delay={0.12}>
            <h1 className="font-display max-w-xl text-4xl leading-tight md:text-6xl">
              {company.name}
            </h1>
          </FadeIn>
          <FadeIn delay={0.22}>
            <p className="mt-4 max-w-md text-base text-white/70 md:text-lg">
              {company.slogan}. Piezas únicas de madera recuperada para espacios
              con carácter.
            </p>
          </FadeIn>
          <FadeIn delay={0.32}>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="rounded-lg bg-[#b0894f] px-6 py-3 text-sm font-semibold text-[#3d2a1f] transition hover:bg-[#c49a5c]"
              >
                Ver catálogo
              </Link>
              <a
                href={whatsappLink(
                  company.phone,
                  `Hola, me interesa conocer los muebles de ${company.name}`,
                )}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/30 px-6 py-3 text-sm text-white transition hover:bg-white/10"
              >
                Escribir por WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <FadeIn>
          <p className="text-xs font-semibold tracking-[0.14em] text-[var(--muted)] uppercase">
            Selección
          </p>
          <h2 className="font-display mt-2 text-3xl text-[var(--wood-950)]">
            Piezas destacadas
          </h2>
          <p className="mt-2 max-w-lg text-[var(--muted)]">
            Del taller a tu espacio. Explora el catálogo completo de muebles
            disponibles.
          </p>
        </FadeIn>

        <Stagger className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-10 text-center">
          <Link
            href="/catalogo"
            className="inline-flex rounded-lg border border-[var(--border)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--wood-950)] transition hover:border-[var(--wood-700)]"
          >
            Ver todo el catálogo
          </Link>
        </div>
      </section>

      <section className="border-y border-[var(--border)] bg-[#efe6dc]/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:grid md:grid-cols-2 md:gap-12 md:items-center">
          <FadeIn>
            <h2 className="font-display text-3xl text-[var(--wood-950)]">
              Madera con historia
            </h2>
            <p className="mt-4 text-[var(--muted)] leading-relaxed">
              Transformamos materiales recuperados en muebles funcionales y
              estéticamente atractivos. Cada pieza es única, con carácter
              artesanal y conciencia ecológica.
            </p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mt-8 space-y-4 md:mt-0">
              <div className="border-l-2 border-[#b0894f] pl-4">
                <p className="font-medium text-[var(--wood-950)]">Misión</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Soluciones de diseño sostenible que reducen el impacto
                  ambiental.
                </p>
              </div>
              <div className="border-l-2 border-[#b0894f] pl-4">
                <p className="font-medium text-[var(--wood-950)]">Visión</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Liderar la transformación de madera recuperada en el Caribe.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

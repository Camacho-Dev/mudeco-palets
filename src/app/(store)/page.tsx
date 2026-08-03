import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion";
import { Reveal, HeroParallax, ScaleIn } from "@/components/store/store-motion";
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
  const categories = await prisma.product.findMany({
    where: { active: true, kind: "FINISHED" },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
    take: 8,
  });

  return (
    <div>
      {/* HERO — composición única, brand first, full-bleed */}
      <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#2f2018] text-[#faf6f1]">
        <HeroParallax className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/store-hero.jpg"
            alt=""
            className="h-[120%] w-full object-cover"
            fetchPriority="high"
          />
        </HeroParallax>
        <div className="absolute inset-0 bg-gradient-to-r from-[#2f2018]/92 via-[#2f2018]/72 to-[#2f2018]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2f2018]/80 via-transparent to-[#2f2018]/35" />

        <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-4 pb-20 pt-28 sm:px-6 md:justify-center md:pb-28">
          <ScaleIn>
            <BrandLogo
              width={180}
              height={225}
              className="mb-8 h-[4.5rem] w-auto md:h-[5.5rem]"
              priority
            />
          </ScaleIn>
          <FadeIn delay={0.15}>
            <h1 className="font-display max-w-2xl text-[2.75rem] leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
              {company.name}
            </h1>
          </FadeIn>
          <FadeIn delay={0.28}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-white/75 md:text-lg">
              {company.slogan}. Madera recuperada convertida en piezas únicas
              para vivir.
            </p>
          </FadeIn>
          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/catalogo" className="store-cta store-cta-primary">
                Ver catálogo
              </Link>
              <a
                href={whatsappLink(
                  company.phone,
                  `Hola, me interesa conocer los muebles de ${company.name}`,
                )}
                target="_blank"
                rel="noreferrer"
                className="store-cta store-cta-ghost"
              >
                WhatsApp
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Categorías — una sola fila limpia */}
      <section className="border-b border-[var(--border)] bg-[#fffdfb]">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-5 sm:px-6">
          {categories.map((c) => (
            <Link
              key={c.category}
              href={`/catalogo?cat=${encodeURIComponent(c.category)}`}
              className="shrink-0 rounded-full border border-[var(--border)] px-4 py-1.5 text-[0.7rem] tracking-[0.08em] text-[var(--muted)] uppercase transition hover:border-[var(--wood-700)] hover:text-[var(--wood-950)]"
            >
              {c.category}
            </Link>
          ))}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[var(--muted)] uppercase">
            Colección
          </p>
          <h2 className="font-display mt-3 text-4xl text-[var(--wood-950)] md:text-5xl">
            Piezas destacadas
          </h2>
          <p className="mt-3 max-w-lg text-[var(--muted)]">
            Selección del taller. Cada mueble cuenta una historia de
            transformación.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <StaggerItem key={p.id}>
              <ProductCard product={p} />
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal className="mt-14 text-center" delay={0.1}>
          <Link
            href="/catalogo"
            className="inline-flex border border-[var(--wood-800)] px-8 py-3 text-[0.75rem] font-semibold tracking-[0.14em] text-[var(--wood-950)] uppercase transition hover:bg-[var(--wood-950)] hover:text-white"
          >
            Explorar catálogo completo
          </Link>
        </Reveal>
      </section>

      {/* Craft — imagen real + copy */}
      <section className="bg-[#2f2018] text-[#faf6f1]">
        <div className="mx-auto grid max-w-6xl md:grid-cols-2">
          <div className="relative min-h-[420px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/store-craft.jpg"
              alt="Detalle de madera recuperada"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
            <Reveal>
              <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
                Oficio
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight md:text-5xl">
                Madera con historia
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
                Transformamos materiales recuperados en mobiliario funcional y
                estético. Autenticidad artesanal, innovación circular y calidad
                que perdura.
              </p>
              <Link
                href="/contacto"
                className="store-cta store-cta-primary mt-8 w-fit"
              >
                Conocer más
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl text-[var(--wood-950)] md:text-4xl">
            ¿Listo para tu próximo mueble?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[var(--muted)]">
            Escríbenos y te ayudamos a elegir la pieza ideal para tu espacio.
          </p>
          <a
            href={whatsappLink(
              company.phone,
              `Hola ${company.name}, quiero asesoría para elegir un mueble.`,
            )}
            target="_blank"
            rel="noreferrer"
            className="store-cta store-cta-primary mt-8"
          >
            Hablar por WhatsApp
          </a>
        </Reveal>
      </section>
    </div>
  );
}

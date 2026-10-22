import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hammer,
  Award,
  Home,
  Table2,
  Tv,
  Wrench,
  Ruler,
  Star,
  Quote,
  Camera,
  CheckCircle2,
} from "lucide-react";
import { FadeUp, Reveal } from "@/components/store/store-motion";
import { ProductShelf } from "@/components/store/product-shelf";
import { BeforeAfterSlider } from "@/components/store/before-after-slider";
import { prisma, withDbRetry } from "@/lib/prisma";
import { STORE_SOCIAL } from "@/lib/store-brand";
import { getTopRecommendedProducts } from "@/lib/recommendations";

const TRUST = [
  {
    icon: Leaf,
    title: "Madera recuperada",
    desc: "100% ecológica y curada contra plagas",
  },
  {
    icon: Hammer,
    title: "Hecho a mano",
    desc: "Ebanistería sin moldes industriales",
  },
  {
    icon: Award,
    title: "Calidad premium",
    desc: "Acabado fino y sellado antimanchas",
  },
  {
    icon: Home,
    title: "A tu medida",
    desc: "Adaptado al milímetro para tu espacio",
  },
] as const;

const PROMO_TILES = [
  {
    title: "Reparaciones",
    text: "Segunda vida a tu mueble",
    href: "/reparaciones",
    image: "/brand/store-workshop.jpg",
    icon: Wrench,
  },
  {
    title: "A medida",
    text: "Diseño personalizado",
    href: "/reparaciones",
    image: "/brand/store-craft.jpg",
    icon: Ruler,
  },
  {
    title: "Colección rústica",
    text: "Comedores y mesas nobles",
    href: "/catalogo?cat=MESA%20DE%20COMEDOR",
    image: "/brand/cat-mesa.jpg",
    icon: Table2,
  },
  {
    title: "Centros TV",
    text: "Piezas con carácter",
    href: "/catalogo?cat=REPISA%20DE%20TV",
    image: "/brand/cat-tv.jpg",
    icon: Tv,
  },
] as const;

const GALLERY = [
  "/brand/store-hero.jpg",
  "/brand/cat-mesa.jpg",
  "/brand/cat-tv.jpg",
  "/brand/cat-noche.jpg",
  "/brand/cat-banco.jpg",
  "/brand/cat-vinera.jpg",
  "/brand/store-craft.jpg",
  "/brand/store-workshop.jpg",
] as const;

const REVIEWS = [
  {
    name: "María L.",
    text: "La mesa quedó espectacular. Se nota el trabajo a mano y la solidez de los acabados. Es el centro de atención de mi sala.",
  },
  {
    name: "Carlos R.",
    text: "Repararon un mueble que creíamos perdido. La restauración respetó las vetas naturales y el resultado superó las expectativas.",
  },
  {
    name: "Andrea P.",
    text: "Pedimos a medida un centro de entretenimiento y respetaron cada centímetro. Entrega puntual y trato impecable.",
  },
] as const;

export default async function StoreHomePage() {
  type P = Awaited<ReturnType<typeof prisma.product.findMany>>;
  const empty: P = [];

  const [featured, newest, topRecommended] = await Promise.all([
    withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          orderBy: { createdAt: "desc" },
          take: 16,
        }),
      { fallback: empty },
    ),
    withDbRetry(
      () =>
        prisma.product.findMany({
          where: { active: true, kind: "FINISHED" },
          orderBy: { createdAt: "desc" },
          take: 12,
        }),
      { fallback: empty },
    ),
    withDbRetry(() => getTopRecommendedProducts(10), { fallback: [] }),
  ]);

  const fresh =
    newest.length > 4 ? newest.slice(0, 12) : featured.slice(0, 12);

  function toShelf(list: P) {
    return list.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price,
      taxRate: p.taxRate,
      stock: p.stock,
      imageUrl: p.imageUrl,
    }));
  }

  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* —— Hero principal con iluminación artesanal y micro-animaciones —— */}
      <section className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <div className="relative isolate min-h-[300px] sm:min-h-[380px] md:min-h-[440px] overflow-hidden border border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.85)]">
          {/* Imagen de fondo con sutil animación de zoom lento */}
          <div className="absolute inset-0 overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/store-hero.jpg"
              alt="Muebles rústicos Mudeco Palets"
              className="h-full w-full object-cover transition-transform duration-[12000ms] ease-out hover:scale-105 scale-102"
              fetchPriority="high"
            />
          </div>

          {/* Iluminación atmosférica en gradientes multicapa */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 25% 45%, rgba(201, 161, 90, 0.18), transparent 55%), linear-gradient(90deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.7) 48%, rgba(10,10,10,0.3) 100%)",
            }}
          />

          <div className="relative z-10 flex h-full min-h-[300px] sm:min-h-[380px] md:min-h-[440px] flex-col justify-center px-6 py-12 sm:px-10 md:px-14">
            <FadeUp>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-black/60 px-3.5 py-1 text-[0.62rem] font-semibold tracking-[0.2em] text-[#c9a15a] uppercase backdrop-blur-md mb-4 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c9a15a] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c9a15a]"></span>
                </span>
                Taller artesanal · República Dominicana
              </div>

              <h1 className="font-display max-w-2xl text-[clamp(2.1rem,4.5vw,3.6rem)] leading-[1.06] text-white">
                Muebles de madera recuperada con alma de taller
              </h1>

              <p className="mt-4 max-w-lg text-sm leading-relaxed text-[#d7d7d7]/90 sm:text-base">
                Cada pieza nace de materiales nobles reciclados, transformados con pasión artesanal. Diseños únicos para tu hogar o proyectos comerciales a la medida.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/catalogo"
                  className="group relative inline-flex items-center gap-2 overflow-hidden border border-[#c9a15a] bg-[#c9a15a] px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition-all duration-300 hover:bg-[#d4b06e] hover:shadow-[0_0_28px_rgba(201,161,90,0.35)]"
                >
                  Ver catálogo
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href="/reparaciones"
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-6 py-3.5 text-[0.7rem] font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm transition-all duration-300 hover:border-[#c9a15a]/60 hover:bg-white/[0.08]"
                >
                  Cotizar a medida
                </Link>
              </div>

              {/* Mini métricas flotantes de confianza */}
              <div className="mt-8 hidden pt-6 border-t border-white/10 sm:flex items-center gap-8 text-xs text-white/70">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-[#c9a15a] font-semibold">+500</span>
                  <span>Piezas fabricadas</span>
                </div>
                <div className="h-3 w-[1px] bg-white/15" />
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-[#c9a15a] font-semibold">100%</span>
                  <span>Pino tratado</span>
                </div>
                <div className="h-3 w-[1px] bg-white/15" />
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg text-[#c9a15a] font-semibold">10 años</span>
                  <span>Garantía de ensamble</span>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* —— Trust strip interactivo —— */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {TRUST.map((t, idx) => (
            <Reveal key={t.title} delay={idx * 0.06}>
              <div className="group relative flex items-center gap-3.5 border border-white/[0.08] bg-[#111111] p-4 transition-all duration-300 hover:border-[#c9a15a]/50 hover:bg-[#161616] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#c9a15a]/25 bg-[#c9a15a]/10 text-[#c9a15a] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#c9a15a] group-hover:text-[#0a0a0a] group-hover:shadow-[0_0_15px_rgba(201,161,90,0.3)]">
                  <t.icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <h4 className="text-[0.72rem] font-semibold tracking-wider text-white uppercase group-hover:text-[#c9a15a] transition-colors">
                    {t.title}
                  </h4>
                  <p className="mt-0.5 text-xs text-white/50 leading-tight">
                    {t.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      {/* —— Estanterías de productos con micro-interacciones —— */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductShelf
          title="Destacados para ti"
          subtitle="Piezas emblemáticas seleccionadas por nuestro taller"
          href="/catalogo"
          products={toShelf(featured)}
        />

        {/* Promo tiles 2x2 interactivos */}
        <section className="border-b border-white/[0.06] py-10">
          <Reveal>
            <div className="mb-6 flex items-end justify-between">
              <div>
                <p className="text-[0.65rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
                  Categorías
                </p>
                <h2 className="font-display mt-1 text-2xl text-white md:text-3xl">
                  Explora por estilo
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="text-[0.68rem] font-semibold tracking-[0.12em] text-[#c9a15a] uppercase hover:text-[#d4b06e] transition"
              >
                Catálogo completo →
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROMO_TILES.map((tile, i) => (
              <Reveal key={tile.title} delay={i * 0.05}>
                <Link
                  href={tile.href}
                  className="group relative block aspect-[4/3] overflow-hidden border border-white/[0.08] bg-[#141414] transition-all duration-500 hover:border-[#c9a15a]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 transition-opacity duration-300 group-hover:from-black/95 group-hover:via-black/55" />
                  
                  {/* Borde interior dorado animado */}
                  <div className="absolute inset-2.5 border border-[#c9a15a]/0 transition-all duration-500 group-hover:border-[#c9a15a]/40 pointer-events-none" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60 border border-white/10 mb-2.5 text-[#c9a15a] backdrop-blur-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#c9a15a] group-hover:text-black">
                      <tile.icon className="h-4 w-4" strokeWidth={1.75} />
                    </div>
                    <p className="font-display text-xl text-white">{tile.title}</p>
                    <p className="mt-1 text-xs text-[#d7d7d7]/80">{tile.text}</p>
                    <p className="mt-3 inline-flex items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[#c9a15a] uppercase">
                      <span>Explorar</span>
                      <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <ProductShelf
          title="Los más vendidos"
          subtitle="Piezas con mayor demanda y pedidos confirmados"
          href="/catalogo?filter=popular"
          products={topRecommended.map((p) => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            taxRate: p.taxRate,
            stock: p.stock,
            imageUrl: p.imageUrl,
            badge: p.badge,
          }))}
        />

        <ProductShelf
          title="Recién salidos del taller"
          subtitle="Nuevas creaciones artesanales listas para entrega"
          href="/catalogo"
          products={toShelf(fresh)}
        />
      </div>

      {/* —— Antes y después con slider interactivo —— */}
      <section className="border-y border-white/[0.06] bg-[#111111]/90 py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
                Maestría y oficio
              </p>
              <h2 className="font-display mt-1 text-2xl text-white sm:text-3xl md:text-4xl">
                El arte de la transformación
              </h2>
              <p className="mt-2 text-sm text-white/60 max-w-xl">
                Compara en tiempo real cómo convertimos palets industriales y madera descartada en piezas finas de ebanistería.
              </p>
            </div>
            <Link
              href="/reparaciones"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:text-[#e4be78]"
            >
              Ver proceso de taller
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <BeforeAfterSlider />
        </div>
      </section>

      {/* —— Opiniones de clientes con acabado editorial —— */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <p className="text-[0.65rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
            Testimonios
          </p>
          <h2 className="font-display mt-2 text-2xl text-white sm:text-3xl md:text-4xl">
            La confianza de nuestros clientes
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <Reveal key={r.name} delay={i * 0.08}>
              <blockquote className="group relative h-full flex flex-col justify-between border border-white/[0.08] bg-[#141414] p-6 transition-all duration-300 hover:border-[#c9a15a]/40 hover:bg-[#181818] hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(0,0,0,0.5)]">
                <Quote className="h-6 w-6 text-[#c9a15a]/30 mb-3" />
                <p className="text-sm leading-relaxed text-[#d7d7d7]/90 italic flex-1">
                  "{r.text}"
                </p>
                <div className="mt-5 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold tracking-wide text-white">
                      {r.name}
                    </p>
                    <div className="flex items-center gap-1 text-[0.6rem] text-emerald-400 mt-0.5">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Compra verificada</span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className="h-3 w-3 fill-[#c9a15a] text-[#c9a15a]"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      {/* —— Galería de Instagram con hover interactivo —— */}
      <section className="border-t border-white/[0.06] bg-[#0c0c0c] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
                Comunidad
              </p>
              <h2 className="font-display mt-1 text-2xl text-white">Galería del taller</h2>
            </div>
            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase hover:text-[#d4b06e] transition"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>@mudecopalets</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {GALLERY.map((src, i) => (
              <a
                key={i}
                href={STORE_SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden border border-white/[0.06] bg-[#161616]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-115"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-[#c9a15a] scale-75 group-hover:scale-100 transition-transform duration-300" />
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

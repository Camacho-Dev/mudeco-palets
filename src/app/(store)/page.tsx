import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hammer,
  Award,
  Home,
  Table2,
  Tv,
  BedDouble,
  LayoutGrid,
  Armchair,
  Flower2,
  Wrench,
  Ruler,
  Star,
} from "lucide-react";
import { FadeUp, Reveal } from "@/components/store/store-motion";
import { StoreHomeSearch } from "@/components/store/store-home-search";
import { ProductShelf } from "@/components/store/product-shelf";
import { prisma, withDbRetry } from "@/lib/prisma";
import { STORE_SOCIAL } from "@/lib/store-brand";

const FEATURED_CATS = [
  { label: "Mesas", href: "/catalogo?cat=MESA%20DE%20CENTRO", icon: Table2 },
  { label: "Centros TV", href: "/catalogo?cat=REPISA%20DE%20TV", icon: Tv },
  { label: "Camas", href: "/catalogo?cat=BASE%20DE%20CAMA", icon: BedDouble },
  {
    label: "Estanterías",
    href: "/catalogo?cat=REPISA%20DE%20ENTRADA",
    icon: LayoutGrid,
  },
  {
    label: "Comedores",
    href: "/catalogo?cat=MESA%20DE%20COMEDOR",
    icon: Armchair,
  },
  { label: "Decoración", href: "/catalogo?cat=VINERA", icon: Flower2 },
] as const;

const TRUST = [
  { icon: Leaf, t: "Madera recuperada" },
  { icon: Hammer, t: "Hecho a mano" },
  { icon: Award, t: "Calidad premium" },
  { icon: Home, t: "A tu medida" },
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
    text: "Comedores y mesas",
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
    text: "La mesa quedó espectacular. Se nota el trabajo a mano.",
  },
  {
    name: "Carlos R.",
    text: "Repararon un mueble que creíamos perdido. Resultado de lujo.",
  },
  {
    name: "Andrea P.",
    text: "Pedimos a medida y respetaron cada detalle.",
  },
] as const;

import { getTopRecommendedProducts } from "@/lib/recommendations";

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
      {/* —— Search + categorías (flow Amazon) —— */}
      <div className="border-b border-white/[0.06] bg-[#0f0f0f]">
        <div className="mx-auto max-w-7xl space-y-4 px-4 py-4 sm:px-6 lg:px-8">
          <StoreHomeSearch />
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FEATURED_CATS.map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                className="inline-flex shrink-0 items-center gap-2 border border-white/[0.08] bg-white/[0.02] px-3.5 py-2 text-[0.65rem] font-medium tracking-[0.12em] text-[#d7d7d7] uppercase transition duration-300 hover:border-[#c9a15a]/45 hover:text-white"
              >
                <cat.icon className="h-3.5 w-3.5 text-[#c9a15a]" strokeWidth={1.5} />
                {cat.label}
              </Link>
            ))}
            <Link
              href="/catalogo"
              className="inline-flex shrink-0 items-center gap-1 border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-3.5 py-2 text-[0.65rem] font-semibold tracking-[0.12em] text-[#c9a15a] uppercase transition hover:bg-[#c9a15a]/20"
            >
              Todo el catálogo
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* —— Hero tipo banner Amazon (estilo Mudeco) —— */}
      <section className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="relative isolate min-h-[220px] overflow-hidden sm:min-h-[280px] md:min-h-[320px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/store-hero.jpg"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,.82) 0%, rgba(0,0,0,.45) 55%, rgba(0,0,0,.25) 100%)",
            }}
          />
          <div className="relative z-10 flex h-full min-h-[220px] flex-col justify-center px-6 py-10 sm:min-h-[280px] sm:px-10 md:min-h-[320px] md:px-14">
            <FadeUp>
              <p className="text-[0.65rem] font-medium tracking-[0.28em] text-[#c9a15a] uppercase">
                Mudeco Palets
              </p>
              <h1 className="font-display mt-3 max-w-xl text-[clamp(1.85rem,4vw,3.25rem)] leading-[1.08] text-white">
                Muebles de madera recuperada hechos a mano
              </h1>
              <p className="mt-3 max-w-md text-sm text-[#d7d7d7] sm:text-base">
                Explora, compara y elige piezas únicas — o pide reparación y
                cotización a medida.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/catalogo" className="store-cta store-cta-primary !py-3 !px-5 text-[0.68rem]">
                  Ver catálogo
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/reparaciones" className="store-cta store-cta-ghost !py-3 !px-5 text-[0.68rem]">
                  Reparaciones
                </Link>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* —— Trust strip —— */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mt-4 grid grid-cols-2 border border-white/[0.06] bg-[#111111] sm:grid-cols-4">
          {TRUST.map((t) => (
            <div
              key={t.t}
              className="flex items-center gap-3 border-white/[0.06] px-4 py-4 sm:border-r sm:last:border-r-0 [&:nth-child(odd)]:border-r max-sm:[&:nth-child(-n+2)]:border-b"
            >
              <t.icon className="h-4 w-4 shrink-0 text-[#c9a15a]" strokeWidth={1.5} />
              <span className="text-[0.65rem] font-medium tracking-[0.1em] text-[#d7d7d7] uppercase">
                {t.t}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* —— Estanterías de productos —— */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ProductShelf
          title="Destacados para ti"
          subtitle="Piezas seleccionadas del taller"
          href="/catalogo"
          products={toShelf(featured)}
        />

        {/* Promo tiles 2x2 Amazon-style */}
        <section className="border-b border-white/[0.06] py-8">
          <Reveal>
            <h2 className="font-display mb-5 text-2xl text-white md:text-3xl">
              Explora por estilo
            </h2>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {PROMO_TILES.map((tile, i) => (
              <Reveal key={tile.title} delay={i * 0.05}>
                <Link
                  href={tile.href}
                  className="group relative block aspect-[4/3] overflow-hidden border border-white/[0.08]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/10" />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <tile.icon
                      className="mb-2 h-4 w-4 text-[#c9a15a]"
                      strokeWidth={1.5}
                    />
                    <p className="font-display text-xl text-white">{tile.title}</p>
                    <p className="mt-1 text-xs text-[#d7d7d7]">{tile.text}</p>
                    <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.14em] text-[#c9a15a] uppercase">
                      Ver →
                    </p>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <ProductShelf
          title="🔥 Lo más pedido y comprado"
          subtitle="Top de tendencias según compras y cotizaciones de clientes"
          href="/catalogo"
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
          title="Recién llegados"
          subtitle="Últimas piezas publicadas"
          href="/catalogo"
          products={toShelf(fresh)}
        />
      </div>

      {/* —— Antes / Después compacto —— */}
      <section className="border-y border-white/[0.06] bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[0.65rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
                Taller
              </p>
              <h2 className="font-display mt-2 text-2xl text-white md:text-3xl">
                Antes y después
              </h2>
            </div>
            <Link
              href="/reparaciones"
              className="text-[0.68rem] font-semibold tracking-[0.12em] text-[#c9a15a] uppercase"
            >
              Solicitar reparación →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              {
                before: "/brand/store-workshop.jpg",
                after: "/brand/cat-mesa.jpg",
                label: "Mesa restaurada",
              },
              {
                before: "/brand/store-craft.jpg",
                after: "/brand/cat-tv.jpg",
                label: "Mueble TV",
              },
              {
                before: "/brand/store-workshop.jpg",
                after: "/brand/cat-banco.jpg",
                label: "Banco renovado",
              },
            ].map((pair) => (
              <div key={pair.label}>
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pair.before} alt="" className="h-full w-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 bg-black/75 px-1.5 py-0.5 text-[0.5rem] font-semibold tracking-[0.12em] text-[#d7d7d7] uppercase">
                      Antes
                    </span>
                  </div>
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={pair.after} alt="" className="h-full w-full object-cover" />
                    <span className="absolute right-1.5 bottom-1.5 bg-[#c9a15a] px-1.5 py-0.5 text-[0.5rem] font-semibold tracking-[0.12em] text-[#0a0a0a] uppercase">
                      Después
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-sm text-[#d7d7d7]">{pair.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* —— Opiniones —— */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl text-white md:text-3xl">
          Opiniones de clientes
        </h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {REVIEWS.map((r) => (
            <blockquote
              key={r.name}
              className="border border-white/[0.08] bg-[#141414] p-5"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3 w-3 fill-[#c9a15a] text-[#c9a15a]"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-[#d7d7d7]">{r.text}</p>
              <p className="mt-4 text-xs font-medium tracking-wide text-white">
                {r.name}
              </p>
            </blockquote>
          ))}
        </div>
      </section>

      {/* —— Instagram strip —— */}
      <section className="border-t border-white/[0.06] bg-[#111111]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-5 flex items-end justify-between gap-3">
            <h2 className="font-display text-2xl text-white">Galería</h2>
            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="text-[0.68rem] font-semibold tracking-[0.12em] text-[#c9a15a] uppercase"
            >
              Instagram →
            </a>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8">
            {GALLERY.map((src) => (
              <a
                key={src}
                href={STORE_SOCIAL.instagram}
                target="_blank"
                rel="noreferrer"
                className="group relative aspect-square overflow-hidden"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

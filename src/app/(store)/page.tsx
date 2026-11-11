import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hammer,
  Award,
  Home,
  Table2,
  Tv,
  Ruler,
  Camera,
  Sparkles,
  MessageCircle,
  Layers,
  Star,
} from "lucide-react";
import { FadeUp, Reveal } from "@/components/store/store-motion";
import { ProductShelf } from "@/components/store/product-shelf";
import { withDbRetry } from "@/lib/prisma";
import { STORE_SOCIAL } from "@/lib/store-brand";
import { getScoredProducts } from "@/lib/recommendations";
import { getStoreCompany } from "@/lib/store";
import { storeWhatsApp } from "@/lib/store-info";
import { HeroSearchBar } from "@/components/store/hero-search-bar";


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

const CRAFT_STEPS = [
  {
    step: "01",
    title: "Curado & Selección",
    desc: "Desarmado artesanal de palets de pino noble. Tratamiento térmico ecológico antiparasitario.",
    icon: Leaf,
  },
  {
    step: "02",
    title: "Calibración de Vetas",
    desc: "Cepillado milimétrico respetando el relieve orgánico y la personalidad natural de la madera.",
    icon: Ruler,
  },
  {
    step: "03",
    title: "Ebanistería Robusta",
    desc: "Ensamble estructural reforzado con espigas y juntas calibradas para décadas de uso intensivo.",
    icon: Hammer,
  },
  {
    step: "04",
    title: "Sellado Satinado",
    desc: "Lijado fino al tacto, tintado artesanal y aplicación de capa protectora impermeable.",
    icon: Award,
  },
] as const;


const GALLERY = [
  "/brand/brand-wood-hero.jpg",
  "/brand/brand-wood-stamp.jpg",
  "/brand/store-hero.jpg",
  "/brand/cat-mesa.jpg",
  "/brand/cat-tv.jpg",
  "/brand/cat-noche.jpg",
  "/brand/cat-banco.jpg",
  "/brand/cat-vinera.jpg",
] as const;

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StoreHomePage() {
  const [company, scoredProducts] = await Promise.all([
    getStoreCompany(),
    withDbRetry(() => getScoredProducts(), { fallback: [] }),
  ]);

  const topRecommended = scoredProducts.slice(0, 10);
  const featured = scoredProducts.slice(0, 16);

  const promoTiles = [
    {
      title: "Bases de Cama",
      text: "41 modelos · Rústicas y King",
      href: "/catalogo?cat=BASE%20DE%20CAMA",
      image: "/uploads/mueble_20261026_181238_0.jpeg",
      icon: Home,
    },
    {
      title: "Mesas de Comedor",
      text: "15 modelos · Pino curado 6-8 puestos",
      href: "/catalogo?cat=MESA%20DE%20COMEDOR",
      image: company.promoMesaImage || "/uploads/mueble_b2_021.jpeg",
      icon: Table2,
    },
    {
      title: "Mesas de Centro",
      text: "15 modelos · Diseños artesanales",
      href: "/catalogo?cat=MESA%20DE%20CENTRO",
      image: "/uploads/mueble_b2_036.jpeg",
      icon: Sparkles,
    },
    {
      title: "Gaveteros & Cómodas",
      text: "12 modelos · Almacenamiento rústico",
      href: "/catalogo?cat=GAVETEROS",
      image: "/uploads/mueble_b2_061.jpeg",
      icon: Layers,
    },
    {
      title: "Centros & Repisas TV",
      text: "10 modelos · Madera maciza",
      href: "/catalogo?cat=REPISA%20DE%20TV",
      image: company.promoTvImage || "/uploads/mueble_b2_073.jpeg",
      icon: Tv,
    },
    {
      title: "Proyectos a Medida",
      text: "Diseño & medidas personalizadas",
      href: "/contacto",
      image: "/uploads/mueble_b2_090.jpeg",
      icon: Ruler,
    },
  ];

  let gallery: readonly string[] = GALLERY;
  if (company.galleryImages) {
    try {
      const parsed = JSON.parse(company.galleryImages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        gallery = parsed;
      }
    } catch {}
  }

  function toShelf(list: Array<{ id: string; name: string; category: string; price: number; taxRate: number; stock: number; imageUrl: string | null }>) {
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

  const availableForSearch = scoredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    badge: p.badge,
  }));

  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* —— Hero principal FULL-WIDTH Edge-to-Edge —— */}
      <section className="relative z-20 w-full border-b border-white/[0.08] bg-[#0a0a0a]">
        <div className="relative min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] xl:min-h-[740px] w-full">
          {/* Imagen de fondo estática de alta nitidez */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.heroImage}
              alt="Muebles rústicos Mudeco Palets"
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </div>

          {/* Iluminación atmosférica en gradientes multicapa */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 20% 45%, rgba(201, 161, 90, 0.16), transparent 55%), linear-gradient(90deg, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.80) 48%, rgba(10,10,10,0.50) 100%)",
            }}
          />

          <div className="relative z-20 mx-auto flex h-full min-h-[520px] sm:min-h-[580px] md:min-h-[640px] lg:min-h-[700px] xl:min-h-[740px] w-full max-w-[1920px] flex-col justify-center px-4 py-12 sm:px-8 md:px-12 lg:px-14 xl:px-16 2xl:px-20">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-10 xl:gap-14 items-center">
              {/* Columna Izquierda: Mensaje editorial y llamadas a la acción */}
              <div className="lg:col-span-7 xl:col-span-7">
                <FadeUp>
                  <h1 className="font-display max-w-2xl text-[clamp(2.3rem,4.2vw,4.2rem)] leading-[1.05] text-white">
                    {company.heroTitle}
                  </h1>

                  <p className="mt-4 max-w-xl text-base leading-relaxed text-[#d7d7d7]/90 sm:text-lg">
                    {company.heroSubtitle}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-3.5">
                    <Link
                      href="/catalogo"
                      className="group relative inline-flex items-center gap-2 overflow-hidden border border-[#c9a15a] bg-[#c9a15a] px-7 py-3.5 text-xs font-bold tracking-[0.14em] text-[#0a0a0a] uppercase transition-all duration-300 hover:bg-[#d4b06e] hover:shadow-[0_0_28px_rgba(201,161,90,0.35)]"
                    >
                      Ver catálogo
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>

                    <Link
                      href="/contacto"
                      className="inline-flex items-center gap-2 border border-white/20 bg-white/[0.04] px-7 py-3.5 text-xs font-medium tracking-[0.14em] text-white uppercase backdrop-blur-sm transition-all duration-300 hover:border-[#c9a15a]/60 hover:bg-white/[0.08]"
                    >
                      Cotizar a medida
                    </Link>
                  </div>

                  {/* Mini métricas flotantes de confianza */}
                  <div className="mt-10 hidden pt-6 border-t border-white/10 sm:flex items-center gap-8 text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-[#c9a15a] font-semibold">+100</span>
                      <span>Modelos en catálogo</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/15" />
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-[#c9a15a] font-semibold">100%</span>
                      <span>Pino curado y tratado</span>
                    </div>
                    <div className="h-3 w-[1px] bg-white/15" />
                    <div className="flex items-center gap-2">
                      <span className="font-display text-lg text-[#c9a15a] font-semibold">A medida</span>
                      <span>Garantía de taller</span>
                    </div>
                  </div>
                </FadeUp>
              </div>

              {/* Columna Derecha: Únicamente el buscador profesional (con z-30 para sobreponerse sin ser recortado) */}
              <div className="relative z-30 lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
                <HeroSearchBar products={availableForSearch} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* —— Trust strip FULL-WIDTH —— */}
      <section className="relative z-10 w-full border-b border-white/[0.08] bg-[#0c0c0c]">
        <div className="mx-auto w-full max-w-[1920px] px-4 py-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {TRUST.map((t, idx) => (
              <Reveal key={t.title} delay={idx * 0.06}>
                <div className="group relative flex items-center gap-3.5 border border-white/[0.08] bg-[#121212] p-4 transition-all duration-300 hover:border-[#c9a15a]/50 hover:bg-[#161616] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] hover:-translate-y-0.5">
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
      </section>

      {/* —— Estanterías de productos con micro-interacciones —— */}
      <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promoTiles.map((tile, i) => (
              <Reveal key={tile.title} delay={i * 0.05}>
                <Link
                  href={tile.href}
                  className="group relative block aspect-[4/3] overflow-hidden border border-white/[0.08] bg-[#141414] transition-all duration-500 hover:border-[#c9a15a]/60 hover:shadow-[0_16px_36px_rgba(0,0,0,0.6)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
      </div>

      {/* —— El Proceso Mudeco: Del Palet a la Obra de Arte —— */}
      <section className="border-b border-white/[0.06] bg-[#0c0c0c] py-20">
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <Reveal>
            <div className="max-w-2xl mb-12">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                <Sparkles className="h-3 w-3" />
                Oficio & Sostenibilidad
              </div>
              <h2 className="font-display mt-3 text-3xl text-white sm:text-4xl">
                El Proceso Mudeco: Del palet a tu hogar
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Cada creación atraviesa un riguroso estándar de 4 fases para convertir madera industrial en piezas únicas con garantía estructural.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CRAFT_STEPS.map((step, idx) => (
              <Reveal key={step.step} delay={idx * 0.08}>
                <div className="store-step-card group relative h-full flex flex-col justify-between border border-white/[0.08] bg-[#121212] p-6 transition-all duration-300 hover:border-[#c9a15a]/50 hover:bg-[#161616] hover:-translate-y-1 hover:shadow-[0_14px_36px_rgba(0,0,0,0.5)]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="store-step-num">{step.step}</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#c9a15a] transition-all duration-300 group-hover:bg-[#c9a15a] group-hover:text-black">
                      <step.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  </div>
                  <h3 className="font-display text-xl text-white group-hover:text-[#c9a15a] transition-colors">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-[#d7d7d7]/70 flex-1">
                    {step.desc}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— Taller & Historia de Marca —— */}
      <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#0d0d0d] py-20 text-white">
        <div className="pointer-events-none absolute -top-40 right-0 h-[480px] w-[480px] rounded-full bg-[#c9a15a]/5 blur-[120px]" />

        <div className="relative mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <Reveal>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
                  <Sparkles className="h-3 w-3" />
                  Atelier & Filosofía
                </div>
                <h2 className="font-display mt-4 text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
                  Diseño con propósito: convirtiendo el descarte en arte vivo
                </h2>
                <p className="text-base sm:text-lg leading-relaxed text-white/75">
                  Cada pieza nace de materiales nobles reciclados en nuestro taller de Santo Domingo. Transformamos madera de pino curada en muebles de alta resistencia con acabados satinados al aceite natural.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4">
                  <Link
                    href="/nosotros"
                    className="inline-flex items-center gap-2 text-sm font-semibold tracking-wider text-[#c9a15a] uppercase hover:underline"
                  >
                    <span>Conoce nuestra historia y valores</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <span className="text-white/20">|</span>
                  <Link
                    href="/contacto"
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    Visitar taller en Santo Domingo
                  </Link>
                </div>
              </Reveal>
            </div>

            <div className="lg:col-span-5">
              <Reveal delay={0.12}>
                <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-3 shadow-2xl transition duration-500 hover:border-[#c9a15a]/40">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={company.craftImage || "/brand/brand-wood-stamp.jpg"}
                      alt="Madera de palet con logo grabado a fuego Mudeco Palets"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 w-2 rounded-full bg-[#c9a15a]" />
                        <span className="text-xs font-semibold tracking-wider text-white uppercase">
                          Taller Artesanal Santo Domingo
                        </span>
                      </div>
                      <span className="rounded-md border border-[#c9a15a]/40 bg-black/60 px-2 py-0.5 text-[0.65rem] font-medium text-[#c9a15a] backdrop-blur-md">
                        100% Madera Curada
                      </span>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* —— Testimonios Selectos —— */}
      <section className="border-b border-white/[0.06] bg-[#0c0c0c] py-20 text-white">
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
                <Star className="h-3 w-3 fill-[#c9a15a] text-[#c9a15a]" />
                Opiniones Verificadas
              </div>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl text-white">
                Lo que dicen nuestros clientes
              </h2>
              <p className="mt-2 text-sm text-white/60">
                Familias y negocios que ya disfrutan de piezas artesanales Mudeco en sus espacios.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Pedí un comedor a medida para mi terraza en Piantini y superó por completo mis expectativas. Los acabados son finos, la madera huele increíble y la atención de Martín fue impecable.",
                author: "Carolina Mendoza",
                role: "Diseñadora de Interiores · Santo Domingo",
                tag: "Comedor 8 puestos",
              },
              {
                quote: "Excelente calidad y robustez. Tenía dudas sobre los muebles de palets pero el tratamiento que le dan es de primera categoría. 100% recomendado.",
                author: "Ing. Roberto Alcántara",
                role: "Cliente Residencial · Bella Vista",
                tag: "Centro de TV Flotante",
              },
              {
                quote: "Equipamos toda el área lounge de nuestro café con bancas y mesas Mudeco. La calidez que le dio al local atrajo a muchos clientes. Puntuales y formales.",
                author: "Lic. Andrea Tavárez",
                role: "Propietaria de Café · Naco",
                tag: "Mobiliario Comercial",
              },
            ].map((t, idx) => (
              <Reveal key={t.author} delay={idx * 0.1}>
                <div className="flex h-full flex-col justify-between rounded-xl border border-white/[0.08] bg-[#121212] p-7 transition-all duration-300 hover:border-[#c9a15a]/40 hover:-translate-y-1 hover:shadow-xl">
                  <div>
                    <div className="flex items-center gap-1 text-[#c9a15a] mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-[#c9a15a]" />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-white/80 italic">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>
                  <div className="mt-6 pt-5 border-t border-white/[0.06] flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{t.author}</h4>
                      <p className="text-[0.72rem] text-white/50">{t.role}</p>
                    </div>
                    <span className="rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-2.5 py-0.5 text-[0.62rem] font-medium text-[#c9a15a]">
                      {t.tag}
                    </span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— Banner VIP Proyectos Especiales y a Medida —— */}
      <section className="mx-auto w-full max-w-[1920px] px-4 py-8 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
        <Reveal>
          <div className="store-vip-banner rounded-lg p-8 sm:p-12 border border-[#c9a15a]/35 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/40 bg-[#c9a15a]/10 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                <Sparkles className="h-3 w-3" />
                Taller VIP · Proyectos Especiales
              </div>
              <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl text-white">
                ¿Tienes una idea en mente o viste una foto en Pinterest?
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                Fabricamos a medida comedores, repisas flotantes, camas, barras y mobiliario comercial. Envíanos una foto de referencia y tus medidas para cotizarte sin compromiso.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <a
                href={storeWhatsApp(
                  company.phone,
                  "Hola Mudeco Palets, tengo un diseño/foto en mente y me gustaría solicitar una cotización a medida.",
                )}
                target="_blank"
                rel="noreferrer"
                className="store-cta store-cta-primary group text-center"
              >
                <MessageCircle className="h-4 w-4" />
                Cotizar por WhatsApp
              </a>
              <Link
                href="/contacto"
                className="store-cta store-cta-ghost text-center"
              >
                Formulario de contacto
              </Link>
            </div>
          </div>
        </Reveal>
      </section>


      {/* —— Galería de Instagram con hover interactivo —— */}
      <section className="border-t border-white/[0.06] bg-[#0c0c0c] py-14">
        <div className="mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20">
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
              <span>@mudeco_palets</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {gallery.map((src, i) => (
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
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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

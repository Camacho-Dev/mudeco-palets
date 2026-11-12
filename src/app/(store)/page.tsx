import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Hammer,
  Award,
  Home,
  Ruler,
  Camera,
  MessageCircle,
  Star,
} from "lucide-react";
import { FadeUp, HeroZoom, Reveal } from "@/components/store/store-motion";
import { ProductShelf } from "@/components/store/product-shelf";
import { withDbRetry } from "@/lib/prisma";
import { STORE_SOCIAL } from "@/lib/store-brand";
import { getScoredProducts } from "@/lib/recommendations";
import { getStoreCompany } from "@/lib/store";
import { storeWhatsApp } from "@/lib/store-info";
import { HeroSearchBar } from "@/components/store/hero-search-bar";

const TRUST = [
  { icon: Leaf, title: "Madera recuperada", desc: "Pino curado contra plagas y humedad" },
  { icon: Hammer, title: "Hecho a mano", desc: "Ebanistería sin moldes industriales" },
  { icon: Award, title: "Acabado premium", desc: "Lijado fino y sellado antimanchas" },
  { icon: Home, title: "A tu medida", desc: "Adaptado al milímetro a tu espacio" },
] as const;

const CRAFT_STEPS = [
  {
    step: "01",
    title: "Curado y selección",
    desc: "Desarmamos palets de pino noble y los tratamos térmicamente contra parásitos.",
  },
  {
    step: "02",
    title: "Calibración de vetas",
    desc: "Cepillado milimétrico que respeta el relieve y la personalidad de la madera.",
  },
  {
    step: "03",
    title: "Ebanistería robusta",
    desc: "Ensambles reforzados con espigas y juntas calibradas para décadas de uso.",
  },
  {
    step: "04",
    title: "Sellado satinado",
    desc: "Lijado fino, tinte artesanal y capa protectora impermeable.",
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "Pedí un comedor a medida para mi terraza y superó mis expectativas. Los acabados son finos y la atención fue impecable.",
    author: "Carolina Mendoza",
    role: "Diseñadora de interiores · Santo Domingo",
  },
  {
    quote:
      "Tenía dudas sobre los muebles de palets, pero el tratamiento que le dan es de primera. Calidad y robustez excelentes.",
    author: "Ing. Roberto Alcántara",
    role: "Cliente residencial · Bella Vista",
  },
  {
    quote:
      "Equipamos el área lounge de nuestro café con bancas y mesas Mudeco. La calidez que le dio al local se nota. Puntuales y formales.",
    author: "Lic. Andrea Tavárez",
    role: "Propietaria de café · Naco",
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

/** Contenedor horizontal común de todas las secciones */
const WRAP =
  "mx-auto w-full max-w-[1920px] px-4 sm:px-8 lg:px-12 xl:px-16 2xl:px-20";

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[0.65rem] font-semibold tracking-[0.24em] text-[#c9a15a] uppercase">
      {children}
    </p>
  );
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StoreHomePage() {
  const [company, scoredProducts] = await Promise.all([
    getStoreCompany(),
    withDbRetry(() => getScoredProducts(), { fallback: [] }),
  ]);

  const featured = scoredProducts.slice(0, 12).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    taxRate: p.taxRate,
    stock: p.stock,
    imageUrl: p.imageUrl,
    badge: p.badge,
    madeToOrderOnly: p.madeToOrderOnly,
  }));

  const categoryTiles = [
    {
      title: "Bases de cama",
      text: "Rústicas, Queen y King",
      href: "/catalogo?cat=BASE%20DE%20CAMA",
      image: "/uploads/mueble_20261026_181238_0.jpeg",
    },
    {
      title: "Mesas de comedor",
      text: "Pino curado de 6 a 8 puestos",
      href: "/catalogo?cat=MESA%20DE%20COMEDOR",
      image: company.promoMesaImage || "/uploads/mueble_b2_021.jpeg",
    },
    {
      title: "Mesas de centro",
      text: "Diseños artesanales",
      href: "/catalogo?cat=MESA%20DE%20CENTRO",
      image: "/uploads/mueble_b2_036.jpeg",
    },
    {
      title: "Gaveteros y cómodas",
      text: "Almacenamiento rústico",
      href: "/catalogo?cat=GAVETEROS",
      image: "/uploads/mueble_b2_061.jpeg",
    },
    {
      title: "Centros y repisas TV",
      text: "Madera maciza",
      href: "/catalogo?cat=REPISA%20DE%20TV",
      image: company.promoTvImage || "/uploads/mueble_b2_073.jpeg",
    },
    {
      title: "Proyectos a medida",
      text: "Tu diseño, nuestras manos",
      href: "/contacto",
      image: "/uploads/mueble_b2_090.jpeg",
    },
  ];

  let gallery: readonly string[] = GALLERY;
  if (company.galleryImages) {
    try {
      const parsed = JSON.parse(company.galleryImages);
      if (Array.isArray(parsed) && parsed.length > 0) {
        gallery = parsed;
      }
    } catch {
      // JSON inválido en configuración: se usa la galería por defecto
    }
  }

  const availableForSearch = scoredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl,
    badge: p.badge,
    madeToOrderOnly: p.madeToOrderOnly,
  }));

  return (
    <div className="bg-[#0a0a0a] text-white">
      {/* —— Hero —— */}
      <section className="relative z-20 w-full overflow-hidden border-b border-white/[0.06]">
        <div className="absolute inset-0 pointer-events-none">
          <HeroZoom className="h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={company.heroImage}
              alt=""
              className="h-full w-full object-cover"
              fetchPriority="high"
            />
          </HeroZoom>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,10,10,0.94) 0%, rgba(10,10,10,0.78) 50%, rgba(10,10,10,0.45) 100%), linear-gradient(0deg, rgba(10,10,10,0.6) 0%, transparent 35%)",
          }}
        />

        <div
          className={`${WRAP} relative z-20 flex min-h-[520px] flex-col justify-center py-14 sm:min-h-[600px] lg:min-h-[680px]`}
        >
          <div className="grid items-center gap-10 lg:grid-cols-12 xl:gap-14">
            <div className="lg:col-span-7">
              <FadeUp>
                <Eyebrow>{company.heroBadge || "Taller artesanal · República Dominicana"}</Eyebrow>
              </FadeUp>
              <FadeUp delay={0.08}>
                <h1 className="font-display mt-4 max-w-2xl text-[clamp(2.3rem,4.2vw,4.2rem)] leading-[1.05] text-white">
                  {company.heroTitle}
                </h1>
              </FadeUp>
              <FadeUp delay={0.16}>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                  {company.heroSubtitle}
                </p>
              </FadeUp>
              <FadeUp delay={0.24}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/catalogo" className="store-cta store-cta-primary group">
                    Ver catálogo
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                  <Link href="/contacto" className="store-cta store-cta-ghost">
                    Cotizar a medida
                  </Link>
                </div>
              </FadeUp>
            </div>

            <div className="relative z-30 flex justify-center lg:col-span-5 lg:justify-end">
              <FadeUp delay={0.3} className="w-full flex justify-center lg:justify-end">
                <HeroSearchBar products={availableForSearch} />
              </FadeUp>
            </div>
          </div>
        </div>
      </section>

      {/* —— Franja de confianza —— */}
      <section className="border-b border-white/[0.06] bg-[#0c0c0c]">
        <div className={`${WRAP} grid grid-cols-2 lg:grid-cols-4`}>
          {TRUST.map((t, idx) => (
            <Reveal
              key={t.title}
              delay={idx * 0.06}
              className={`flex items-start gap-3 py-6 sm:items-center sm:gap-4 ${
                idx % 2 === 1 ? "pl-4 sm:pl-6" : "pr-4 sm:pr-6"
              } ${idx > 0 ? "lg:border-l lg:border-white/[0.06] lg:pl-8" : ""} ${
                idx < 2 ? "border-b border-white/[0.06] lg:border-b-0" : ""
              }`}
            >
              <t.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a15a] sm:mt-0" strokeWidth={1.6} />
              <div>
                <h2 className="text-[0.78rem] font-semibold text-white">{t.title}</h2>
                <p className="mt-0.5 text-xs leading-snug text-white/50">{t.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className={WRAP}>
        {/* —— Productos destacados —— */}
        <ProductShelf
          title="Destacados para ti"
          subtitle="Piezas emblemáticas seleccionadas por nuestro taller"
          href="/catalogo"
          products={featured}
        />

        {/* —— Categorías —— */}
        <section className="border-b border-white/[0.06] py-14 sm:py-16">
          <Reveal>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <Eyebrow>Categorías</Eyebrow>
                <h2 className="font-display mt-2 text-3xl text-white md:text-4xl">
                  Explora por estilo
                </h2>
              </div>
              <Link
                href="/catalogo"
                className="group hidden items-center gap-1.5 text-[0.68rem] font-semibold tracking-[0.14em] text-[#c9a15a] uppercase transition hover:text-[#d4b06e] sm:inline-flex"
              >
                Catálogo completo
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
            {categoryTiles.map((tile, i) => (
              <Reveal key={tile.title} delay={(i % 3) * 0.07}>
                <Link
                  href={tile.href}
                  className="group relative block aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-2xl bg-[#141414] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a15a]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={tile.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                    <div>
                      <p className="font-display text-lg leading-tight text-white sm:text-2xl">{tile.title}</p>
                      <p className="mt-1 text-xs text-white/70">{tile.text}</p>
                    </div>
                    <span className="hidden h-9 w-9 shrink-0 sm:flex items-center justify-center rounded-full border border-white/25 text-white transition-all duration-300 group-hover:border-[#c9a15a] group-hover:bg-[#c9a15a] group-hover:text-black">
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      </div>

      {/* —— Proceso + taller —— */}
      <section className="border-b border-white/[0.06] bg-[#0d0d0d] py-16 sm:py-20">
        <div className={WRAP}>
          <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-5">
              <Reveal>
                <Eyebrow>Oficio y sostenibilidad</Eyebrow>
                <h2 className="font-display mt-3 text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                  Del palet a tu hogar
                </h2>
                <p className="mt-4 max-w-md text-base leading-relaxed text-white/65">
                  Transformamos madera de pino recuperada en muebles de alta
                  resistencia, con acabados satinados al aceite natural.
                </p>
                <Link
                  href="/nosotros"
                  className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#c9a15a] transition hover:text-[#d4b06e]"
                >
                  Conoce nuestra historia
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Reveal>
              <Reveal delay={0.1} className="mt-8">
                <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={company.craftImage || "/brand/brand-wood-stamp.jpg"}
                    alt="Madera de palet con el logo de Mudeco Palets grabado a fuego"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
              </Reveal>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:col-span-7">
              {CRAFT_STEPS.map((step, idx) => (
                <Reveal
                  key={step.step}
                  delay={idx * 0.08}
                  className="bg-[#0d0d0d] p-7 sm:p-8"
                >
                  <div>
                    <span className="store-step-num">{step.step}</span>
                    <h3 className="font-display mt-4 text-2xl text-white">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">
                      {step.desc}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* —— Testimonios —— */}
      <section className="border-b border-white/[0.06] py-16 sm:py-20">
        <div className={WRAP}>
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <Eyebrow>Testimonios</Eyebrow>
              <h2 className="font-display mt-3 text-3xl text-white sm:text-4xl">
                Lo que dicen nuestros clientes
              </h2>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t, idx) => (
              <Reveal key={t.author} delay={idx * 0.08}>
                <figure className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.07] bg-[#111] p-7">
                  <div>
                    <div className="flex gap-0.5 text-[#c9a15a]" aria-label="5 de 5 estrellas">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-current" aria-hidden />
                      ))}
                    </div>
                    <blockquote className="mt-4 text-[0.95rem] leading-relaxed text-white/80">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  </div>
                  <figcaption className="mt-6 border-t border-white/[0.06] pt-5">
                    <p className="text-sm font-semibold text-white">{t.author}</p>
                    <p className="mt-0.5 text-xs text-white/45">{t.role}</p>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* —— Proyectos a medida —— */}
      <section className={`${WRAP} py-12 sm:py-16`}>
        <Reveal>
          <div className="store-vip-banner flex flex-col gap-8 rounded-3xl p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <Eyebrow>Proyectos especiales</Eyebrow>
              <h2 className="font-display mt-3 text-3xl text-white lg:text-4xl">
                ¿Tienes una idea en mente?
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-white/65 sm:text-base">
                Fabricamos a medida comedores, repisas, camas, barras y mobiliario
                comercial. Envíanos una foto de referencia y tus medidas para
                cotizarte sin compromiso.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={storeWhatsApp(
                  company.phone,
                  "Hola Mudeco Palets, tengo un diseño/foto en mente y me gustaría solicitar una cotización a medida.",
                )}
                target="_blank"
                rel="noreferrer"
                className="store-cta store-cta-primary"
              >
                <MessageCircle className="h-4 w-4" />
                Cotizar por WhatsApp
              </a>
              <Link href="/contacto" className="store-cta store-cta-ghost">
                <Ruler className="h-4 w-4" />
                Formulario
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: company.name,
            url: process.env.NEXT_PUBLIC_SITE_URL || "https://mudecopalets.com",
            potentialAction: {
              "@type": "SearchAction",
              target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://mudecopalets.com"}/catalogo?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }),
        }}
      />
      {/* —— Galería —— */}
      <section className="border-t border-white/[0.06] bg-[#0c0c0c] py-14">
        <div className={WRAP}>
          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <Eyebrow>Comunidad</Eyebrow>
              <h2 className="font-display mt-2 text-3xl text-white">Galería del taller</h2>
            </div>
            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#c9a15a] uppercase transition hover:text-[#d4b06e]"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>@mudeco_palets</span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {gallery.map((src, i) => (
              <Reveal key={`${src}-${i}`} delay={(i % 8) * 0.04} y={10}>
                <a
                  href={STORE_SOCIAL.instagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Ver foto ${i + 1} del taller en Instagram`}
                  className="group relative block aspect-square overflow-hidden rounded-xl bg-[#161616]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/55 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Camera className="h-5 w-5 text-white" />
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

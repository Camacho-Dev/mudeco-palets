import Link from "next/link";
import {
  Target,
  Eye,
  Gem,
  Sparkles,
  Leaf,
  Compass,
  Award,
  ArrowRight,
  Hammer,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { STORE_BRAND } from "@/lib/store-brand";

export const metadata = {
  title: "Nosotros · Filosofía, Misión y Valores",
  description:
    "Conoce la historia, misión, visión y valores de Mudeco Palets: ebanistería sostenible de madera recuperada en República Dominicana.",
};

export default async function NosotrosPage() {
  const company = await getStoreCompany();

  return (
    <div className="bg-[#0b0b0b] text-[#faf6f1] selection:bg-[#c9a15a] selection:text-black">
      {/* —— Hero Header Editorial —— */}
      <div className="relative overflow-hidden border-b border-white/[0.08] bg-[#0f0f0f] py-20 lg:py-28">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(/brand/store-craft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0f0f0f]/80 via-[#0f0f0f]/95 to-[#0b0b0b]" />
        
        {/* Glow dorado ambiental */}
        <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-[#c9a15a]/10 blur-[130px]" />

        <div className="relative mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-12 xl:px-16 text-center">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-[#c9a15a]/10 px-4 py-1.5 text-[0.68rem] font-bold tracking-[0.24em] text-[#c9a15a] uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Nuestra Historia & Propósito
            </div>
            <h1 className="font-display mt-5 text-4xl sm:text-5xl lg:text-6xl text-white tracking-tight">
              Muebles con alma, historia y sostenibilidad
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-white/65">
              {STORE_BRAND.tagline}
            </p>
          </Reveal>
        </div>
      </div>

      {/* —— Manifiesto & Historia de Marca —— */}
      <section className="relative border-b border-white/[0.06] py-20 lg:py-28">
        <div className="mx-auto grid max-w-[1760px] items-center gap-12 lg:grid-cols-12 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="relative order-2 lg:order-1 lg:col-span-6">
            <Reveal>
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#141414] p-3 shadow-2xl">
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/brand/store-craft.jpg"
                    alt={`Taller artesanal de ${company.name}`}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
                    <div>
                      <p className="text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                        Sello de Origen
                      </p>
                      <p className="font-display text-lg text-white">Ebanistería Circular Dominicana</p>
                    </div>
                    <span className="rounded-lg border border-[#c9a15a]/40 bg-black/70 px-3 py-1 text-xs font-semibold text-[#c9a15a] backdrop-blur-md">
                      Pino Curado 100%
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-6 space-y-6">
            <Reveal delay={0.08}>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.2em] text-[#c9a15a] uppercase">
                <Leaf className="h-4 w-4" />
                <span>Sobre {company.name}</span>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight text-white">
                Transformando el descarte en arte con valor perdurable
              </h2>
              <p className="text-base leading-relaxed text-white/75">
                {STORE_BRAND.about}
              </p>

              {/* 3 Sellos de Compromiso */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <Hammer className="h-5 w-5 text-[#c9a15a] mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Hecho a Mano</p>
                  <p className="text-[11px] text-white/50 mt-1">Sin moldes en serie, cada pieza es irrepetible.</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <ShieldCheck className="h-5 w-5 text-[#c9a15a] mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">Pino Curado</p>
                  <p className="text-[11px] text-white/50 mt-1">Tratamiento térmico ecológico contra plagas.</p>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <HeartHandshake className="h-5 w-5 text-[#c9a15a] mb-2" />
                  <p className="text-xs font-bold text-white uppercase tracking-wider">A Tu Medida</p>
                  <p className="text-[11px] text-white/50 mt-1">Adaptamos dimensiones a tu hogar o negocio.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* —— Los 3 Pilares Fundacionales: Misión, Visión y Valores —— */}
      <section className="relative border-b border-white/[0.06] bg-[#0f0f0f] py-24">
        <div className="mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[0.65rem] font-bold tracking-[0.24em] text-[#c9a15a] uppercase">
                Principios Rectores
              </span>
              <h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl text-white">
                Los Pilares que Guían Cada Creación
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/60">
                La visión, el compromiso social y los valores éticos que dan vida a cada corte en nuestro taller.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Pilar 1: Misión */}
            <Reveal delay={0.08}>
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#141414] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a15a]/50 hover:bg-[#181818] hover:shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_25px_rgba(201,161,90,0.1)]">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a15a]/30 bg-[#c9a15a]/10 text-[#c9a15a] transition duration-300 group-hover:bg-[#c9a15a] group-hover:text-black">
                      <Target className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <span className="rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                      Misión
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white group-hover:text-[#c9a15a] transition-colors">
                    Nuestra Misión
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {STORE_BRAND.mission}
                  </p>
                </div>
                <div className="mt-8 border-t border-white/[0.08] pt-4 flex items-center gap-2 text-xs font-medium text-[#c9a15a]">
                  <Leaf className="h-4 w-4" />
                  <span>Sostenibilidad y diseño consciente</span>
                </div>
              </div>
            </Reveal>

            {/* Pilar 2: Visión */}
            <Reveal delay={0.16}>
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#141414] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a15a]/50 hover:bg-[#181818] hover:shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_25px_rgba(201,161,90,0.1)]">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a15a]/30 bg-[#c9a15a]/10 text-[#c9a15a] transition duration-300 group-hover:bg-[#c9a15a] group-hover:text-black">
                      <Eye className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <span className="rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                      Visión
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white group-hover:text-[#c9a15a] transition-colors">
                    Nuestra Visión
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-white/70">
                    {STORE_BRAND.vision}
                  </p>
                </div>
                <div className="mt-8 border-t border-white/[0.08] pt-4 flex items-center gap-2 text-xs font-medium text-[#c9a15a]">
                  <Compass className="h-4 w-4" />
                  <span>Liderazgo circular en Latinoamérica</span>
                </div>
              </div>
            </Reveal>

            {/* Pilar 3: Valores */}
            <Reveal delay={0.24}>
              <div className="group relative flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#141414] p-8 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#c9a15a]/50 hover:bg-[#181818] hover:shadow-[0_20px_45px_rgba(0,0,0,0.7),0_0_25px_rgba(201,161,90,0.1)]">
                <div>
                  <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#c9a15a]/30 bg-[#c9a15a]/10 text-[#c9a15a] transition duration-300 group-hover:bg-[#c9a15a] group-hover:text-black">
                      <Gem className="h-7 w-7" strokeWidth={1.75} />
                    </div>
                    <span className="rounded-full border border-[#c9a15a]/30 bg-[#c9a15a]/10 px-3 py-1 text-[0.65rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
                      Valores
                    </span>
                  </div>
                  <h3 className="font-display text-2xl text-white group-hover:text-[#c9a15a] transition-colors">
                    Nuestros Valores
                  </h3>
                  <div className="mt-4 space-y-2.5 text-xs text-white/75">
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]">
                      <span className="font-semibold text-white">Sostenibilidad Integral:</span> Cerrando ciclos y reduciendo la huella ecológica.
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]">
                      <span className="font-semibold text-white">Autenticidad Artesanal:</span> Celebrando la imperfección y singularidad de la madera.
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]">
                      <span className="font-semibold text-white">Innovación Circular:</span> Convirtiendo descartes en piezas de alto valor estético.
                    </div>
                    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5 transition hover:bg-white/[0.04]">
                      <span className="font-semibold text-white">Calidad Perdurable:</span> Uniendo tradición ebanista con durabilidad para siempre.
                    </div>
                  </div>
                </div>
                <div className="mt-8 border-t border-white/[0.08] pt-4 flex items-center gap-2 text-xs font-medium text-[#c9a15a]">
                  <Award className="h-4 w-4" />
                  <span>Maestría y excelencia en cada detalle</span>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Botones de acción */}
          <Reveal className="mt-16 text-center" delay={0.28}>
            <div className="inline-flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/catalogo"
                className="group inline-flex items-center gap-2 rounded-lg border border-[#c9a15a] bg-[#c9a15a] px-8 py-3.5 text-xs font-bold tracking-[0.16em] uppercase text-black transition-all duration-300 hover:bg-[#d8b56f] hover:shadow-[0_0_25px_rgba(201,161,90,0.4)]"
              >
                <span>Explorar el Catálogo</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/[0.04] px-8 py-3.5 text-xs font-bold tracking-[0.16em] uppercase text-white transition-all duration-300 hover:border-[#c9a15a]/50 hover:bg-white/[0.08]"
              >
                <span>Solicitar Proyecto a Medida</span>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { STORE_BRAND } from "@/lib/store-brand";

export const metadata = { title: "Nosotros" };

export default async function NosotrosPage() {
  const company = await getStoreCompany();

  return (
    <div>
      <div className="relative overflow-hidden bg-[#2f2018] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: "url(/brand/store-craft.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#2f2018]/80" />
        <div className="relative mx-auto max-w-[1760px] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
              La marca
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl">Nosotros</h1>
            <p className="mt-3 max-w-2xl text-white/65">{STORE_BRAND.tagline}</p>
          </Reveal>
        </div>
      </div>

      <section className="bg-[#2f2018] text-[#faf6f1]">
        <div className="mx-auto grid max-w-[1760px] md:grid-cols-2 px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="relative min-h-[420px] overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/store-craft.jpg"
              alt="Taller Mudeco Palets"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-16 sm:px-12">
            <Reveal>
              <h2 className="font-display text-4xl leading-tight md:text-5xl">
                {company.name}
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/65">
                {STORE_BRAND.about}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1760px] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid gap-10 md:grid-cols-3">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-[#b0894f] uppercase">
              Misión
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--wood-800)]">
              {STORE_BRAND.mission}
            </p>
          </Reveal>
          <Reveal delay={0.08}>
            <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-[#b0894f] uppercase">
              Visión
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--wood-800)]">
              {STORE_BRAND.vision}
            </p>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="text-[0.7rem] font-semibold tracking-[0.16em] text-[#b0894f] uppercase">
              Valores
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--wood-800)]">
              {STORE_BRAND.values}
            </p>
          </Reveal>
        </div>
        <Reveal className="mt-12" delay={0.15}>
          <Link href="/catalogo" className="store-cta store-cta-primary">
            Ver catálogo
          </Link>
          <Link
            href="/contacto"
            className="ml-3 inline-flex border border-[var(--border)] px-5 py-3 text-[0.75rem] font-semibold tracking-[0.1em] uppercase"
          >
            Contáctanos
          </Link>
        </Reveal>
      </section>
    </div>
  );
}

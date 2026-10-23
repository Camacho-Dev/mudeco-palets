import Link from "next/link";
import { MessageCircle, ChevronRight, LayoutGrid } from "lucide-react";
import { Wrench, FileText, Hammer } from "lucide-react";
import { FadeUp, Reveal } from "@/components/store/store-motion";
import { ServiceRequestForm } from "@/components/store/service-request-form";
import { getStoreCompany } from "@/lib/store";
import { storeWhatsApp } from "@/lib/store-info";

export const metadata = { title: "Reparaciones y cotizaciones" };

const services = [
  {
    icon: Wrench,
    title: "Restauración",
    desc: "Recuperamos muebles deteriorados.",
  },
  {
    icon: FileText,
    title: "Cotizaciones",
    desc: "Fabricamos muebles totalmente personalizados.",
  },
  {
    icon: Hammer,
    title: "Taller propio",
    desc: "Trabajamos directamente la madera en nuestro taller.",
  },
] as const;

const steps = [
  {
    n: "01",
    t: "Describe tu proyecto",
    desc: "Dinos qué mueble necesitas o deseas restaurar, indicando medidas aproximadas y acabado.",
  },
  {
    n: "02",
    t: "Evaluación en taller",
    desc: "Analizamos viabilidad técnica, maderas óptimas y tiempo estimado de elaboración.",
  },
  {
    n: "03",
    t: "Propuesta formal",
    desc: "Te enviamos cotización detallada sin compromiso directo a tu WhatsApp o correo.",
  },
] as const;


export default async function ReparacionesPage() {
  const company = await getStoreCompany();
  const wa = storeWhatsApp(
    company.phone,
    "Hola, quiero enviar fotos para una cotización/reparación.",
  );

  return (
    <div className="bg-[#111111] text-white">
      {/* —— Hero —— */}
      <section className="relative isolate h-[550px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={company.workshopImage || "/brand/store-workshop.jpg"}
          alt="Taller artesanal de Mudeco Palets"
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(rgba(0,0,0,.70), rgba(0,0,0,.60))",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-center px-4 sm:px-6 lg:px-8">
          <FadeUp>
            <p className="text-[0.7rem] font-medium tracking-[0.28em] text-[#c9a15a] uppercase">
              Taller
            </p>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="font-display mt-4 max-w-3xl text-[clamp(2.75rem,6vw,4.75rem)] leading-[1.02] tracking-tight text-white">
              Reparaciones
              <br />
              <span className="text-[#c9a15a]">&amp;</span> Cotizaciones
            </h1>
          </FadeUp>
          <FadeUp delay={0.22}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#d7d7d7] sm:text-lg">
              ¿Tienes un mueble que necesita una segunda vida?
              <br />
              Restauramos, fabricamos y personalizamos muebles con madera
              recuperada.
            </p>
          </FadeUp>
          <FadeUp delay={0.34}>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#solicitar" className="store-cta store-cta-primary group">
                Solicitar ahora
                <ChevronRight
                  className="h-4 w-4 transition duration-300 group-hover:translate-x-0.5"
                  strokeWidth={1.75}
                />
              </a>
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="store-cta store-cta-ghost"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
                WhatsApp + Fotos
              </a>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* —— Beneficios —— */}
      <section className="border-b border-white/[0.08] bg-[#111111]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-10 sm:grid-cols-3 sm:px-6 sm:py-12 lg:px-8">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 0.08} y={18}>
              <div className="store-benefit-gold group h-full px-6 py-8 transition duration-300 hover:-translate-y-1">
                <s.icon
                  className="h-6 w-6 text-[#c9a15a] transition duration-300 group-hover:scale-110"
                  strokeWidth={1.35}
                />
                <h2 className="font-display mt-5 text-2xl text-white">
                  {s.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[#d7d7d7]">
                  {s.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* —— Formulario —— */}
      <section className="bg-[#f8f5f1] text-[#3b2a22]">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:py-24">
          <Reveal className="lg:col-span-5">
            <p className="text-[0.7rem] font-medium tracking-[0.24em] text-[#c9a15a] uppercase">
              Solicitud
            </p>
            <h2 className="font-display mt-4 text-4xl leading-tight text-[#111111] md:text-5xl">
              Envíanos tu proyecto
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-[#3b2a22]/75">
              Elige reparación o cotización, completa el formulario y lo
              recibimos en el taller. Sin compromiso.
            </p>

            <ol className="mt-10 space-y-5">
              {steps.map((step) => (
                <li key={step.n} className="flex items-start gap-4">
                  <span className="font-display text-2xl text-[#c9a15a] leading-none shrink-0 mt-0.5">
                    {step.n}
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-[#111111]">
                      {step.t}
                    </p>
                    <p className="text-xs text-[#3b2a22]/70 mt-0.5 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>


            <Link
              href="/catalogo"
              className="mt-12 inline-flex items-center gap-2 border border-[#111111]/25 px-6 py-3.5 text-[0.7rem] font-semibold tracking-[0.14em] text-[#111111] uppercase transition duration-300 hover:border-[#111111] hover:bg-[#111111] hover:text-white"
            >
              <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />
              Ver catálogo
            </Link>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="store-form-card">
              <ServiceRequestForm phone={company.phone} />
            </div>
            <p className="mt-6 text-center text-sm text-[#3b2a22]/60">
              ¿Tienes fotos?{" "}
              <a
                href={wa}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-[#3b2a22] underline underline-offset-4 transition hover:text-[#c9a15a]"
              >
                Envíalas por WhatsApp
              </a>{" "}
              para una cotización más precisa.
            </p>
          </Reveal>
        </div>
      </section>
    </div>
  );
}

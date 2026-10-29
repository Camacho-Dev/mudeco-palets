import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { ContactForm } from "@/components/store/contact-form";
import { STORE_HOURS, storeWhatsApp } from "@/lib/store-info";
import { STORE_SOCIAL } from "@/lib/store-brand";
import {
  Clock,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export const metadata = {
  title: "Contacto",
  description:
    "Contacta a Mudeco Palets: teléfono, WhatsApp, email y formulario.",
};

export default async function ContactoPage() {
  const company = await getStoreCompany();
  const phoneHref = `tel:${company.phone.replace(/[^\d+]/g, "")}`;
  const wa = storeWhatsApp(
    company.phone,
    `Hola ${company.name}, me gustaría más información sobre sus muebles.`,
  );
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(company.address)}`;

  return (
    <div className="bg-[#faf7f2]">
      {/* Banner principal con tono uniforme oscuro */}
      <div className="relative overflow-hidden border-b border-[#c9a15a]/20 bg-[#14100d] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url(/brand/store-hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#14100d] via-[#14100d]/90 to-[#14100d]/75" />
        <div className="relative mx-auto max-w-[1760px] px-4 py-14 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#c9a15a]/35 bg-[#c9a15a]/10 px-3.5 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-[#c9a15a] uppercase">
              <Sparkles className="h-3 w-3" />
              Hablemos · Atención Directa del Taller
            </div>
            <h1 className="font-display mt-3.5 text-4xl text-white md:text-5xl">
              Contacto
            </h1>
            <p className="mt-2.5 max-w-xl text-sm sm:text-base text-white/70">
              Estamos para ayudarte a elegir la pieza ideal del catálogo o
              cotizar un proyecto a medida para tu hogar o negocio.
            </p>
          </Reveal>
        </div>
      </div>

      {/* Contenido principal en 2 columnas balanceadas */}
      <div className="mx-auto grid max-w-[1760px] items-stretch gap-8 px-4 py-12 sm:px-8 lg:grid-cols-12 lg:px-12 xl:px-16">
        <Reveal className="lg:col-span-6 flex flex-col gap-4">
          {/* Cuadrícula de 2x2 para canales directos (sin espacios vacíos) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 transition hover:border-[#b0894f] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25 transition group-hover:bg-[#b0894f] group-hover:text-white">
                  <MessageCircle className="h-5 w-5" />
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[0.65rem] font-semibold text-emerald-700 border border-emerald-200">
                  Respuesta rápida
                </span>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-[var(--wood-950)] flex items-center justify-between">
                  <span>WhatsApp Taller</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b0894f]" />
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {company.phone}
                </p>
              </div>
            </a>

            <a
              href={phoneHref}
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 transition hover:border-[#b0894f] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25 transition group-hover:bg-[#b0894f] group-hover:text-white">
                  <Phone className="h-5 w-5" />
                </span>
                <span className="text-[0.65rem] font-medium tracking-wider text-[var(--muted)] uppercase">
                  Llamada directa
                </span>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-[var(--wood-950)] flex items-center justify-between">
                  <span>Teléfono</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b0894f]" />
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {company.phone}
                </p>
              </div>
            </a>

            <a
              href={`mailto:${company.email}`}
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 transition hover:border-[#b0894f] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25 transition group-hover:bg-[#b0894f] group-hover:text-white">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="text-[0.65rem] font-medium tracking-wider text-[var(--muted)] uppercase">
                  Correo oficial
                </span>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-[var(--wood-950)] flex items-center justify-between">
                  <span>Email</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b0894f]" />
                </p>
                <p className="mt-1 text-sm text-[var(--muted)] truncate">
                  {company.email}
                </p>
              </div>
            </a>

            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-[var(--border)] bg-white p-5 transition hover:border-[#b0894f] hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25 transition group-hover:bg-[#b0894f] group-hover:text-white">
                  <InstagramIcon className="h-5 w-5" />
                </span>
                <span className="text-[0.65rem] font-medium tracking-wider text-[var(--muted)] uppercase">
                  Portafolio real
                </span>
              </div>
              <div className="mt-4">
                <p className="font-semibold text-[var(--wood-950)] flex items-center justify-between">
                  <span>Instagram</span>
                  <ArrowUpRight className="h-4 w-4 text-[var(--muted)] transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#b0894f]" />
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  @mudeco_palets
                </p>
              </div>
            </a>
          </div>

          {/* Tarjeta inferior unificada de Ubicación y Horarios */}
          <div className="flex-1 rounded-xl border border-[var(--border)] bg-white p-6 flex flex-col justify-between gap-6">
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="group flex items-start gap-4 border-b border-[var(--border)] pb-5"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25 transition group-hover:bg-[#b0894f] group-hover:text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--wood-950)]">
                    Ubicación del Taller
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#b0894f] group-hover:underline">
                    Abrir en Google Maps
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <p className="mt-1 text-sm text-[var(--muted)] leading-relaxed">
                  {company.address}
                </p>
              </div>
            </a>

            <div className="flex items-start gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fbf7f2] text-[#b0894f] border border-[#b0894f]/25">
                <Clock className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-[var(--wood-950)]">
                  Horario de Atención
                </p>
                <ul className="mt-2.5 grid gap-1.5 text-sm text-[var(--muted)]">
                  {STORE_HOURS.map((h) => (
                    <li
                      key={h.day}
                      className="flex items-center justify-between border-b border-dashed border-black/[0.06] pb-1 last:border-none last:pb-0"
                    >
                      <span>{h.day}</span>
                      <span className="font-medium text-[var(--wood-900)]">
                        {h.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="lg:col-span-6 flex">
          <div className="w-full flex">
            <ContactForm />
          </div>
        </Reveal>
      </div>

      {/* Preguntas frecuentes para mayor confianza y profesionalismo */}
      <div className="border-t border-[var(--border)] bg-[#faf6f1] py-16">
        <div className="mx-auto max-w-[1760px] px-4 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <div className="max-w-2xl mb-10">
              <p className="text-[0.68rem] font-bold tracking-[0.2em] text-[#b0894f] uppercase">
                Atención & Asesoría
              </p>
              <h2 className="font-display mt-2 text-3xl text-[var(--wood-950)]">
                Preguntas Frecuentes
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                Respuestas rápidas sobre pedidos personalizados, tiempos de
                entrega y garantías de nuestro taller.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                q: "¿Cómo cotizo un mueble a medida?",
                a: "Puedes enviarnos las dimensiones aproximadas (largo, ancho y alto) y una foto de referencia por WhatsApp o mediante este formulario. Te responderemos con el presupuesto detallado y tiempo de entrega.",
              },
              {
                q: "¿Realizan envíos a todo el país?",
                a: "Sí, coordinamos entregas en todo Santo Domingo y el interior de República Dominicana. También puedes retirar personalmente en nuestro taller.",
              },
              {
                q: "¿La madera está tratada contra humedad y plagas?",
                a: "Todas nuestras piezas pasan por un proceso de lijado multicapa, curado inmunizante y sellado profesional de alta resistencia antes de salir del taller.",
              },
              {
                q: "¿Cuáles son los métodos de pago?",
                a: "Aceptamos transferencia bancaria (Banreservas, Popular, BHD) y efectivo. Los proyectos a medida se inician con un 50% de avance y el 50% restante contra entrega.",
              },
              {
                q: "¿Qué tiempo toma fabricar un pedido?",
                a: "Las piezas en inventario están listas para entrega inmediata. Los muebles fabricados bajo pedido o a medida toman entre 4 y 10 días laborables según complejidad.",
              },
              {
                q: "¿Emiten facturas con Comprobante Fiscal (NCF)?",
                a: "Sí, emitimos facturas válidas para Crédito Fiscal (B01) para empresas y de Consumo (B02) para clientes particulares.",
              },
            ].map((faq, idx) => (
              <Reveal key={faq.q} delay={idx * 0.05}>
                <div className="h-full border border-[var(--border)] bg-white p-6 rounded-xl shadow-xs hover:border-[#b0894f]/50 transition">
                  <h3 className="font-display text-lg font-medium text-[var(--wood-950)]">
                    {faq.q}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                    {faq.a}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { Reveal } from "@/components/store/store-motion";
import { STORE_LOGISTICS } from "@/lib/store-info";
import { getStoreCompany } from "@/lib/store";
import { ShieldCheck, Scale, Truck, Hammer, CreditCard, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Términos y Condiciones de Compra · Mudeco Palets",
  description:
    "Condiciones comerciales, garantías artesanales, tiempos de fabricación, envíos y facturación fiscal NCF en República Dominicana.",
};

export default async function TerminosPage() {
  const company = await getStoreCompany();

  const sections = [
    {
      icon: Hammer,
      title: "1. Naturaleza Artesanal y Madera Recuperada",
      body: `${STORE_LOGISTICS.materials} Todas nuestras maderas pasan por procesos de selección, cepillado, curado y sellado profesional en nuestro taller de Santo Domingo Oeste. Las variaciones naturales en vetas, nudos o matices de color son propias de la madera sólida y garantizan que cada mueble sea una pieza única.`,
    },
    {
      icon: CreditCard,
      title: "2. Precios, Facturación Fiscal (NCF) y Formas de Pago",
      body: `Todos los precios están expresados en Pesos Dominicanos (DOP / RD$). Las órdenes y facturas detallan el ITBIS (18%) conforme a la Dirección General de Impuestos Internos (DGII). Si requieres Comprobante de Crédito Fiscal (B01), indica tu RNC o Cédula al momento del checkout. ${STORE_LOGISTICS.payments}`,
    },
    {
      icon: Scale,
      title: "3. Pedidos a Medida, Anticipos y Cancelaciones",
      body: `Para proyectos personalizados o medidas especiales, elaboramos una cotización formal previa. La orden de fabricación inicia una vez confirmado el anticipo acordado (habitualmente 50%) o el pago total. Debido al corte de madera a medida para cada cliente, las cancelaciones posteriores al inicio del corte o ensamblado en taller no son reembolsables en el costo de materiales ya procesados.`,
    },
    {
      icon: Truck,
      title: "4. Tiempos de Entrega y Retiro en Taller",
      body: `${STORE_LOGISTICS.leadTime} ${STORE_LOGISTICS.pickup} ${STORE_LOGISTICS.delivery} El cliente debe verificar que los accesos (puertas, escaleras o ascensores) permitan el ingreso de las dimensiones solicitadas.`,
    },
    {
      icon: ShieldCheck,
      title: "5. Garantía de Taller y Cuidado del Mueble",
      body: `Ofrecemos garantía estructural sobre uniones, herrajes y ensamblaje en condiciones normales de uso doméstico o comercial interior. ${STORE_LOGISTICS.care} La garantía no cubre daños ocasionados por exposición a intemperie sin tratamiento exterior contratado, golpes de mudanza externa o modificaciones por terceros.`,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <div className="relative overflow-hidden border-b border-[#c9a15a]/25 bg-[#14100d] text-[#faf6f1]">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
          <p className="text-[0.65rem] font-bold tracking-[0.22em] text-[#c9a15a] uppercase">
            Marco Comercial · República Dominicana
          </p>
          <h1 className="font-display mt-2 text-3xl text-white sm:text-5xl">
            Términos y Condiciones de Compra
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Transparencia en cada etapa: desde la selección de la madera en el
            taller de {company.name} hasta la entrega en tu espacio.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-8">
        <Reveal>
          <div className="space-y-5">
            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <section
                  key={s.title}
                  className="rounded-2xl border border-[#e5d8c8] bg-white p-6 shadow-xs sm:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#c9a15a]/35 bg-[#faf6f1] text-[#b0894f]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-display text-xl text-[var(--wood-950)]">
                        {s.title}
                      </h2>
                      <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </section>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e5d8c8] bg-[#14100d] p-6 text-white">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-[#c9a15a] uppercase">
                ¿Tienes dudas sobre una medida o envío?
              </p>
              <p className="mt-1 text-xs text-white/75">
                {company.name} · {company.address} · {company.phone}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/20 px-4 py-2.5 text-xs font-semibold tracking-wider text-white uppercase transition hover:border-white/40"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Catálogo
              </Link>
              <Link
                href="/contacto"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#c9a15a] px-5 py-2.5 text-xs font-bold tracking-wider text-[#0f0f0f] uppercase transition hover:bg-[#d4b06e]"
              >
                Hablar con el taller
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

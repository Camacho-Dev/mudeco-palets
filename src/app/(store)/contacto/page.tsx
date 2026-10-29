import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { ContactForm } from "@/components/store/contact-form";
import { STORE_HOURS, storeWhatsApp } from "@/lib/store-info";
import { STORE_SOCIAL } from "@/lib/store-brand";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

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
    <div>
      <div className="relative overflow-hidden bg-[#2f2018] text-[#faf6f1]">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: "url(/brand/store-hero.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-[#2f2018]/80" />
        <div className="relative mx-auto max-w-[1760px] px-4 py-16 sm:px-8 lg:px-12 xl:px-16">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
              Hablemos
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl">Contacto</h1>
            <p className="mt-3 max-w-lg text-white/65">
              Estamos para ayudarte a elegir la pieza ideal o cotizar un
              proyecto a tu medida.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1760px] gap-10 px-4 py-14 sm:px-8 lg:px-12 xl:px-16 lg:grid-cols-2">
        <Reveal>
          <div className="space-y-2 border border-[var(--border)] bg-white p-2">
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <Phone className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">WhatsApp</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {company.phone} · Escribir ahora
                </p>
              </div>
            </a>
            <a
              href={phoneHref}
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <Phone className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Teléfono</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{company.phone}</p>
              </div>
            </a>
            <a
              href={`mailto:${company.email}`}
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <Mail className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Email</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{company.email}</p>
              </div>
            </a>
            <a
              href={STORE_SOCIAL.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <InstagramIcon className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Instagram</p>
                <p className="mt-1 text-sm text-[var(--muted)]">@mudeco_palets · Seguir en Instagram →</p>
              </div>
            </a>
            <a
              href={maps}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-4 p-5 transition hover:bg-[#fbf7f2]"
            >
              <MapPin className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Ubicación</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {company.address}
                </p>
                <p className="mt-1 text-xs text-[#b0894f]">Abrir en Maps →</p>
              </div>
            </a>
            <div className="flex items-start gap-4 p-5">
              <Clock className="mt-0.5 h-5 w-5 text-[#b0894f]" />
              <div>
                <p className="font-medium text-[var(--wood-950)]">Horario</p>
                <ul className="mt-2 space-y-1 text-sm text-[var(--muted)]">
                  {STORE_HOURS.map((h) => (
                    <li key={h.day} className="flex justify-between gap-4">
                      <span>{h.day}</span>
                      <span>{h.hours}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <ContactForm />
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
                Preguntas frecuentes antes de ordenar
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg text-[var(--wood-950)]">
                  ¿Cómo puedo cotizar un diseño personalizado o a medida?
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Envíanos una foto de referencia (de Pinterest, catálogo o Instagram) junto con el ancho, alto y profundidad aproximados. Te elaboramos un presupuesto sin compromiso en menos de 24 horas.
                </p>
              </div>

              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg text-[var(--wood-950)]">
                  ¿Hacen entregas en Santo Domingo y al interior del país?
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Sí. Contamos con transporte y acarreo directo para el Gran Santo Domingo, y servicio de envío consolidado debidamente embalado para Santiago, Punta Cana, La Romana y el resto del país.
                </p>
              </div>

              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg text-[var(--wood-950)]">
                  ¿Qué tratamiento tiene la madera de palets?
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Utilizamos madera de pino seleccionada tratada contra la carcoma, termitas y humedad. Cada pieza se cepilla, sella e impermeabiliza con acabados satinados de alta resistencia al uso diario.
                </p>
              </div>

              <div className="border border-[var(--border)] bg-white p-6 shadow-sm">
                <h3 className="font-display text-lg text-[var(--wood-950)]">
                  ¿Cuáles son las formas de pago aceptadas?
                </h3>
                <p className="mt-2 text-sm text-[var(--muted)] leading-relaxed">
                  Aceptamos transferencias bancarias en Banco Popular, Banreservas y Banco BHD, así como pago en efectivo al retirar en nuestro taller o contra entrega coordinada.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

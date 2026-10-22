import { Reveal } from "@/components/store/store-motion";
import { getStoreCompany } from "@/lib/store";
import { ContactForm } from "@/components/store/contact-form";
import { STORE_HOURS, storeWhatsApp } from "@/lib/store-info";
import { Clock, Mail, MapPin, Phone } from "lucide-react";

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
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <p className="text-[0.7rem] font-semibold tracking-[0.2em] text-[#b0894f] uppercase">
              Hablemos
            </p>
            <h1 className="font-display mt-3 text-4xl md:text-5xl">Contacto</h1>
            <p className="mt-3 max-w-lg text-white/65">
              Estamos para ayudarte a elegir la pieza ideal o evaluar una
              reparación.
            </p>
          </Reveal>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2">
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
    </div>
  );
}
